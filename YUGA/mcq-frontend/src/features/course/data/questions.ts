import { MCQQuestion } from "../types";

export const neetChemistryQuestions: MCQQuestion[] = [
    {
        id: 'NEET-CHEM-MCQ-1',
        question: 'Which of the following elements has the highest electron affinity?',
        options: [
            'Fluorine',
            'Chlorine',
            'Bromine',
            'Iodine'
        ],
        correctAnswer: 'Chlorine',
        explanation: "**Core Concept:**\nTrends in electron affinity within the halogen group.\n\n**Why this answer:**\nAlthough Fluorine is more electronegative, Chlorine has a higher electron affinity because its larger 3p orbital can accommodate an extra electron with less repulsion than Fluorine's compact 2p orbital.\n\n**Common Mistakes:**\nAssuming Fluorine has the highest electron affinity simply because it is the most electronegative element.",
        basicAnswer: 'The answer is Chlorine because it has the highest electron affinity in the halogen group due to its optimal atomic size.',
        subject: 'NEET Chemistry MCQs',
        topic: 'Periodic Table'
    },
    {
        id: 'NEET-CHEM-MCQ-2',
        question: 'In the reaction: CaCO₃ → CaO + CO₂, what type of chemical reaction is taking place?',
        options: [
            'Combination reaction',
            'Decomposition reaction',
            'Displacement reaction',
            'Neutralization reaction'
        ],
        correctAnswer: 'Decomposition reaction',
        explanation: "**Core Concept:**\nClassification of chemical reactions based on reactant/product relationships.\n\n**Why this answer:**\nIt is a decomposition reaction because a single reactant (CaCO₃) breaks down into two or more products (CaO and CO₂) when heated.\n\n**Common Mistakes:**\nThinking it's a combination reaction by looking at the products first, or confusing it with displacement without an active displacement agent.",
        basicAnswer: 'The answer is Decomposition reaction because a single compound (CaCO₃) breaks down into two separate substances (CaO and CO₂).',
        subject: 'NEET Chemistry MCQs',
        topic: 'Chemical Reactions'
    },
    {
        id: 'NEET-CHEM-MCQ-3',
        question: 'Which of the following is a strong acid?',
        options: [
            'Hydrochloric acid',
            'Acetic acid',
            'Carbonic acid',
            'Citric acid'
        ],
        correctAnswer: 'Hydrochloric acid',
        explanation: "**Core Concept:**\nStrength of acids based on the degree of ionization in water.\n\n**Why this answer:**\nHydrochloric acid is a strong acid because it dissociates completely into H⁺ and Cl⁻ ions in aqueous solution. The others are weak organic acids.\n\n**Common Mistakes:**\nThinking all acids found in food (like citric acid) are strong because they taste sour.",
        basicAnswer: 'The answer is Hydrochloric acid because it is a strong acid that ionizes completely in water, unlike the other weak acids listed.',
        subject: 'NEET Chemistry MCQs',
        topic: 'Acids, Bases and Salts'
    },
    {
        id: 'NEET-CHEM-MCQ-4',
        question: 'Which of the following is an example of a covalent compound?',
        options: [
            'Sodium chloride',
            'Water',
            'Calcium oxide',
            'Potassium bromide'
        ],
        correctAnswer: 'Water',
        explanation: "**Core Concept:**\nChemical bonding types (Ionic vs. Covalent).\n\n**Why this answer:**\nWater (H₂O) is a covalent compound formed by the sharing of electrons between non-metallic oxygen and hydrogen atoms. Others involve metal-nonmetal ionic transfers.\n\n**Common Mistakes:**\nClassifying all compounds found in nature as ionic, or assuming all liquids are covalent.",
        basicAnswer: 'The answer is Water because it is formed by the sharing of electrons between non-metal atoms (Hydrogen and Oxygen).',
        subject: 'NEET Chemistry MCQs',
        topic: 'Chemical Bonding'
    },
    {
        id: 'NEET-CHEM-MCQ-5',
        question: 'The IUPAC name of CH₃-CH₂-CHO is:',
        options: [
            'Propanal',
            'Propanone',
            'Ethanal',
            'Butanal'
        ],
        correctAnswer: 'Propanal',
        explanation: "**Core Concept:**\nIUPAC nomenclature for organic compounds containing functional groups.\n\n**Why this answer:**\nThe chain has 3 carbons (prop-) and an aldehyde group (-CHO), which takes the suffix '-al'. Thus, it is Propanal.\n\n**Common Mistakes:**\nConfusing the aldehyde suffix '-al' with the ketone suffix '-one', or miscounting the carbon chain length.",
        basicAnswer: 'The answer is Propanal because the prefix \'prop-\' indicates three carbon atoms and the suffix \'-al\' represents the aldehyde group.',
        subject: 'NEET Chemistry MCQs',
        topic: 'Organic Chemistry'
    }
];

