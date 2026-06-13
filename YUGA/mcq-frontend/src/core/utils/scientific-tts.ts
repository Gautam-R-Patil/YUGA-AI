// mcq-frontend/src/core/utils/scientific-tts.ts

const UNITS_MAP: Record<string, string> = {
    'm/s': 'meter per second',
    'ms2': 'meter per second squared',
    'ms^2': 'meter per second squared',
    'm/s2': 'meter per second squared',
    'm/s^2': 'meter per second squared',
    'ms²': 'meter per second squared',
    'm/s²': 'meter per second squared',
    'kg': 'kilogram',
    'N': 'newton',
    'ma': 'm into a',
    'Å': 'angstrom'
};

const EXPANDABLE_UNITS: Record<string, string> = {
    'W': 'watt',
    'V': 'volt',
    'J': 'joule',
    'P': 'power'
};

const OPERATORS_MAP: Record<string, string> = {
    '=': ' equals ',
    '+': ' plus ',
    '-': ' minus ',
    '*': ' into ',
    '/': ' divided by ',
    '→': ' gives ',
    '^': ' power ',
    '√': ' root ',
    '≈': ' approximately '
};

const MATH_FUNCTIONS_SET = new Set(['sin', 'cos', 'tan', 'log', 'ln']);

const SYMBOL_NORMALIZATION: Record<string, string> = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '×': '*', '·': '*', '−': '-', '≡': ' triple bond '
};

const ENGLISH_EXCEPTIONS = new Set([
    "In", "As", "At", "He", "Be", "Am", "No", "Is", "Or", "If", "It", "To", "Do", "So", "We", "Me", "My", "By", "On", "Of", "Up", "Us", "An",
    "IN", "AS", "AT", "HE", "BE", "AM", "NO", "IS", "OR", "IF", "IT", "TO", "DO", "SO", "WE", "ME", "MY", "BY", "ON", "OF", "UP", "US", "AN"
]);
const LOWER_ENGLISH_EXCEPTIONS = new Set(["in", "as", "is", "or", "if", "it", "to", "do", "so", "we", "me", "my", "by", "on", "of", "up", "us", "an", "am"]);

/**
 * Main Deterministic TTS Text Processor for Frontend
 * Enforces correct spoken representation for formulas without destroying plain English.
 */
