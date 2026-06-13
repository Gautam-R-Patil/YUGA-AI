import dotenv from 'dotenv';
import { getCompletion } from '../ai/llm-service.js';
import { calculateStudentScore } from '../learning-analytics/analytics-service.js';
dotenv.config();

// LLM interactions are now handled via getCompletion from llm-service.js

// Generate assessment questions based on subject strengths
export const generateAssessmentQuestions = async (subjectStrengths) => {
    const hasMath = !!subjectStrengths?.mathematics;
    const hasBio = !!subjectStrengths?.biology;
    const isBoth = hasMath && hasBio;
    const isJEE = hasMath && !hasBio;

    let prompt = "";
    let totalQuestions = 10;

    if (isBoth) {
        totalQuestions = 16;
        prompt = `Generate 16 multiple-choice questions for a JEENEET (PCMB) preparation assessment with the following distribution:
        - 4 questions from Physics
        - 4 questions from Chemistry
        - 4 questions from Biology (Botany & Zoology)
        - 4 questions from Mathematics
        
        **Student's Subject Strengths**:
        - Physics: ${subjectStrengths?.physics || 'average'}
        - Chemistry: ${subjectStrengths?.chemistry || 'average'}
        - Biology: ${subjectStrengths?.biology || 'average'}
        - Mathematics: ${subjectStrengths?.mathematics || 'average'}
        `;
    } else {
        // Fixed distribution as per requirements: 
        // NEET: 3 Physics, 3 Chemistry, 4 Biology
        // JEE: 3 Physics, 3 Chemistry, 4 Mathematics
        const physicsCount = 3;
        const chemistryCount = 3;
        const bioOrMathCount = 4;

        prompt = `Generate 10 multiple-choice questions for ${isJEE ? 'JEE' : 'NEET'} preparation assessment with the following distribution:
        - ${physicsCount} questions from Physics (mechanics, thermodynamics, electromagnetism, or optics)
        - ${chemistryCount} questions from Chemistry (organic chemistry, inorganic chemistry, or physical chemistry)
        - ${bioOrMathCount} questions from ${isJEE ? 'Mathematics (Calculus, Algebra, Coordinate Geometry, Trigonometry)' : 'Biology (Botany & Zoology: plant physiology, genetics, human physiology, or animal diversity)'}
        
        **IMPORTANT**: The student rated their strengths as:
        - Physics: ${subjectStrengths?.physics || 'average'}
        - Chemistry: ${subjectStrengths?.chemistry || 'average'}
        - ${isJEE ? `Mathematics: ${subjectStrengths?.mathematics || 'average'}` : `Biology: ${subjectStrengths?.biology || 'average'}`}
        `;
    }

    prompt += `
    Generate MORE questions for WEAK subjects to properly assess their knowledge gaps.
    
    **CRITICAL FOR PHYSICS QUESTIONS**:
    - Physics questions MUST be NON-NUMERICAL and CONCEPTUAL
    - Avoid questions requiring calculations, formulas, or numerical problem-solving
    - Focus on understanding of concepts, principles, laws, and their applications
    - Students may not have pen and paper, so questions should be answerable through conceptual understanding only
    - Examples: "Which law explains...", "What happens when...", "Which principle is demonstrated by..."
    - Avoid: "Calculate the force...", "Find the velocity...", "What is the numerical value..."
    
    For each question, provide:
    1. The question text
    2. Four options (A, B, C, D)
    3. The correct answer index (0-3)
    4. Difficulty level (easy, medium, hard)
    5. Subject and Sub-category
    
    Format the response as a JSON array with this structure:
    [
      {
        "id": 1,
        "subject": "Physics",
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "difficulty": "medium"
      }
    ]
    
    Make questions appropriate for ${isBoth ? 'Grade 11/12' : isJEE ? 'JEE Mains' : 'NEET'} level.
    IMPORTANT: Return ONLY the JSON array, no other text.`;

    let text = await getCompletion([
        {
            role: "system",
            content: `You are an expert ${isJEE ? 'JEE' : 'NEET'} exam question generator. Always respond with valid JSON only.`
        },
        {
            role: "user",
            content: prompt
        }
    ], `${isJEE ? 'JEE' : 'NEET'} Assessment Generator`, 'general', false);

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }

    let questions = JSON.parse(text);

    // STRICT ENFORCEMENT: Ensure exactly 10 questions
    if (Array.isArray(questions) && questions.length > (isBoth ? 16 : 10)) {
        questions = questions.slice(0, (isBoth ? 16 : 10));
    }

    return questions;
};