export const neetBiologyQuestions: MCQQuestion[] = [
    {
        id: 'NEET-BIO-MCQ-1',
        question: 'Which of the following is NOT a function of the liver?',
        options: [
            'Production of bile',
            'Detoxification',
            'Storage of glycogen',
            'Production of insulin'
        ],
        correctAnswer: 'Production of insulin',
        explanation: "**Core Concept:**\nEndocrine vs. digestive/metabolic functions of major human organs.\n\n**Why this answer:**\nInsulin is produced by the beta cells of the Islets of Langerhans in the pancreas, not by the liver. The liver performs the other three functions.\n\n**Common Mistakes:**\nThinking the liver produces insulin because it stores glucose as glycogen, a process regulated by insulin.",
        basicAnswer: 'The answer is Production of insulin because insulin is a hormone produced by the pancreas, not the liver.',
        subject: 'NEET Biology MCQs',
        topic: 'Human Physiology'
    },
    {
        id: 'NEET-BIO-MCQ-2',
        question: 'In humans, which blood vessel carries oxygenated blood from the lungs to the heart?',
        options: [
            'Pulmonary artery',
            'Pulmonary vein',
            'Aorta',
            'Superior vena cava'
        ],
        correctAnswer: 'Pulmonary vein',
        explanation: "**Core Concept:**\nDeviations from standard circulatory vessel roles in pulmonary circulation.\n\n**Why this answer:**\nThe Pulmonary vein is the exception that carries oxygenated blood from lungs to heart. All other veins typically carry deoxygenated blood.\n\n**Common Mistakes:**\nGeneralizing that all veins carry deoxygenated blood and thus picking 'Pulmonary artery' instead.",
        basicAnswer: 'The answer is Pulmonary vein because it is the specialized vessel that transports oxygenated blood from the lungs to the heart.',
        subject: 'NEET Biology MCQs',
        topic: 'Human Physiology'
    },
    {
        id: 'NEET-BIO-MCQ-3',
        question: 'Which plant hormone is responsible for cell elongation and bending towards light?',
        options: [
            'Gibberellin',
            'Cytokinin',
            'Abscisic acid',
            'Auxin'
        ],
        correctAnswer: 'Auxin',
        explanation: "**Core Concept:**\nPhototropism and hormonal regulation of plant growth.\n\n**Why this answer:**\nAuxin accumulates on the shaded side of a plant shoot, causing cell elongation there and resulting in the plant bending towards the light source.\n\n**Common Mistakes:**\nConfusing Auxin with Gibberellin, which also influences growth but primarily via stem elongation rather than phototropic bending.",
        basicAnswer: 'The answer is Auxin because it is the primary plant hormone that regulates cell elongation and facilitates growth towards light.',
        subject: 'NEET Biology MCQs',
        topic: 'Plant Physiology'
    },
    {
        id: 'NEET-BIO-MCQ-4',
        question: 'Which part of human brain controls heart rate and breathing?',
        options: [
            'Medulla oblongata',
            'Cerebellum',
            'Cerebrum',
            'Hypothalamus'
        ],
        correctAnswer: 'Medulla oblongata',
        explanation: "**Core Concept:**\nFunctional specialization of the brainstem in regulating autonomic life processes.\n\n**Why this answer:**\nThe Medulla oblongata contains vital centers for regulating heart rate, respiratory rhythm, and blood pressure.\n\n**Common Mistakes:**\nPicking 'Cerebellum' (balance) or 'Cerebrum' (higher thinking) because they are larger parts of the brain.",
        basicAnswer: 'The answer is Medulla oblongata because it is the vital part of the brainstem that governs cardiac and respiratory rhythms.',
        subject: 'NEET Biology MCQs',
        topic: 'Human Physiology'
    },
    {
        id: 'NEET-BIO-MCQ-5',
        question: 'Which blood cells produce antibodies to fight infections?',
        options: [
            'Platelets',
            'B lymphocytes',
            'T lymphocytes',
            'Red blood cells'
        ],
        correctAnswer: 'B lymphocytes',
        explanation: "**Core Concept:**\nHumoral immunity and the role of specialized white blood cells.\n\n**Why this answer:**\nB lymphocytes (or B cells) differentiate into plasma cells that produce and secrete specific antibodies to neutralize pathogens.\n\n**Common Mistakes:**\nConfusing B cells with T cells (cell-mediated immunity) or thinking all white blood cells produce antibodies.",
        basicAnswer: 'The answer is B lymphocytes because they are the white blood cells responsible for secreting antibodies to neutralize pathogens.',
        subject: 'NEET Biology MCQs',
        topic: 'Immunology'
    }
];

