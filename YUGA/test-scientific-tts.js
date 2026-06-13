const fs = require('fs');

const UNITS_MAP = {
    'm/s': 'meter per second',
    'kg': 'kilogram',
    'N': 'newton',
    'J': 'joule',
    'W': 'watt'
};

const OPERATORS_MAP = {
    '=': ' equals ',
    '+': ' plus ',
    '-': ' minus ',
    '*': ' into ',
    '/': ' divided by ',
    '→': ' gives ',
    '^': ' power ' 
};

const MATH_FUNCTIONS_SET = new Set(['sin', 'cos', 'tan', 'log', 'ln']);

const SYMBOL_NORMALIZATION = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '×': '*', '·': '*', '−': '-', '≡': ' triple bond '
};

const ENGLISH_EXCEPTIONS = new Set(["In", "As", "At", "He", "Be", "Am", "No", "Is", "Or", "If", "It", "To", "Do", "So", "We", "Me", "My", "By", "On", "Of", "Up", "Us", "An"]);

function processScientificText(inputText) {
    if (!inputText) return inputText;

    // Use a unified regex to preserve everything, including greek letters.
    // [a-zA-Z0-9α-ωΑ-Ω]+ or symbols
    const tokens = inputText.match(/\s+|[a-zA-Z0-9α-ωΑ-Ωθ]+|[=+\-*/^→≡×·₀-₉⁰-⁹()[\]{}.,;!?]+/g) || [];
    const isSci = new Array(tokens.length).fill(false);
    
    // Pass 1: Tag individual tokens
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (/^\s+$/.test(t)) continue;
        
        if (/[=+\-*/^→≡×·₀-₉⁰-⁹]/.test(t)) isSci[i] = true;
        else if (/[A-Z][a-z]?\d/.test(t)) isSci[i] = true;
        else if ((t.match(/[A-Z]/g) || []).length >= 2) isSci[i] = true;
        else if (/^(sin|cos|tan|log|ln)$/.test(t)) isSci[i] = true;
        else if (/^[A-Z][a-z]?$/.test(t)) {
            if (!ENGLISH_EXCEPTIONS.has(t)) {
                isSci[i] = true;
            }
        }
        else if (/[α-ωΑ-Ωθ]/.test(t)) isSci[i] = true; // Greek letters indicate math
    }

    // Units like "m", "/", "s" -> wait, we can just detect "m/s" in the original text BEFORE tokenization!
    // But since the rule says "Units must NEVER be spelled", maybe we just replace them early.
    
    // Pass 2: Merge single letters adjacent to math
    for (let i = 0; i < tokens.length; i++) {
        if (!/^\s+$/.test(tokens[i]) && !isSci[i]) {
            if (tokens[i].length <= 2) {
                let prevSci = false, nextSci = false;
                for(let j=i-1; j>=0; j--){
                    if(!/^\s+$/.test(tokens[j])){
                        if(isSci[j]) prevSci = true;
                        break;
                    }
                }
                for(let j=i+1; j<tokens.length; j++){
                    if(!/^\s+$/.test(tokens[j])){
                        if(isSci[j]) nextSci = true;
                        break;
                    }
                }
                if (prevSci || nextSci) isSci[i] = true;
            }
        }
    }
    
    // Check Brackets
    for (let i = 0; i < tokens.length; i++) {
        if (/^[()[\]{}]+$/.test(tokens[i])) {
            let hasInnerSci = false;
            for(let j=i-1; j>=0; j--){
                if(!/^\s+$/.test(tokens[j])){
                    if(isSci[j]) hasInnerSci = true;
                    break;
                }
            }
            for(let j=i+1; j<tokens.length; j++){
                if(!/^\s+$/.test(tokens[j])){
                    if(isSci[j]) hasInnerSci = true;
                    break;
                }
            }
            if(hasInnerSci) isSci[i] = true;
        }
    }

    // Units early replacement over tokens
    // E.g., if token = 'm', next = '/', next = 's' -> merge to 'm/s'
    for (let i = 0; i < tokens.length - 2; i++) {
        if (tokens[i] === 'm' && tokens[i+1] === '/' && tokens[i+2] === 's') {
            tokens[i] = 'm/s';
            tokens[i+1] = ' '; // empty space
            tokens[i+2] = ' ';
            isSci[i] = true;
        }
    }

    let result = '';
    
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (/^\s+$/.test(t)) {
            result += t;
            continue;
        }

        if (isSci[i]) {
            let norm = t.split('').map(c => SYMBOL_NORMALIZATION[c] || c).join('');
            result += renderScientificChunk(norm);
        } else {
            result += t; // Protect English
        }
    }
    
    return result.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
}

function renderScientificChunk(chunk) {
    if (UNITS_MAP[chunk]) return " " + UNITS_MAP[chunk] + " ";
    if (MATH_FUNCTIONS_SET.has(chunk)) {
        if (chunk === 'sin') return 'sine';
        if (chunk === 'ln') return 'l n';
        return chunk;
    }

    let res = [];
    let i = 0;
    
    while (i < chunk.length) {
        let c = chunk[i];

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
            res.push({type: 'VARIABLE', val: c});
            i++;
            continue;
        }

        if (/[=+\-*/^]/.test(c)) {
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

        if (t.type === 'ELEMENT') {
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
            if (t.val === 'θ') out.push('theta'); // Special render for theta since it's common
            else out.push(t.val);
        } else if (t.type === 'OPERATOR') {
            if (OPERATORS_MAP[t.val]) {
                out.push(OPERATORS_MAP[t.val].trim());
            } else {
                out.push(t.val);
            }
        } else {
            out.push(t.val); // brackets, etc.
        }
    }
    
    return " " + out.join(' ') + " ";
}

const tests = [
    "F = ma",
    "CH3COOH reacts with NaOH",
    "Lithium (Li) reacts with H2O",
    "v = u + at",
    "mass",
    "planck",
    "Na",
    "m/s",
    "sinθ"
];

for (const test of tests) {
    console.log(`Input: ${test}\nOutput: ${processScientificText(test)}\n`);
}