// Generate personalized study schedule
export const generateStudySchedule = async (data) => {
    const {
        availability,
        subjectStrengths,
        assessmentResults,
        daysUntilExam,
        studentClass,
        currentDate,
        currentTime,
        userId
    } = data;

    const hasMath = !!subjectStrengths?.mathematics;
    const hasBio = !!subjectStrengths?.biology;
    const isBoth = hasMath && hasBio;
    const isJEE = hasMath && !hasBio;

    // Determine class level and adjust content accordingly
    const isPlusOne = studentClass === 'plus-one';
    const isRepeater = studentClass === 'repeater';

    let classLevel = 'Plus Two (12th Grade)';
    if (isPlusOne) classLevel = 'Plus One (11th Grade)';
    if (isRepeater) classLevel = 'Repeater (Full Syllabus)';

    // Adjust syllabus based on class
    const syllabus11 = {
        physics: 'Units and Measurements, Motion in a Straight Line, Motion in a Plane, Laws of Motion, Work Energy and Power, System of Particles, Gravitation, Mechanical Properties of Solids, Mechanical Properties of Fluids, Thermal Properties of Matter, Thermodynamics, Kinetic Theory, Oscillations, Waves',
        chemistry: 'Some Basic Concepts of Chemistry, Structure of Atom, Classification of Elements, Chemical Bonding, States of Matter, Thermodynamics, Equilibrium, Redox Reactions, Hydrogen, s-Block Elements, p-Block Elements, Organic Chemistry Basics, Hydrocarbons, Environmental Chemistry',
        botany: 'The Living World, Biological Classification, Plant Kingdom, Morphology of Flowering Plants, Anatomy of Flowering Plants, Cell Structure, Biomolecules, Cell Cycle, Transport in Plants, Mineral Nutrition, Photosynthesis, Respiration, Plant Growth',
        zoology: 'Animal Kingdom, Structural Organisation in Animals, Biomolecules, Digestion and Absorption, Breathing and Exchange of Gases, Body Fluids and Circulation, Excretory Products, Locomotion and Movement, Neural Control, Chemical Coordination',
        mathematics: 'Sets, Relations and Functions, Trigonometric Functions, PMI, Complex Numbers, Linear Inequalities, Permutations and Combinations, Binomial Theorem, Sequence and Series, Straight Lines, Conic Sections, 3D Geometry, Limits and Derivatives, Mathematical Reasoning, Statistics, Probability'
    };

    const syllabus12 = {
        physics: 'Electric Charges and Fields, Electrostatic Potential, Current Electricity, Moving Charges and Magnetism, Magnetism and Matter, Electromagnetic Induction, Alternating Current, Electromagnetic Waves, Ray Optics, Wave Optics, Dual Nature of Radiation, Atoms, Nuclei, Semiconductor Electronics, Communication Systems',
        chemistry: 'Solid State, Solutions, Electrochemistry, Chemical Kinetics, Surface Chemistry, General Principles of Metallurgy, p-Block Elements, d and f Block Elements, Coordination Compounds, Haloalkanes and Haloarenes, Alcohols Phenols and Ethers, Aldehydes Ketones and Carboxylic Acids, Amines, Biomolecules, Polymers, Chemistry in Everyday Life',
        botany: 'Reproduction in Organisms, Sexual Reproduction in Flowering Plants, Human Reproduction, Reproductive Health, Principles of Inheritance, Molecular Basis of Inheritance, Evolution, Human Health and Disease, Strategies for Enhancement, Microbes in Human Welfare, Biotechnology Principles, Biotechnology Applications, Organisms and Populations, Ecosystem, Biodiversity and Conservation, Environmental Issues',
        zoology: 'Reproduction in Organisms, Sexual Reproduction in Flowering Plants, Human Reproduction, Reproductive Health, Principles of Inheritance, Molecular Basis of Inheritance, Evolution, Human Health and Disease, Strategies for Enhancement, Microbes in Human Welfare, Biotechnology Principles, Biotechnology Applications, Organisms and Populations, Ecosystem, Biodiversity and Conservation, Environmental Issues',
        mathematics: 'Relations and Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity and Differentiability, Applications of Derivatives, Integrals, Applications of Integrals, Differential Equations, Vector Algebra, 3D Geometry, Linear Programming, Probability'
    };

    let syllabus = syllabus12; // Default to 12th
    if (isPlusOne) {
        syllabus = syllabus11;
    } else if (isRepeater) {
        // Combine both for repeater
        syllabus = {
            physics: `${syllabus11.physics}, ${syllabus12.physics}`,
            chemistry: `${syllabus11.chemistry}, ${syllabus12.chemistry}`,
            botany: `${syllabus11.botany}, ${syllabus12.botany}`,
            zoology: `${syllabus11.zoology}, ${syllabus12.zoology}`,
            mathematics: `${syllabus11.mathematics}, ${syllabus12.mathematics}`
        };
    }

    const prompt = `You are an expert ${isBoth ? 'JEE & NEET' : isJEE ? 'JEE' : 'NEET'} preparation coach. Generate a detailed weekly study schedule based strictly on the user's availability and current time.

**Temporal Context (Real-time Sync):**
- Current Date: ${currentDate || new Date().toISOString().split('T')[0]}
- Current Time: ${currentTime || new Date().toLocaleTimeString()}
- Start the schedule from ${currentDate ? "THIS DATE" : "today"}.
- **DURATION**: Generate a schedule for **EXACTLY 7 DAYS** starting from the start date. Do NOT go beyond 7 days.

**Student Profile:**
- Class: ${classLevel}
- Daily Study Hours Config: ${availability.dailyHours ? JSON.stringify(availability.dailyHours) : availability.hoursPerDay + " hours per day"}
- Daily Time Slots Preference: ${availability.dailyTimeSlots ? JSON.stringify(availability.dailyTimeSlots) : "Use general preferred slots"}
- Daily Slot Specific Times: ${availability.dailySlotRanges ? JSON.stringify(availability.dailySlotRanges) : "Default"}
- Available days: ${availability.availableDays.join(', ')} (Generate schedule for these days ONLY)
- Preferred time slots (General): ${availability.preferredTimeSlots.join(', ')}
- Preferred session duration: ${availability.sessionDuration || 30} minutes
- Days until exam: ${daysUntilExam}

**Subject Strengths:**
- Physics: ${subjectStrengths.physics || 'average'}
- Chemistry: ${subjectStrengths.chemistry || 'average'}
${isBoth
            ? `- Biology: ${subjectStrengths.biology || 'average'}\n- Mathematics: ${subjectStrengths.mathematics || 'average'}`
            : isJEE
                ? `- Mathematics: ${subjectStrengths.mathematics || 'average'}`
                : `- Biology: ${subjectStrengths.biology || 'average'}`}

**Assessment Performance:**
${assessmentResults ? `- Assessment Score: ${assessmentResults.score}/${assessmentResults.total}
- Weak areas identified: ${assessmentResults.weakAreas?.join(', ') || 'None'}` : 'No immediate assessment data'}

**Personalization Profile:**
- **Overall Academic Score**: ${await calculateStudentScore(userId)}/100
- **Interpretation**:
  - Score < 50: Needs significant support. Prioritize foundational concepts, easier problems, and more revision.
  - Score 50-75: Standard curriculum with balanced difficulty.
  - Score > 75: Advanced learner. Include challenging problems and accelerated pace.

**Requirements:**
1. **Real-time Sync**:
   - **Step 1**: Check if 'Today' (${(new Date(currentDate)).toLocaleDateString('en-US', { weekday: 'long' })}) is in the "Available days" list.
   - **Case A (Today NOT Available)**: SKIP Today completely. DO NOT include it in the generated JSON. Start the schedule directly on the first upcoming day that IS in "Available days".
   - **Case B (Today IS Available)**: STRICTLY enforce real-time scheduling.
     - **Action**: Convert 'Current Time' (${currentTime}) to 24-hour format (e.g., 1:30 PM -> 13:30).
     - **Action**: For each requested slot (e.g., "09:00-11:00"), compare its **Start Time** (09:00) with Current Time.
     - **Constraint**: If 'Slot Start Time' < 'Current Time', **SKIP THIS SLOT ENTIRELY**.
     - **Constraint**: The **FIRST session of Today** MUST start **AFTER** the Current Time (allow a 15 min buffer).
     - If ALL slots are in the past, leave Today empty and move to the next available day.
   - **CRITICAL**: The output schedule must ONLY contain days from "Available days".
2. **Availability**: Create a study plan ONLY for the days listed in "Available days". **NEVER** schedule sessions on days NOT listed here.
   - If a day within the 7-day cycle is NOT in "Available days", simply omit it from the array or return it with an empty sessions list.
   - **DO NOT** generate a schedule for the *next* occurrence of a day (e.g. Next Saturday) if it falls outside the 7-day window.
   - **EXAMPLE**: If Today is Saturday and cycle is 7 days, generate for [Sat, Sun, Mon, Tue, Wed, Thu, Fri]. Do NOT include the *next* Saturday.
3. **Daily Customization**:
   - For each day, STRICTLY follow the 'Daily Study Hours Config' and 'Daily Slot Specific Times'.
   - **Exception for Today**: As mentioned in Rule #1, ignore strict slot times if they are in the past. For all other days, strictly enforce them.
4. **Session Length**: Each study session should be approximately ${availability.sessionDuration || 30} minutes long.
5. **Prioritization**: Allocate MORE time to WEAK subjects and LESS to STRONG subjects.
6. **Syllabus**: Include specific chapters, topics, and subtopics ONLY from the provided syllabus.
7. **Best Practices**: Include mock test sessions, breaks, and active recall.

**${classLevel} ${isBoth ? 'JEE & NEET' : isJEE ? 'JEE' : 'NEET'} Syllabus (USE ONLY THESE TOPICS):**
- Physics: ${syllabus.physics}
- Chemistry: ${syllabus.chemistry}
${isBoth
            ? `- Biology (Botany): ${syllabus.botany}\n- Biology (Zoology): ${syllabus.zoology}\n- Mathematics: ${syllabus.mathematics}`
            : isJEE
                ? `- Mathematics: ${syllabus.mathematics}`
                : `- Botany: ${syllabus.botany}\n- Zoology: ${syllabus.zoology}`
        }

Format the response as a JSON object with this structure:
{
  "schedule": [
    {
      "day": 1,
      "dayName": "Monday",
      "date": "YYYY-MM-DD", // Add the specific date
      "totalHours": ${availability.hoursPerDay}, // Or specific daily hours
      "sessions": [
        {
          "time": "HH:MM AM/PM - HH:MM AM/PM",
          "duration": "${availability.sessionDuration || 30} minutes",
          "subject": "Physics",
          "chapter": "Mechanics",
          "topic": "Laws of Motion",
          "subtopics": ["Newton's Laws", "Free Body Diagrams", "Applications"],
          "activities": ["NCERT Reading", "Solve Examples", "Practice Problems"],
          "breakAfter": "${availability.sessionDuration >= 60 ? '15 min' : '10 min'}"
        }
      ],
      "mockTest": {
        "time": "8:00 PM - 9:00 PM",
        "subjects": ["Physics", "Chemistry"],
        "topics": ["Covered today"]
      }
    }
  ],
  "weeklyGoals": ["Goal 1", "Goal 2"],
  "studyTips": ["Tip 1", "Tip 2"]
}

Generate a comprehensive, personalized schedule that maximizes learning efficiency.
IMPORTANT: Return ONLY the JSON object, no other text.`;

    let text = await getCompletion([
        {
            role: "system",
            content: `You are an expert ${isJEE ? 'JEE' : 'NEET'} study planner. Always respond with valid JSON only.`
        },
        {
            role: "user",
            content: prompt
        }
    ], `${isBoth ? 'JEE & NEET' : isJEE ? 'JEE' : 'NEET'} Study Planner`, 'general', false);

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }

    return JSON.parse(text);
};

// Customize schedule
export const customizeSchedule = async (schedule, modifications) => {
    const prompt = `Given this study schedule:
${JSON.stringify(schedule, null, 2)}

Apply these modifications:
${JSON.stringify(modifications, null, 2)}

Return the updated schedule in the same JSON format, ensuring:
1. Time slots don't overlap
2. Total daily hours match the user's availability
3. Subject distribution remains balanced
4. All modifications are properly integrated

IMPORTANT: Return ONLY the JSON object, no other text.`;

    let text = await getCompletion([
        {
            role: "system",
            content: "You are an expert NEET study planner. Always respond with valid JSON only."
        },
        {
            role: "user",
            content: prompt
        }
    ], 'NEET Study Planner', 'general', false);

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }
    return JSON.parse(text);
};
