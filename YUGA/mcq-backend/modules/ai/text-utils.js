import { processScientificText } from './scientific-tts.js';

// Helper function to convert numbers to words (for TTS pronunciation)
function numberToWords(num) {
    if (num === 0) return 'zero';

    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    function convertLessThanThousand(n) {
        if (n === 0) return '';

        let result = '';

        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' hundred ';
            n %= 100;
        }

        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n >= 10) {
            result += teens[n - 10] + ' ';
            return result.trim();
        }

        if (n > 0) {
            result += ones[n] + ' ';
        }

        return result.trim();
    }

    if (num < 1000) {
        return convertLessThanThousand(num);
    }

    let result = '';
    const billion = Math.floor(num / 1000000000);
    const million = Math.floor((num % 1000000000) / 1000000);
    const thousand = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    if (billion > 0) {
        result += convertLessThanThousand(billion) + ' billion ';
    }
    if (million > 0) {
        result += convertLessThanThousand(million) + ' million ';
    }
    if (thousand > 0) {
        result += convertLessThanThousand(thousand) + ' thousand ';
    }
    if (remainder > 0) {
        result += convertLessThanThousand(remainder);
    }

    return result.trim();
}

// Enhanced helper to preprocess text for better speech synthesis
export function preprocessTextForTTS(text) {
    if (!text) return "";

    // 1. STRICT SCIENTIFIC CONVERSION (Run this first to protect formulas & English)
    let processedText = processScientificText(text);

    return processedText
        // Handle literal \n and newline characters first
        .replace(/\\n/g, '. ')
        .replace(/[\r\n]+/g, '. ')

        // Convert comma-separated numbers to words (e.g., "20,000" -> "twenty thousand")
        .replace(/\b\d{1,3}(?:,\d{3})+\b/g, (m) => numberToWords(parseInt(m.replace(/,/g, ''))))

        // Convert plain large integers (4+ digits) to words (e.g., "20000" -> "twenty thousand")
        .replace(/\b\d{4,}\b/g, (m) => numberToWords(parseInt(m)))

        // 1. Numerical Minus (e.g., "5-2" or "5 - 2") - treat as arithmetic
        .replace(/(\d+)\s*-\s*(\d+)/g, '$1 minus $2')

        // 2. Structural Hyphens (bullet points or word separators like "Topic - Subject")
        .replace(/\s+-\s+/g, ', ')
        .replace(/^-\s+/gm, ', ')
        .replace(/([a-zA-Z])\s*-\s*([a-zA-Z])/g, '$1, $2') // Word - Word -> Word pause Word

        // Remove markdown formatting
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`/g, '')

        // Logic / implication arrows (avoid TTS reading these as "arrow")
        .replace(/=>/g, ' implies ')
        .replace(/->/g, ' implies ')
        .replace(/⇒/g, ' implies ')

        // Prevent words like "Thus", "Therefore", "Substituting" from sounding like headings
        // Remove these words when they appear at the start of a line or after a colon (as if they're headers)
        .replace(/\bThus[,:]\s*/gi, '')
        .replace(/\bTherefore[,:]\s*/gi, '')
        .replace(/\bSubstituting[,:]\s*/gi, '')
        .replace(/\bHence[,:]\s*/gi, '')
        .replace(/\bSo[,:]\s*/gi, '')

        // Abbreviations
        .replace(/\betc\.?/gi, ' etcetera ')

        // Commonly mispronounced chemistry terms (phonetic corrections)
        .replace(/\bmolarity\b/gi, 'moh-lair-ity')
        .replace(/\bmolality\b/gi, 'moh-lal-ity')
        .replace(/\bmolal\b/gi, 'moh-lal')
        .replace(/\bmolar\b/gi, 'moh-lar')

        // Fix pronunciation of 'ion' and 'ions'
        .replace(/\bions\b/gi, ' eye-ons ')
        .replace(/\bion\b/gi, ' eye-on ')

        // Common chemical formulas (NEET specific)
        // (Removed specific hardcoded chemicals as scientific engine handles this universally now)
        // Subscripts (generic digits and alphabetic clusters)
        // (Handled by scientific-tts engine now)
        // LaTeX-style subscripts (leftovers not caught by keywords)
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/_\{([^}]+)\}/g, ' $1')
        .replace(/_([a-z0-9])/gi, ' $1')

        // Specific Units (NEET/JEE common units)
        // These MUST come before general superscript/subscript expansion

        // Units with NEGATIVE SUPERSCRIPTS (space-separated format)
        // These are common in scientific notation: "g cm⁻³", "mol L⁻¹", etc.
        .replace(/\bg\s+cm⁻³/g, ' grams per cubic centi meter')
        .replace(/\bg\s*cm⁻³/g, ' grams per cubic centi meter')
        .replace(/\bkg\s+m⁻³/g, ' kilograms per cubic meter')
        .replace(/\bkg\s*m⁻³/g, ' kilograms per cubic meter')
        .replace(/\bmol\s+L⁻¹/g, ' moles per liter')
        .replace(/\bmol\s*L⁻¹/g, ' moles per liter')
        .replace(/\bmolecules\s+mol⁻¹/g, ' molecules per mole')
        .replace(/\bmolecules\s*mol⁻¹/g, ' molecules per mole')
        .replace(/\bg\s+mol⁻¹/g, ' grams per mole')
        .replace(/\bg\s*mol⁻¹/g, ' grams per mole')
        .replace(/\bm\s+s⁻¹/g, ' meters per second')
        .replace(/\bm\s*s⁻¹/g, ' meters per second')
        .replace(/\bm\s+s⁻²/g, ' meters per second squared')
        .replace(/\bm\s*s⁻²/g, ' meters per second squared')
        .replace(/\brad\s+s⁻¹/g, ' radians per second')
        .replace(/\brad\s*s⁻¹/g, ' radians per second')
        .replace(/\bJ\s+mol⁻¹/g, ' joules per mole')
        .replace(/\bJ\s*mol⁻¹/g, ' joules per mole')
        .replace(/\bJ\s+K⁻¹/g, ' joules per kelvin')
        .replace(/\bJ\s*K⁻¹/g, ' joules per kelvin')

        // Standalone inverse units
        .replace(/\bcm⁻³\b/g, ' per cubic centi meter')
        .replace(/\bm⁻³\b/g, ' per cubic meter')
        .replace(/\bmol⁻¹\b/g, ' per mole')
        .replace(/\bL⁻¹\b/g, ' per liter')
        .replace(/\bs⁻¹\b/g, ' per second')
        .replace(/\bs⁻²\b/g, ' per second squared')
        .replace(/\bK⁻¹\b/g, ' per kelvin')

        // Units with SLASH format (original handlers)
        .replace(/m\/s²/g, ' meters per second squared')
        .replace(/ms⁻²/g, ' meters per second squared')
        .replace(/m\/s/g, ' meters per second')
        .replace(/ms⁻¹/g, ' meters per second')
        .replace(/km\/h/g, ' kilometers per hour')
        .replace(/g\/cm³/g, ' grams per cubic centi meter')
        .replace(/kg\/m³/g, ' kilograms per cubic meter')
        .replace(/J\/K/g, ' joules per kelvin')
        .replace(/mol\/L/g, ' moles per liter')
        .replace(/rad\/s/g, ' radians per second')
        .replace(/beats\/s/g, ' beats per second')
        .replace(/N\/m/g, ' newtons per meter')
        .replace(/V\/m/g, ' volts per meter')
        .replace(/A\/m²/g, ' amperes per square meter')
        .replace(/W\/m²/g, ' watts per square meter')
        .replace(/°C/g, ' degrees celsius')
        .replace(/°F/g, ' degrees fahrenheit')

        // Greek letters (core NEET/JEE)
        .replace(/α/g, ' alpha ')
        .replace(/β/g, ' beta ')
        .replace(/γ/g, ' gamma ')
        .replace(/θ/g, ' theta ')
        .replace(/Θ/g, ' theta ')
        .replace(/λ/g, ' lambda ')
        .replace(/Λ/g, ' lambda ')
        .replace(/μ/g, ' mu ')
        .replace(/η/g, ' eta ')
        .replace(/ρ/g, ' rho ')
        .replace(/ω/g, ' omega ')
        .replace(/Ω/g, ' omega ')
        .replace(/σ/g, ' sigma ')
        .replace(/Σ/g, ' summation ')
        .replace(/ε/g, ' epsilon ')
        .replace(/φ/g, ' phi ')
        .replace(/Φ/g, ' phi ')
        .replace(/ϕ/g, ' phi ')
        .replace(/ψ/g, ' psi ')
        .replace(/Ψ/g, ' psi ')
        .replace(/π/g, ' pi ')
        .replace(/Π/g, ' pi ')
        .replace(/χ/g, ' chi ')
        .replace(/κ/g, ' kappa ')
        .replace(/υ/g, ' upsilon ')
        .replace(/Υ/g, ' upsilon ')

        // Generic formula pattern: Symbol/Symbol or Word/Word should be "by" (e.g., d/t, distance/time)
        .replace(/([a-zA-Z]+)\s*\/\s*([a-zA-Z]+)/g, '$1 by $2')

        // Parenthesized negative numbers and implicit multiplication
        // e.g., 4(-2) → "4 times minus 2", (-2) → "minus 2"
        .replace(/(\d)\s*\(\s*-\s*(\d+)\s*\)/g, '$1 times minus $2')
        .replace(/\(\s*-\s*(\d+)\s*\)/g, ' minus $1 ')
        // General parentheses: just remove them for cleaner speech
        .replace(/\(/g, ' ').replace(/\)/g, ' ')

        // Arithmetic (for numbers)
        .replace(/\+/g, ' plus ')
        // Standalone minus before a number (negative sign)
        .replace(/-\s*(\d)/g, ' negative $1')
        .replace(/\*/g, ' multiplied by ')
        .replace(/×/g, ' multiplied by ')
        .replace(/\//g, ' divided by ')
        .replace(/÷/g, ' divided by ')
        .replace(/=/g, ' equals ')
        .replace(/≠/g, ' not equal to ')
        .replace(/≈/g, ' approximately equal to ')
        .replace(/≃/g, ' approximately equal to ')
        .replace(/≡/g, ' identically equal to ')
        .replace(/≤/g, ' less than or equal to ')
        .replace(/≥/g, ' greater than or equal to ')
        .replace(/±/g, ' plus or minus ')
        .replace(/%/g, ' percent ')

        // Powers, roots, logs
        .replace(/\^/g, ' to the power of ')
        .replace(/√/g, ' square root of ')
        .replace(/∛/g, ' cube root of ')
        .replace(/∜/g, ' fourth root of ')
        .replace(/\blog\b/gi, ' log base ten ')
        .replace(/\bln\b/gi, ' natural log ')

        // Constants, angles
        .replace(/°/g, ' degrees ')
        .replace(/rad\b/gi, ' radians ')

        // Calculus
        .replace(/∫/g, ' integral of ')
        .replace(/∑/g, ' summation of ')
        .replace(/∏/g, ' product of ')
        .replace(/∂/g, ' partial derivative ')
        .replace(/∆/g, ' change in ')
        .replace(/Δ/g, ' delta ')
        .replace(/∞/g, ' infinity ')

        // Vectors / geometry (→ used as "implies" per user preference for chemistry/math context)
        .replace(/→/g, ' implies ')
        .replace(/↔/g, ' if and only if ')
        .replace(/⊥/g, ' perpendicular to ')
        .replace(/‖/g, ' parallel to ')
        .replace(/\|/g, ' modulus of ')
        .replace(/∠/g, ' angle ')
        .replace(/∘/g, ' composed with ')

        // Set theory
        .replace(/∈/g, ' belongs to ')
        .replace(/∉/g, ' does not belong to ')
        .replace(/⊂/g, ' subset of ')
        .replace(/⊆/g, ' subset or equal to ')
        .replace(/⊃/g, ' superset of ')
        .replace(/⊇/g, ' superset or equal to ')
        .replace(/∩/g, ' intersection ')
        .replace(/∪/g, ' union ')
        .replace(/∝/g, ' proportional to ')

        // Chemistry symbols (reaction arrows - note: → already replaced above as 'implies')
        .replace(/⟶/g, ' gives ')
        .replace(/⇌/g, ' in equilibrium with ')
        .replace(/↑/g, ' gas is evolved ')
        .replace(/↓/g, ' precipitate formed ')

        // Misc
        .replace(/·/g, ' dot ')

        // Add natural pauses for better comprehension
        // Preserve decimal numbers: don't add space after period if surrounded by digits
        // Convert decimal numbers: integer part in words, fractional part as individual digits
        // e.g., 101.325 → "one hundred one point three two five"
        .replace(/(\d+)\.(\d+)/g, (match, intPart, fracPart) => {
            // Convert integer part to words
            const intWords = numberToWords(parseInt(intPart, 10));
            // Split fractional part into individual digits with spaces
            const fracDigits = fracPart.split('').join(' ');
            return `${intWords} point ${fracDigits}`;
        })
        // Convert standalone integers to words (not part of decimals)
        // e.g., 101 → "one hundred one"
        .replace(/\b(\d+)\b/g, (match, num) => {
            const n = parseInt(num, 10);
            // Only convert reasonable numbers; very large numbers might be IDs
            if (n <= 999999999) {
                return numberToWords(n);
            }
            return match;
        })
        .replace(/\.(?!\d)/g, '. ')  // Pause after sentences (but not in numbers)
        .replace(/,(?!\d)/g, ', ')   // Slight pause after commas (but not in numbers like 1,000)
        .replace(/:/g, ': ')   // Pause after colons
        .replace(/;/g, '; ')   // Pause after semicolons

        // Clean spacing
        .replace(/\s+/g, ' ')
        .replace(/([.,]\s*){2,}/g, '. ')
        .trim();
}

// Helper to chunk text
export function chunkText(text, maxLength = 1500) {
    const chunks = [];
    let currentChunk = '';
    const sentences = text.match(/[^.!?\u0964]+[.!?\u0964]+|[^.!?\u0964]+$/g) || [text];

    for (const sentence of sentences) {
        if (sentence.length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            let remaining = sentence;
            while (remaining.length > 0) {
                chunks.push(remaining.substring(0, maxLength));
                remaining = remaining.substring(maxLength);
            }
        }
        else if ((currentChunk + sentence).length > maxLength) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
}

// Apply keyword substitutions for accurate TTS pronunciation
// keywords: object with abbreviation -> full term mappings (e.g., {"K.E.": "Kinetic Energy", "J": "Joules"})
export function applyKeywordSubstitutions(text, keywords = {}) {
    if (!keywords || Object.keys(keywords).length === 0) {
        return text;
    }

    let processedText = text;

    // Sort keys by length (longest first) to avoid partial replacements
    // E.g., replace "K.E." before "K" to prevent incorrect substitutions
    const sortedKeys = Object.keys(keywords).sort((a, b) => b.length - a.length);

    // Use a temporary replacement system to avoid double-substitutions
    // We'll replace keywords with markers, then replace markers with final terms
    const markers = [];
    const values = [];

    for (let i = 0; i < sortedKeys.length; i++) {
        const abbreviation = sortedKeys[i];
        const fullTerm = keywords[abbreviation];

        // Skip if the full term is empty or not a string
        if (!fullTerm || typeof fullTerm !== 'string') {
            continue;
        }

        // Escape special regex characters in the abbreviation
        const escapedAbbr = abbreviation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create regex that matches the abbreviation - allow flexible whitespace if there are spaces in the key
        let regex;
        const flexibleWhitespaceAbbr = escapedAbbr.replace(/\\ /g, '\\s+');

        if (abbreviation.length === 1) {
            // For single letters/symbols, use negative lookahead to NOT match if followed by .E or another dot+letter
            // Check if it's a special symbol that can't use word boundaries
            if (/[^a-zA-Z0-9]/.test(abbreviation)) {
                // Special symbols: match them with proper spacing
                if (abbreviation === '+' || abbreviation === '-') {
                    regex = new RegExp(`${flexibleWhitespaceAbbr}(?=\\s|$)`, 'g');
                } else {
                    regex = new RegExp(flexibleWhitespaceAbbr, 'g');
                }
            } else {
                // Regular letters: use word boundaries. 
                // CRITICAL: Use 'g' instead of 'gi' for case sensitivity in physics (M vs m)
                regex = new RegExp(
                    `\\b${flexibleWhitespaceAbbr}(?!\\.E|\\.[A-Z])\\b(?!\\s*\\([^)]*${fullTerm})`,
                    'g'
                );
            }
        } else {
            // For multi-character abbreviations, match them with word boundaries if they are letters/numbers
            if (/^[a-zA-Z0-9]+$/.test(abbreviation)) {
                regex = new RegExp(`\\b${flexibleWhitespaceAbbr}\\b`, 'g');
            } else {
                regex = new RegExp(flexibleWhitespaceAbbr, 'g');
            }
        }

        const marker = `\uE000${i}\uE001`;
        let replacementValue = fullTerm;

        // Custom replacer function to avoid "Tension (Tension)" when the term is already nearby
        const newText = processedText.replace(regex, (match, offset, fullString) => {
            // Formula context protection: Don't replace 1-letter variables if they're in a calculation context (f/m, v^2, 2a)
            // But ALLOW units like 'N' in '10 N' or 'm' in '5 m'
            if (abbreviation.length === 1 && /[a-z]/.test(abbreviation)) {
                const charBeforeWindow = fullString.substring(Math.max(0, offset - 5), offset);
                const charAfterWindow = fullString.substring(offset + match.length, offset + match.length + 5);
                
                // If it's adjacent to a slash, superscript, or calculation operators like +, -, =, keep it as a letter
                const isFormula = /[/\\*^=+-]\s*$/.test(charBeforeWindow) || /^\s*[/\\*^=+-]/.test(charAfterWindow);
                if (isFormula) return match;
            }

            // Check context window for the fullTerm to avoid redundancy (e.g. "Tension (T)")
            const contextStart = Math.max(0, offset - fullTerm.length - 8);
            const contextEnd = Math.min(fullString.length, offset + match.length + fullTerm.length + 8);
            const contextStr = fullString.substring(contextStart, contextEnd).toLowerCase();
            
            // If the translated word is already right next to the symbol, leave it as the raw letter (e.g., "Tension T")
            if (contextStr.includes(fullTerm.toLowerCase())) {
                return match; 
            }
            
            return marker;
        });

        if (newText !== processedText) {
            processedText = newText;
            markers.push(marker);
            
            if (abbreviation === '+' || abbreviation === '-') {
                values.push(`${fullTerm} `);
            } else {
                values.push(replacementValue);
            }
        }
    }

    // Final pass: replace all markers with their final values
    for (let i = 0; i < markers.length; i++) {
        processedText = processedText.replace(new RegExp(markers[i], 'g'), values[i]);
    }

    return processedText;
}
