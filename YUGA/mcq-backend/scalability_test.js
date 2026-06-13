import { applyKeywordSubstitutions } from './modules/ai/text-utils.js';
import fs from 'fs';

let output = "";
function test(name, text, keywords) {
    output += `--- Test: ${name} ---\n`;
    output += `Original text: ${text}\n`;
    const processed = applyKeywordSubstitutions(text, keywords);
    output += `Processed text: ${processed}\n\n`;
}

// Case: Capacitor C
test("Capacitor C example",
    "A capacitor C has capacitance C",
    {
        "capacitor C": "capacitor c",
        "C": "capacitance"
    }
);

// Case: Velocity v vs Voltage V (Case Sensitivity)
test("Velocity v vs Voltage V",
    "The velocity v is 10 and voltage V is 220",
    {
        "v": "velocity",
        "V": "voltage"
    }
);

fs.writeFileSync('scalability_test.txt', output);
