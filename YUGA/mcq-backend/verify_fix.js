import { applyKeywordSubstitutions } from './modules/ai/text-utils.js';
import fs from 'fs';

let output = "";
function test(name, text, keywords) {
    output += `--- Test: ${name} ---\n`;
    output += `Original text: ${text}\n`;
    const processed = applyKeywordSubstitutions(text, keywords);
    output += `Processed text: ${processed}\n\n`;
}

// Case 1: User's reported problem (should no longer say "mass mass")
test("Double substitution prevention",
    "A particle of mass M",
    {
        "mass M": "mass M",
        "M": "mass"
    }
);

// Case 2: User's desired fix with lowercase m
test("Explicit lowercase m mapping",
    "A particle of mass M",
    {
        "mass M": "mass m",
        "M": "mass"
    }
);

// Case 3: Case sensitivity check (M vs m)
test("Case sensitivity",
    "Mass M and meter m",
    {
        "M": "mass",
        "m": "meters"
    }
);

// Case 4: Original repro text
const fullText = "A particle of mass M is situated at the centre of a spherical shell of same mass and radius a.";
const fullKeywords = {
    "mass M": "mass m",
    "M": "mass",
    "G": "universal gravitational constant",
    "a": "radius of the shell",
    "r": "distance from the center",
    "V": "gravitational potential"
};
test("Full sentence with corrected keywords", fullText, fullKeywords);

fs.writeFileSync('test_results.txt', output);
