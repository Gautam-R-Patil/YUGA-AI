// AI4Bharat Models
export const MODEL_EN_INDIC = "ai4bharat/indictrans2-en-indic-1B";
export const MODEL_INDIC_EN = "ai4bharat/indictrans2-indic-en-1B";

// Supported Languages Configuration
export const SUPPORTED_LANGUAGES = {
    'english': {
        code: 'en-IN', name: 'English', sttCode: 'en-IN',
        ttsVoice: { languageCode: "en-IN", name: "en-IN-Standard-D", ssmlGender: "FEMALE" },
        googleCode: 'en', indicCode: 'eng_Latn'
    },
    'hindi': {
        code: 'hi-IN', name: 'Hindi', sttCode: 'hi-IN',
        ttsVoice: { languageCode: "hi-IN", name: "hi-IN-Neural2-A", ssmlGender: "FEMALE" },
        googleCode: 'hi', indicCode: 'hin_Deva'
    },
    'bengali': {
        code: 'bn-IN', name: 'Bengali', sttCode: 'bn-IN',
        ttsVoice: { languageCode: "bn-IN", name: "bn-IN-Standard-A", ssmlGender: "FEMALE" },
        googleCode: 'bn', indicCode: 'ben_Beng'
    },
    'malayalam': {
        code: 'ml-IN', name: 'Malayalam', sttCode: 'ml-IN',
        ttsVoice: { languageCode: "ml-IN", name: "ml-IN-Standard-A", ssmlGender: "FEMALE" },
        googleCode: 'ml', indicCode: 'mal_Mlym'
    },
    'telugu': {
        code: 'te-IN', name: 'Telugu', sttCode: 'te-IN',
        ttsVoice: { languageCode: "te-IN", name: "te-IN-Standard-A", ssmlGender: "FEMALE" },
        googleCode: 'te', indicCode: 'tel_Telu'
    },
    'marathi': {
        code: 'mr-IN', name: 'Marathi', sttCode: 'mr-IN',
        ttsVoice: { languageCode: "mr-IN", name: "mr-IN-Standard-A", ssmlGender: "FEMALE" },
        googleCode: 'mr', indicCode: 'mar_Deva'
    },
    'tamil': {
        code: 'ta-IN', name: 'Tamil', sttCode: 'ta-IN',
        ttsVoice: { languageCode: "ta-IN", name: "ta-IN-Standard-A", ssmlGender: "FEMALE" },
        googleCode: 'ta', indicCode: 'tam_Taml'
    },
    'kannada': {
        code: 'kn-IN', name: 'Kannada', sttCode: 'kn-IN',
        ttsVoice: { languageCode: "kn-IN", name: "kn-IN-Standard-A", ssmlGender: "FEMALE" },
        googleCode: 'kn', indicCode: 'kan_Knda'
    },
    'gujarati': {
        code: 'gu-IN', name: 'Gujarati', sttCode: 'gu-IN',
        ttsVoice: { languageCode: "gu-IN", name: "gu-IN-Standard-A", ssmlGender: "FEMALE" },
        googleCode: 'gu', indicCode: 'guj_Gujr'
    }
};

// NEET-specific keywords to boost recognition accuracy
export const NEET_KEYWORDS = [
    "Biomolecules", "Equilibrium", "Stoichiometry", "Kinematics", "Thermodynamics",
    "Photosynthesis", "Respiration", "Genetics", "Evolution", "Electrostatics",
    "Magnetism", "Optics", "Organic Chemistry", "Inorganic Chemistry", "Periodic Table",
    "Coordination Compounds", "Aldehydes", "Ketones", "Carboxylic Acids", "Amines",
    "Polymers", "Hydrocarbons", "Solutions", "Electrochemistry", "Chemical Kinetics",
    "Surface Chemistry", "Metallurgy", "P-Block", "D-Block", "F-Block",
    "Reproduction", "Human Health", "Disease", "Biotechnology", "Ecology", "Environment",
    "Structure of Atom", "Chemical Bonding", "State of Matter", "Redox Reactions",
    "Solid State", "Haloalkanes", "Haloarenes", "Alcohols", "Phenols", "Ethers",
    "Cell Cycle", "Cell Division", "Plant Kingdom", "Animal Kingdom", "Morphology",
    "Anatomy", "Structural Organisation", "Transport in Plants", "Mineral Nutrition",
    "Digestion", "Absorption", "Breathing", "Exchange of Gases", "Body Fluids",
    "Circulation", "Excretory Products", "Locomotion", "Movement", "Neural Control",
    "Coordination", "Chemical Coordination", "Integration",
    "What is", "Define", "Explain", "How to", "Solve", "Calculate", "Difference between"
];