export function processScientificText(inputText: string): string {
    if (!inputText) return inputText;

    // Equation Context Hyphens: If a sentence has an '=' sign, spaced dashes are almost certainly 'minus'.
    let sentences = inputText.split(/\.\s+/);
    for(let i=0; i<sentences.length; i++) {
        if(sentences[i].includes('=')) {
            sentences[i] = sentences[i].replace(/\s+[-–]\s+/g, ' minus ');
        }
    }
    inputText = sentences.join('. ');

    // Only remove commas between digits.
    let sanitized = inputText.replace(/(\d),(\d)/g, '$1$2');

    // Added complex units to prevent them from fragmenting
    const tokens = sanitized.match(/\s+|m\/s²|m\/s\^2|m\/s2|ms²|ms\^2|ms2|m\/s|[a-zA-Z0-9α-ωΑ-ΩθπϵÅ]+|[=+\-*/^→≡×·₀-₉⁰-⁹()[\]{}.,;!?√<>≤≥~|≈]+/g) || [];
    const isSci = new Array(tokens.length).fill(false);
    
    // Pass 1: Initial classification
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (/^\s+$/.test(t)) continue;
        
        const isPureAcronym = /^[A-Z]{3,}$/.test(t);

        if (/[=+\*/^→≡×·₀-₉⁰-⁹√<>≤≥~|≈]/.test(t)) {
            if (t.includes('->') || t.includes('=>') || t.includes('⟶')) {
                tokens[i] = " gives ";
            } else {
                isSci[i] = true;
            }
        } else if (t === '-') {
            let prev = null, next = null;
            for(let j=i-1; j>=0; j--) { if(!/^\s+$/.test(tokens[j])) { prev = tokens[j]; break; } }
            for(let j=i+1; j<tokens.length; j++) { if(!/^\s+$/.test(tokens[j])) { next = tokens[j]; break; } }
            
            const isNextNum = next && /\d/.test(next);
            const isPrevMath = prev && (/^[0-9A-Za-zα-ωΑ-Ωθπϵ]$/.test(prev) || /\d/.test(prev));
            const isNextMath = next && (/^[0-9A-Za-zα-ωΑ-Ωθπϵ]$/.test(next) || /\d/.test(next));
            const isBetweenMath = isPrevMath && isNextMath;
            const isPrevOpOrNull = !prev || /[=+\-*/^→≡×·()[\]{}.,;!?√<>≤≥~|]/.test(prev);
            const isUnaryMinus = isPrevOpOrNull && isNextMath;

            if (isNextNum || isBetweenMath || isUnaryMinus) {
                isSci[i] = true;
            } else {
                let hasSpace = false;
                if (i > 0 && /^\s+$/.test(tokens[i-1])) hasSpace = true;
                if (i < tokens.length - 1 && /^\s+$/.test(tokens[i+1])) hasSpace = true;
                tokens[i] = hasSpace ? " , " : " ";
            }
        }
        // Strict chemical regex: sequence of Element+Number. 
        else if (/^([A-Z][a-z]?\d*)+$/.test(t) && !ENGLISH_EXCEPTIONS.has(t) && !isPureAcronym) isSci[i] = true;
        else if (/^(sin|cos|tan|log|ln)$/.test(t)) isSci[i] = true;
        else if (UNITS_MAP[t] && t.length > 1) {
            // Multi-letter units like 'ma' or symbols like 'm/s'
            isSci[i] = true;
        }
    }

    // Pass 2: Contextual merging for variables/letters
    for (let i = 0; i < tokens.length; i++) {
        if (!/^\s+$/.test(tokens[i]) && !isSci[i]) {
            const isSingleLetter = /^[A-Za-z]$/.test(tokens[i]);
            const isTwoChars = tokens[i].length === 2;
            const isLowException = LOWER_ENGLISH_EXCEPTIONS.has(tokens[i].toLowerCase());

            if ((isSingleLetter || isTwoChars) && !isLowException) {
                let prevSci = false, nextSci = false;
                let prevToken: string | null = null, nextToken: string | null = null;
                for(let j=i-1; j>=0; j--){
                    if(!/^\s+$/.test(tokens[j])){
                        if(isSci[j]) prevSci = true;
                        prevToken = tokens[j];
                        break;
                    }
                }
                for(let j=i+1; j<tokens.length; j++){
                    if(!/^\s+$/.test(tokens[j])){
                        if(isSci[j]) nextSci = true;
                        nextToken = tokens[j];
                        break;
                    }
                }

                // If neighbor is another scientific token or an operator, mark this as scientific.
                const isAdjacentToOp = (prevToken && /[=+\-*/^]/.test(prevToken)) || (nextToken && /[=+\-*/^]/.test(nextToken));
                
                // CRITICAL: If the previous token is punctuation (like a comma), it's likely a descriptor like "Acceleration, a".
                // In this case, we do NOT want to auto-trigger scientific mode for a single isolated character.
                const isAfterComma = prevToken && /[ ,:()]/.test(prevToken);

                const isAfterBroadPunctuation = prevToken && /[ ,:()]/.test(prevToken);

                // A single character or two-character token is scientific ONLY if:
                // 1. It's part of an existing scientific sequence (prevSci or nextSci)
                // 2. OR it's immediately adjacent to a mathematical operator (isAdjacentToOp)
                // AND it's NOT preceded by broad punctuation (like a comma) without an operator in between.
                if ((prevSci || nextSci || isAdjacentToOp) && !(isAfterBroadPunctuation && !isAdjacentToOp)) {
                    isSci[i] = true;
                }
            }
        }
    }
    
    // Final Pass: Unit/Variable Context Verification for single caps (W, P, V, etc)
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const isUnit = UNITS_MAP[t];
        const isExpandable = EXPANDABLE_UNITS[t];

        if (!isSci[i] && (isUnit || isExpandable)) {
            let prevNonSpace: string | null = null;
            let nextNonSpace: string | null = null;
            
            for(let j=i-1; j>=0; j--){
                if(!/^\s+$/.test(tokens[j])){
                    prevNonSpace = tokens[j];
                    break;
                }
            }
            for(let j=i+1; j<tokens.length; j++){
                if(!/^\s+$/.test(tokens[j])){
                    nextNonSpace = tokens[j];
                    break;
                }
            }

            // Always scientific if it follows a digit (could be expandable or standard unit)
            const isDigitUnit = prevNonSpace && /^\d+$/.test(prevNonSpace);
            
            // Non-expandable units (like 'N', 'kg') trigger scientific mode in equations too
            const isEqContext = (prevNonSpace && /[=+\-*/^]/.test(prevNonSpace)) || (nextNonSpace && /[=+\-*/^]/.test(nextNonSpace));
            
            if (isDigitUnit) {
                isSci[i] = true;
            } else if (isEqContext && isUnit) {
                isSci[i] = true;
            }
        }
    }

    // Explicit Unit overrides early pass
    for (let i = 0; i < tokens.length - 2; i++) {
        // m/s
        if (tokens[i] === 'm' && tokens[i+1] === '/' && tokens[i+2] === 's') {
            tokens[i] = 'm/s';
            tokens[i+1] = ''; tokens[i+2] = '';
            isSci[i] = true;
        }
        // m/s2 or m/s²
        if (tokens[i] === 'm' && tokens[i+1] === '/' && (tokens[i+2] === 's2' || tokens[i+2] === 's²')) {
            tokens[i] = 'm/s²';
            tokens[i+1] = ''; tokens[i+2] = '';
            isSci[i] = true;
        }
    }
    for (let i = 0; i < tokens.length - 1; i++) {
        // ms2, ms²
        if ((tokens[i] === 'ms' || tokens[i] === 'MS') && (tokens[i+1] === '2' || tokens[i+1] === '²')) {
            tokens[i] = 'ms²';
            tokens[i+1] = '';
            isSci[i] = true;
        }
    }

    let result = '';
    
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t === '') continue; // Skip joined symbols
        if (/^\s+$/.test(t)) {
            result += t;
            continue;
        }

        if (isSci[i]) {
            let norm = t.split('').map(c => SYMBOL_NORMALIZATION[c] || c).join('');
            
            // Check if this was marked scientific specifically because of a leading digit
            let isUnitContext = false;
            let prevNonSpace: string | null = null;
            for(let j=i-1; j>=0; j--){
                if(!/^\s+$/.test(tokens[j])){
                    prevNonSpace = tokens[j];
                    break;
                }
            }
            if (prevNonSpace && /^\d+$/.test(prevNonSpace) && EXPANDABLE_UNITS[t]) {
                isUnitContext = true;
            }

            // Use markers to keep it tight, will clean up at the end
            result += "[[SCI:" + renderScientificChunk(norm, isUnitContext).trim() + "]]";
        } else {
            result += t;
        }
    }
    
    // Clean up the markers and handle spacing
    return result
        .replace(/\[\[SCI:(.*?)\]\]/g, ' $1 ')
        .replace(/\s+/g, ' ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .replace(/\(\)/g, '')
        .trim();
}

