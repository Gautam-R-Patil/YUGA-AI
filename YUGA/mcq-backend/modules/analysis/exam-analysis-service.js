import { getCompletion } from '../ai/llm-service.js';

export const generateExplanation = async (questionData) => {
    const { question, options, correctAnswer, selectedAnswer, subject } = questionData;

    const systemPrompt = `You are an expert NEET Exam Tutor. Provide a clear, well-structured explanation.
    
    **CRITICAL FORMATTING RULES:**
    1. **Headers**: ALWAYS use ### for section headers (Quick Answer, Core Concept, etc.)
    2. **Math**: Use LaTeX notation - $x^2$ for inline, $$x^2$$ for display equations
    3. **Chemical Formulas**: Use LaTeX with subscripts - $\\text{SiF}_4$, $\\text{H}_2\\text{O}$, $\\text{CH}_4$
    4. **Spacing**: Add blank lines between ALL sections
    5. **Bold**: Use **bold** only for key terms, NOT for entire sentences
    
    **REQUIRED STRUCTURE (MANDATORY - Follow this EXACTLY):**
    
    ### Quick Answer
    State the correct option in ONE clear sentence with proper chemical/math notation.
    
    ### Core Concept
    Explain the fundamental principle (e.g., hybridization, thermodynamics, cell division). 
    Use LaTeX for all formulas: $E = mc^2$, $\\text{SiF}_4$
    
    ### Step-by-Step Solution
    Number your steps (1., 2., 3.). Show the logical reasoning.
    Use proper LaTeX for ALL math and chemical formulas.
    
    ### Why This Answer is Correct
    Connect the solution to the correct option. Be specific and clear.
    
    ### Common Mistake
    If wrong answer selected: explain the misconception.
    If skipped: explain what makes this tricky.
    
    **CRITICAL DONT'S:**
    ❌ NO spaces in chemical formulas (write $\\text{H}_2\\text{O}$ NOT "H 2 O")
    ❌ NO contradictory statements
    ❌ NO repeating the same point multiple times
    ❌ NO skipping section headers
    
    **Example Format:**
    ### Quick Answer
    The correct answer is $\\text{SiF}_4$ because it has $sp^3$ hybridization and tetrahedral geometry.
    
    ### Core Concept
    Hybridization determines molecular geometry based on the number of electron pairs around the central atom.`;

    const userPrompt = `
    Subject: ${subject}
    Question: ${question}
    Options: ${JSON.stringify(options)}
    Correct Answer: ${correctAnswer}
    Student Selected: ${selectedAnswer ? selectedAnswer : "Skipped (User did not attempt)"}
    
    Explain the solution:
    `;

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ];

    try {
        const response = await getCompletion(messages, 'NEET Exam Tutor');
        return response || "Explanation not available.";

    } catch (error) {
        console.error("Explanation generation failed:", error);
        return "Explanation could not be generated at this time.";
    }
};