export const neetPhysicsQuestions: MCQQuestion[] = [
    {
        id: 'NEET-PHY-MCQ-1',
        question: 'A convex lens of focal length 20 cm is placed in contact with a concave lens of focal length 10 cm. The power of the combination is:',
        options: [
            '-5 D',
            '+5 D',
            '-15 D',
            '+15 D'
        ],
        correctAnswer: '-5 D',
        explanation: "**Core Concept:**\nPower of a lens system in contact (P = P₁ + P₂).\n\n**Why this answer:**\nPower P = 1/f(meters). P(convex) = 1/0.2 = +5D. P(concave) = 1/(-0.1) = -10D. Resultant Power = 5 - 10 = -5 D.\n\n**Common Mistakes:**\nForgetting to convert focal length from cm to meters, or using the wrong sign for the concave lens focal length.",
        basicAnswer: 'The answer is -5 D because total power is the sum of the convex lens power (+5 D) and the concave lens power (-10 D).',
        subject: 'NEET Physics MCQs',
        topic: 'Optics'
    },
    {
        id: 'NEET-PHY-MCQ-2',
        question: 'A square loop of side 10 cm carrying a current of 2 A is placed in a uniform magnetic field of 0.5 T. What is the maximum torque acting on the loop?',
        options: [
            '0.01 N⋅m',
            '0.02 N⋅m',
            '0.05 N⋅m',
            '0.10 N⋅m'
        ],
        correctAnswer: '0.01 N⋅m',
        explanation: "**Core Concept:**\nMagnetic torque on a current-carrying planar loop (τ = NIAB sinθ).\n\n**Why this answer:**\nMax torque occurs when sinθ = 1. τ = 1 * 2A * (0.1m * 0.1m) * 0.5T = 0.01 N⋅m.\n\n**Common Mistakes:**\nSquaring the side incorrectly or forgetting to use Area (m²) instead of the side length (cm) in the formula.",
        basicAnswer: 'The answer is 0.01 N⋅m based on the formula τ = NIAB, using the given current, area of the loop, and magnetic field strength.',
        subject: 'NEET Physics MCQs',
        topic: 'Electromagnetism'
    },
    {
        id: 'NEET-PHY-MCQ-3',
        question: 'Which of the following is a fundamental force in nature?',
        options: [
            'Gravitational force',
            'Frictional force',
            'Tension',
            'Normal force'
        ],
        correctAnswer: 'Gravitational force',
        explanation: "**Core Concept:**\nPrimitive vs. derived forces in classic and modern physics.\n\n**Why this answer:**\nGravitation is one of the four fundamental forces. Friction, tension, and normal forces are all contact forces derived from electromagnetic interactions.\n\n**Common Mistakes:**\nAssuming all forces encountered in daily life (like friction) are 'fundamental' to nature's framework.",
        basicAnswer: 'The answer is Gravitational force because it is one of the four basic forces that cannot be reduced to any other interaction.',
        subject: 'NEET Physics MCQs',
        topic: 'Mechanics'
    },
    {
        id: 'NEET-PHY-MCQ-4',
        question: 'Which law states that energy cannot be created or destroyed?',
        options: [
            'Hooke law',
            'Faraday law',
            'Law of conservation of energy',
            'Newton second law'
        ],
        correctAnswer: 'Law of conservation of energy',
        explanation: "**Core Concept:**\nThermodynamics and the principle of energy invariance in isolated systems.\n\n**Why this answer:**\nThe First Law of Thermodynamics, or the Law of Conservation of Energy, states that total energy remains constant though it transforms forms.\n\n**Common Mistakes:**\nConfusing conservation of energy with conservation of momentum or mass.",
        basicAnswer: 'The answer is Law of conservation of energy as it dictates that total energy in a closed system is always constant while changing forms.',
        subject: 'NEET Physics MCQs',
        topic: 'Thermodynamics'
    },
    {
        id: 'NEET-PHY-MCQ-5',
        question: 'Which of the following is the SI unit of power?',
        options: [
            'Joule',
            'Newton',
            'Watt',
            'Pascal'
        ],
        correctAnswer: 'Watt',
        explanation: "**Core Concept:**\nMetric system standards for measuring work rate.\n\n**Why this answer:**\nThe Watt (W) is defined as one Joule per second (J/s), which is the work done over units of time.\n\n**Common Mistakes:**\nMixing up Joule (the unit of work/energy) with Watt (the unit of power).",
        basicAnswer: 'The answer is Watt because it is the standard metric unit for measuring the rate of energy consumption or work done.',
        subject: 'NEET Physics MCQs',
        topic: 'Mechanics'
    }
];