interface ParsedToken {
    type: string;
    val: string;
}

function renderScientificChunk(chunk: string, isUnitContext: boolean = false): string {
    // Check UNITS_MAP first to ensure specific units like 'ms²' are handled as a whole
    if (UNITS_MAP[chunk]) return " " + UNITS_MAP[chunk] + " ";
    // Then check for expandable units if in a unit context
    if (isUnitContext && EXPANDABLE_UNITS[chunk]) return " " + EXPANDABLE_UNITS[chunk] + " ";

    let res: ParsedToken[] = [];
    let i = 0;
    
    while (i < chunk.length) {
        let c = chunk[i];

        // Specific whitelist for math functions explicitly
        let foundFunc = false;
        const mathFunctions = Array.from(MATH_FUNCTIONS_SET);
        for (let fn of mathFunctions) {
            if (chunk.startsWith(fn, i)) {
                let rf = fn;
                if (fn === 'sin') rf = 'sine';
                if (fn === 'ln') rf = 'l n';
                res.push({type: 'FUNC', val: rf});
                i += fn.length;
                foundFunc = true;
                break;
            }
        }
        if (foundFunc) continue;

        if (/\d/.test(c)) {
            let num = c;
            i++;
            while(i < chunk.length && /\d/.test(chunk[i])) {
                num += chunk[i];
                i++;
            }
            res.push({type: 'NUMBER', val: num});
            continue;
        }

        if (/[A-Z]/.test(c)) {
            let elem = c;
            let nxt = chunk[i+1];
            if (nxt && /[a-z]/.test(nxt)) {
                elem += nxt;
                i += 2;
            } else {
                i++;
            }
            res.push({type: 'ELEMENT', val: elem});
            continue;
        }

        if (/[a-zα-ωΑ-Ωθ]/.test(c)) {
            let str = c;
            i++;
            while(i < chunk.length && /[a-zα-ωΑ-Ωθπϵ]/.test(chunk[i])) {
                str += chunk[i];
                i++;
            }
            if (str.length >= 3) {
                res.push({type: 'OTHER', val: str});
            } else {
                for (let char of str) {
                    res.push({type: 'VARIABLE', val: char});
                }
            }
            continue;
        }

        // Numbers, operators, basic Math vars
        if (/[=+\-*/^→≡×·<>≤≥~|≈]/.test(c)) {
            res.push({type: 'OPERATOR', val: c});
            i++;
            continue;
        }

        res.push({type: 'OTHER', val: c});
        i++;
    }

    let out: string[] = [];
    for (let j = 0; j < res.length; j++) {
        let t = res[j];

        if (t.type === 'FUNC') {
            out.push(t.val);
        } else if (t.type === 'ELEMENT') {
            out.push(t.val.split('').map(x => x.toUpperCase()).join(' '));
        } else if (t.type === 'NUMBER') {
            out.push(t.val);
        } else if (t.type === 'VARIABLE') {
            if (j > 0) {
                let prev = res[j-1];
                if (prev.type === 'VARIABLE' || prev.type === 'NUMBER' || prev.type === 'ELEMENT') {
                    out.push('into'); 
                }
            }
            if (t.val === 'θ') out.push('theta'); 
            else if (t.val === 'π') out.push('pi');
            else if (t.val === 'ϵ') out.push('epsilon');
            else if (t.val.length === 1 && /[a-z]/.test(t.val)) out.push(t.val.toUpperCase());
            else out.push(t.val);
        } else if (t.type === 'OPERATOR') {
            if (OPERATORS_MAP[t.val]) {
                out.push(OPERATORS_MAP[t.val].trim());
            } else {
                out.push(t.val);
            }
        } else {
            out.push(t.val);
        }
    }
    
    return " " + out.join(' ') + " ";
}
