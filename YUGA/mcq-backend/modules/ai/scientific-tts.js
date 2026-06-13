// mcq-backend/modules/ai/scientific-tts.js

const UNITS_MAP = {
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

const EXPANDABLE_UNITS = {
    'W': 'watt',
    'V': 'volt',
    'J': 'joule',
    'P': 'power',
    'K': 'kelvin',
    'T': 'tesla',
    'Pa': 'pascals',
    'Hz': 'hertz',
    'rad': 'radians'
};

const OPERATORS_MAP = {
    '=': ' equals ',
    '+': ' plus ',
    '-': ' minus ',
    '*': ' into ',
    '/': ' divided by ',
    '→': ' gives ',
    '^': ' power ',
    '√': ' root ',
    '≈': ' approximately ',
    '%': ' percent',
    '<': ' is less than ',
    '>': ' is greater than '
};

const MATH_FUNCTIONS_SET = new Set(['sin', 'cos', 'tan', 'log', 'ln']);
const SYMBOL_NORMALIZATION = {
    '₀': '^base0', '₁': '^base1', '₂': '^base2', '₃': '^base3', '₄': '^base4', '₅': '^base5', '₆': '^base6', '₇': '^base7', '₈': '^base8', '₉': '^base9',
    '⁰': '^power0', '¹': '^power1', '²': '^power2', '³': '^power3', '⁴': '^power4', '⁵': '^power5', '⁶': '^power6', '⁷': '^power7', '⁸': '^power8', '⁹': '^power9',
    '×': '*', '·': '*', '−': '-', '–': '-', '—': '-', '⁻': '^power-', '⁺': '^power+', '≡': ' triple bond '
};

const ENGLISH_EXCEPTIONS = new Set([
    "In", "As", "At", "He", "Be", "Am", "No", "Is", "Or", "If", "It", "To", "Do", "So", "We", "Me", "My", "By", "On", "Of", "Up", "Us", "An",
    "IN", "AS", "AT", "HE", "BE", "AM", "NO", "IS", "OR", "IF", "IT", "TO", "DO", "SO", "WE", "ME", "MY", "BY", "ON", "OF", "UP", "US", "AN"
]);
const LOWER_ENGLISH_EXCEPTIONS = new Set(["in", "as", "is", "or", "if", "it", "to", "do", "so", "we", "me", "my", "by", "on", "of", "up", "us", "an", "am"]);

/**
 * Main Deterministic TTS Text Processor
 * Enforces correct spoken representation for formulas without destroying plain English.
 */
export function processScientificText(inputText) {
    // Equation Context Hyphens: If a sentence has an '=' sign, spaced dashes are almost certainly 'minus'.
    let sentences = inputText.split(/\.\s+/);
    for(let i=0; i<sentences.length; i++) {
        if(sentences[i].includes('=')) {
            sentences[i] = sentences[i].replace(/\s+[-–]\s+/g, ' minus ');
        }
    }
    inputText = sentences.join('. ');

    // 1. Initial cleanup: remove commas from numbers and collapse multiple math signs
    let sanitized = inputText
        .replace(/(\d),(\d)/g, '$1$2')
        .replace(/[×·]\s*[×·]/g, '×')
        .replace(/[-−–]\s*[-−–]/g, '-')
        .replace(/[+]\s*[+]/g, '+');

    // Added complex units to prevent them from fragmenting
    const tokens = sanitized.match(/\s+|m\/s²|m\/s\^2|m\/s2|ms²|ms\^2|ms2|m\/s|[a-zA-Z0-9α-ωΑ-ΩθπϵÅ₀-₉⁰-⁹¹²³⁻⁺]+|[%[=+\\*/^→≡×·()[\]{}.,:;!?√<>≤≥~|≈−⁻–—-]+/g) || [];
    const isSci = new Array(tokens.length).fill(false);
    
    // Pass 1: Initial classification
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (/^\s+$/.test(t)) continue;
        
        const isPureAcronym = /^[A-Z]{3,}$/.test(t);

        if (/[%[=+\\*/^→≡×·()[\]{}₀-₉⁰-⁹¹²³√<>≤≥~|≈−⁻–—-]/.test(t)) {
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
            // Expanding Math context to include parentheses and multi-letter alphanumeric variables
            const isPrevMath = prev && (/^[0-9A-Za-zα-ωΑ-Ωθπϵ]$/.test(prev) || /\d/.test(prev) || prev === ')' || prev === ']');
            const isNextMath = next && (/^[0-9A-Za-zα-ωΑ-Ωθπϵ]$/.test(next) || /\d/.test(next) || /^[a-zA-Z0-9]+$/.test(next) || next === '(' || next === '[');
            const isBetweenMath = isPrevMath && isNextMath;
            const isPrevOpOrNull = !prev || /[=+\\*/^→≡×·()[\]{}.,:;!?√<>≤≥~|≈−⁻-]/.test(prev);
            const isUnaryMinus = isPrevOpOrNull && isNextMath;

            // Also check if surrounded by spaces but context feels heavily like math
            // For example "Tension (T) - Weight (W)"
            let hasSpace = false;
            if (i > 0 && /^\s+$/.test(tokens[i-1])) hasSpace = true;
            if (i < tokens.length - 1 && /^\s+$/.test(tokens[i+1])) hasSpace = true;

            if (isNextNum || isBetweenMath || isUnaryMinus) {
                isSci[i] = true;
            } else if (hasSpace && (prev === ')' || next === 'W' || next === 'Weight' || next === 'Tension' || next === 'mass' || next === 'acceleration')) {
                // Heuristic backcheck for equation patterns missing '='
                isSci[i] = true;
            } else {
                tokens[i] = hasSpace ? " , " : " ";
            }
        }
        else if (t.startsWith('base') || t.startsWith('power')) isSci[i] = true;
        // Strict chemical regex: sequence of Element+Number. 
        else if (/^([A-Z][a-z]?\d*)+$/.test(t) && !ENGLISH_EXCEPTIONS.has(t) && !isPureAcronym) isSci[i] = true;
        else if (/^(sin|cos|tan|log|ln)$/.test(t)) isSci[i] = true;
        else if (/^\d+[a-zA-Zα-ωΑ-Ωθπϵ]$/.test(t)) isSci[i] = true;
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
                let prevToken = null, nextToken = null;
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
                const isAdjacentToOp = (prevToken && /[=+\\*/^−⁻-]/.test(prevToken)) || (nextToken && /[=+\\*/^−⁻-]/.test(nextToken));
                
                const isAfterBroadPunctuation = prevToken && /[ ,:()]/.test(prevToken);

                if ((prevSci || nextSci || isAdjacentToOp) && !(isAfterBroadPunctuation && !isAdjacentToOp)) {
                    isSci[i] = true;
                }
            }
        }
    }
    
    // Pass 2 merging logic already handles variables.

    // Final Pass: Unit/Variable Context Verification for single caps (W, P, V, etc)
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const isUnit = UNITS_MAP[t];
        const isExpandable = EXPANDABLE_UNITS[t];

        if (!isSci[i] && (isUnit || isExpandable)) {
            let prevNonSpace = null;
            let nextNonSpace = null;
            
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
            
            // Equation check: "W = " or " = W"
            const isEqContext = (prevNonSpace && /[=+\-*/^]/.test(prevNonSpace)) || (nextNonSpace && /[=+\-*/^]/.test(nextNonSpace));
            
            if (isDigitUnit) {
                isSci[i] = true;
            } else if (isEqContext) {
                // In equation "W = mg", 'W' is scientific so it's read clearly,
                // but we only want to expand it if it's a standard unit (like 'kg', 'N').
                // Single letters like 'W' we will NOT mark scientific here yet,
                // Pass 2 already handles merging variables near operators.
                // Let's re-evaluate: W=mg. tokens=['W',' ','=',' ','mg'].
                // Pass 2 sees 'W' next to '=' and marks it scientific.
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
    let i = 0;
    while (i < tokens.length) {
        if (/^\s+$/.test(tokens[i])) {
            result += tokens[i];
            i++;
            continue;
        }

        if (isSci[i]) {
            // Merge consecutive scientific tokens (without spaces)
            let combinedNorm = "";
            let startIdx = i;
            let currentIsUnitContext = false;

            while (i < tokens.length && isSci[i]) {
                const t = tokens[i];
                let norm = t.split('').map(c => SYMBOL_NORMALIZATION[c] || c).join('');
                norm = norm.replace(/[×·]/g, '*').replace(/[−–—⁻]/g, '-').replace(/[⁺]/g, '+');
                combinedNorm += norm;
                
                // Track if any part of this merged chunk was marked as unit context
                // (Though usually unit context tokens like 'W' are standalone)
                if (i === startIdx) {
                    let prevNonSpace = null;
                    for(let j=i-1; j>=0; j--){
                        if(!/^\s+$/.test(tokens[j])){
                            prevNonSpace = tokens[j];
                            break;
                        }
                    }
                    if (prevNonSpace && /^\d+$/.test(prevNonSpace) && EXPANDABLE_UNITS[t]) {
                        currentIsUnitContext = true;
                    }
                }
                i++;
            }
            
            result += "[[SCI:" + renderScientificChunk(combinedNorm, currentIsUnitContext).trim() + "]]";
        } else {
            result += tokens[i];
            i++;
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

function renderScientificChunk(chunk, isUnitContext = false) {
    // Priority 1: Direct unit/formula match to prevent splitting (e.g., ms², ma)
    if (UNITS_MAP[chunk]) return " " + UNITS_MAP[chunk] + " ";
    // Priority 2: Expandable unit in digit context (e.g., 5 W -> 5 watt)
    if (isUnitContext && EXPANDABLE_UNITS[chunk]) return " " + EXPANDABLE_UNITS[chunk] + " ";

    let res = [];
    let i = 0;
    
    while (i < chunk.length) {
        let c = chunk[i];

        // Specific detection for normalization markers to prevent them being split as variables
        if (chunk.startsWith('^power', i)) {
            let j = i + 6;
            while(j < chunk.length && /^[0-9+−-]$/.test(chunk[j])) j++;
            res.push({type: 'OTHER', val: chunk.substring(i, j)}); // Preserve ^
            i = j;
            continue;
        }
        if (chunk.startsWith('^base', i)) {
            let j = i + 5;
            while(j < chunk.length && /^[0-9]$/.test(chunk[j])) j++;
            res.push({type: 'OTHER', val: chunk.substring(i, j)}); // Preserve ^
            i = j;
            continue;
        }

        // Specific whitelist for math functions explicitly
        let foundFunc = false;
        for (let fn of MATH_FUNCTIONS_SET) {
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
            let nxt2 = chunk[i+2];
            // An element has at most 1 lowercase letter. If there are 2+ lowercases, it's a word/variable like Fnet.
            // Also check against common elements to prevent kx or wt from being elements.
            const COMMON_ELEMENTS = new Set(['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr','Rf','db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','ts','Og']);
            
            if (nxt && /[a-z]/.test(nxt) && !(nxt2 && /[a-z]/.test(nxt2)) && COMMON_ELEMENTS.has(elem + nxt)) {
                elem += nxt;
                i += 2;
            } else if (nxt && /[a-z]/.test(nxt) && nxt2 && /[a-z]/.test(nxt2)) {
                // It's a word like Fnet, fall through to word processing
                let str = c;
                i++;
                while(i < chunk.length && /[a-zα-ωΑ-Ωθπϵ]/.test(chunk[i])) {
                    str += chunk[i];
                    i++;
                }
                res.push({type: 'OTHER', val: str});
                continue;
            } else if (COMMON_ELEMENTS.has(elem)) {
                i++;
            } else {
                // Not a common element, treat as variable
                res.push({type: 'VARIABLE', val: c});
                i++;
                continue;
            }
            res.push({type: 'ELEMENT', val: elem});
            continue;
        }

        if (/[a-zα-ωΑ-Ωθπϵ]/.test(c)) {
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

        if (/[%[=+\\*/^√<>≤≥~|≈−⁻–—-]/.test(c)) {
            res.push({type: 'OPERATOR', val: c});
            i++;
            continue;
        }

        res.push({type: 'OTHER', val: c});
        i++;
    }

    let out = [];
    for (let j = 0; j < res.length; j++) {
        let t = res[j];

        if (t.type === 'FUNC') {
            out.push(t.val);
        } else if (t.type === 'ELEMENT') {
            out.push(t.val.split('').map(x => x.toUpperCase()).join(' '));
        } else if (t.type === 'NUMBER') {
            out.push(t.val);
        } else if (t.type === 'OTHER' && t.val.startsWith('^')) {
            // Group consecutive power/base tokens and clean redundant prefixes
            const groupStartIdx = j;
            let combined = t.val;
            while (j + 1 < res.length && res[j+1].type === 'OTHER' && res[j+1].val.startsWith('^')) {
                combined += res[j+1].val;
                j++;
            }
            
            if (combined.includes('power')) {
                let p = combined.replace(/\^power/g, ' ').replace(/\^base/g, ' ').replace(/power/g, ' ').replace(/base/g, ' ').replace(/\^/g, ' ').trim();
                
                // Distinguish between ion charges (He2+) and mathematical powers (10^-2)
                // Use groupStartIdx to look back at the token before the entire grouped sequence
                const prevTok = (groupStartIdx > 0) ? res[groupStartIdx - 1] : null;
                const isChemBase = prevTok && (prevTok.type === 'ELEMENT' || (prevTok.type === 'OTHER' && prevTok.val.startsWith('^base')));

                if (isChemBase) {
                    // Ion/Charge terminology
                    let charge = p.replace(/\+/g, ' positive ').replace(/[-−]/g, ' negative ').trim();
                    out.push(" " + charge + " ");
                } else {
                    // Mathematical power terminology
                    if (p === '-' || p === '−') p = 'minus';
                    else if (p === '+') p = 'plus';
                    
                    if (p === '2') out.push(" squared ");
                    else if (p === '3') out.push(" cubed ");
                    else out.push(" to the power of " + p);
                }
            } else {
                let b = combined.replace(/\^base/g, ' ').replace(/\^power/g, ' ').replace(/power/g, ' ').replace(/base/g, ' ').replace(/\^/g, ' ').trim();
                // Natural wording for simple subscripts (e.g., S1 -> S one)
                if (b.length === 1 && /^\d$/.test(b)) {
                    const digitMap = { '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine' };
                    out.push(" " + digitMap[b] + " ");
                } else {
                    out.push(" subscript " + b);
                }
            }
        } else if (t.type === 'VARIABLE') {
            if (j > 0) {
                let prev = res[j-1];
                if (prev.type === 'VARIABLE' || prev.type === 'NUMBER' || prev.type === 'ELEMENT') {
                    // Refined Implicit Multiplication:
                    // 1. Skip 'into' for differentials like dA, dx, dx/dt, delta V
                    const isDiff = prev.val === 'd' || prev.val === 'D' || prev.val === 'δ' || prev.val === 'Δ';
                    // 2. Skip 'into' for simple number + variable like 2n, 5x
                    const isCoeff = prev.type === 'NUMBER';
                    
                    // 3. Skip 'into' for simple variable + variable like kx, ωt, mg
                    const isVarToVar = prev.type === 'VARIABLE' || prev.type === 'ELEMENT';
                    
                    if (isDiff || isCoeff || isVarToVar) {
                        out.push(' ');
                    } else {
                        out.push('into'); 
                    }
                }
            }
            
            const greekMap = {
                'θ': 'theta', 'Θ': 'theta', 'π': 'pi', 'Π': 'pi', 'ϵ': 'epsilon', 'ε': 'epsilon',
                'Φ': 'phi', 'φ': 'phi', 'ϕ': 'phi',
                'Ω': 'omega', 'ω': 'omega',
                'λ': 'lambda', 'Λ': 'lambda', 'μ': 'mu', 'Δ': 'delta', 'δ': 'delta',
                'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 
                'Σ': 'summation', 'σ': 'sigma', 'ρ': 'rho', 'τ': 'tau',
                'ψ': 'psi', 'Ψ': 'psi', 'ξ': 'xi', 'Ξ': 'xi', 'η': 'eta', 'ζ': 'zeta',
                'χ': 'chi', 'υ': 'upsilon', 'Υ': 'upsilon', 'κ': 'kappa'
            };

            if (greekMap[t.val]) {
                out.push(greekMap[t.val]);
            } else if (t.val.length === 1 && /[a-zA-Z]/.test(t.val)) {
                // Phonetic hints for letters that are commonly expanded to units or skipped but shouldn't be
                const val = t.val.toUpperCase();
                if (val === 'K' || val === 'A') out.push(val + ' .');
                else out.push(val);
            } else {
                out.push(t.val);
            }
        } else if (t.type === 'OPERATOR') {
            let opVal = OPERATORS_MAP[t.val] ? OPERATORS_MAP[t.val].trim() : t.val;
            
            // Special case for Chemistry Context: - (single bond), = (double bond)
            if (t.val === '-' || t.val === '=') {
                const ORGANIC_ATOMS = new Set(['C', 'H', 'N', 'O', 'S', 'P', 'Cl', 'Br', 'I', 'F']);
                const isAtomy = (tok) => {
                    if (!tok) return false;
                    if (tok.type === 'ELEMENT') return true;
                    if (tok.type === 'VARIABLE' && ORGANIC_ATOMS.has(tok.val)) return true;
                    return false;
                };
                const isChemy = (tok, idx) => {
                    if (!tok) return false;
                    if (isAtomy(tok)) return true;
                    if (tok.type === 'NUMBER' && idx > 0 && isAtomy(res[idx-1])) return true;
                    // Support subscripts like CH3, CH2 (represented as ^baseN)
                    if (tok.type === 'OTHER' && tok.val.startsWith('^base') && idx > 0 && isAtomy(res[idx-1])) return true;
                    return false;
                };

                const prevTok = (j > 0) ? res[j-1] : null;
                const nextTok = (j < res.length - 1) ? res[j+1] : null;

                if (isChemy(prevTok, j-1) && isChemy(nextTok, j+1)) {
                    opVal = (t.val === '-') ? "single bond" : "double bond";
                }
            }
            
            // Special case for '/' -> "by" in short variable contexts (f/m, dA/dt, dy/dx)
            if (t.val === '/') {
                const isShortNumerator = (j > 0 && res[j-1].type === 'VARIABLE');
                const isShortDenominator = (j < res.length - 1 && res[j+1].type === 'VARIABLE');
                if (isShortNumerator && isShortDenominator) {
                    opVal = "by";
                }
            }
            out.push(opVal);
        } else {
            out.push(t.val);
        }
    }
    
    return " " + out.join(' ') + " ";
}
