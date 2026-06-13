
/**
 * Utility to fix common formatting issues in OCR-ed scientific questions.
 */
export const formatScientificText = (text: string): string => {
    if (!text) return "";

    let processed = text;

    // Fix "Therefore" typo
    processed = processed.replace(/There\s*for\s*e\b/gi, 'Therefore');

    // Statement formatting
    processed = processed.replace(/\b(Statement\s+[I]+)\b\s*[:.]?\s*/gi, '\n\n$1: ');

    // Degree Symbols
    processed = processed
        .replace(/(\d+)\s*[\*o•]\s*([CF])\b/g, "$1°$2")
        .replace(/(\d+)\s*deg\s*([CF])\b/gi, "$1°$2");
    processed = processed.replace(/(\d+)\s*[\*•]\s*(?=[,\.]|\s|$)/g, "$1°");

    // Superscripts
    const superscriptMap: { [key: string]: string } = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '-': '⁻', '+': '⁺', '(': '⁽', ')': '⁾'
    };
    const toSuperscript = (str: string) => str.split('').map((d: string) => superscriptMap[d] || d).join('');

    // Units with negative exponents
    processed = processed.replace(/\b([a-zA-Z]+)\s*[-–]\s*(\d+)\b/g, (_, unit, power) => {
        const commonUnits = ['m', 's', 'kg', 'g', 'N', 'J', 'W', 'Pa', 'T', 'A', 'V', 'Hz', 'mol', 'K'];
        if (commonUnits.includes(unit) || unit.length <= 3) {
            return `${unit}⁻${toSuperscript(power)}`;
        }
        return _;
    });

    // Powers of 10
    processed = processed.replace(/\b10\s*[-–]\s*(\d+)/g, (_, power) => `10⁻${toSuperscript(power)}`);
    processed = processed.replace(/\b10\s+([2-9]|1[0-5])\b/g, (_, power) => `10${toSuperscript(power)}`);
    processed = processed.replace(/\^([+-]?\d+)/g, (_, num) => toSuperscript(num));

    // Fractions
    const fractionMap: { [key: string]: string } = {
        '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
        '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘', '1/6': '⅙', '5/6': '⅚',
        '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞'
    };
    Object.entries(fractionMap).forEach(([frac, unicode]) => {
        processed = processed.replace(new RegExp(`\\b${frac.replace('/', '\\/')}\\b`, 'g'), unicode);
    });

    // Subscripts
    const subscriptMap: { [key: string]: string } = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
        '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
    };
    processed = processed.replace(/\b([A-HJ-Zn][a-z]?)(\d+)\b/g, (match, char, num) => {
        const skipWords = ['Question', 'Set', 'Statement', 'Part', 'Section', 'Chapter'];
        if (skipWords.some(word => processed.includes(word + ' ' + match))) return match;
        const sub = num.split('').map((d: string) => subscriptMap[d] || d).join('');
        return `${char}${sub}`;
    });

    // Clean whitespace
    processed = processed.replace(/[ \t]+/g, ' ');
    processed = processed.replace(/\n{3,}/g, '\n\n');

    // Prevent unit line breaks (4.50 L -> 4.50&nbsp;L)
    processed = processed.replace(/(\d+[\.]?\d*)\s+([a-zA-Z]{1,3}|%|°[CF]?)\b/g, (_match, num, unit) => {
        return `${num}\u00A0${unit}`;
    });

    return processed.trim();
};

/**
 * Advanced formatter for Markdown/LaTeX rendering.
 * Used in Explanation sections.
 */
export const formatTextForMarkdown = (text: string): string => {
    if (!text) return "";
    let processed = text.trim();

    // 1. Basic corrections first
    processed = processed.replace(/There\s*for\s*e\b/gi, 'Therefore');
    processed = processed.replace(/[ \t]+/g, ' ');

    // Replace literal '\n' escaping issue sometimes found in our DB
    processed = processed.replace(/\\n/g, '\n');

    // Remove existing markdown headings to avoid interference
    processed = processed.replace(/^#+\s+/gm, '');

    // Remove square brackets from Given/Concept/Calculation sections
    // Example: "Given: [Initial Volume (V1) = 2.50 L]" -> "Given: Initial Volume (V1) = 2.50 L"
    processed = processed.replace(/\[([^\]]+)\]/g, '$1');

    // Remove markdown bold markers (**) - they interfere with LaTeX rendering
    // React-markdown will handle emphasis differently
    processed = processed.replace(/\*\*/g, '');

    // 2. Scientific Terms -> LaTeX

    // Nuclear prescript notation: ^A_Z X, ^A_(Z+1) Y
    // High priority: match stacked notation first

    // Explicit overrides for the specific nuclear decay question to guarantee rendering
    processed = processed.replace(/\^A_Z/g, '$\\text{}^{A}_{Z}$');
    processed = processed.replace(/\^A_\(Z\+1\)/g, '$\\text{}^{A}_{Z+1}$');
    processed = processed.replace(/\^A_\(Z-1\)/g, '$\\text{}^{A}_{Z-1}$');
    processed = processed.replace(/\^\(A-4\)_\(Z-1\)/g, '$\\text{}^{A-4}_{Z-1}$');

    // General Regex for other cases
    // VERIFIED: Matches ^A_Z, ^(A-4)_(Z-1), etc.
    const nuclearRegex = /(\^(\([^)]+\)|[a-zA-Z0-9+\-*]+))\s*([_](\([^)]+\)|[a-zA-Z0-9+\-*]+))/g;
    processed = processed.replace(nuclearRegex, (_, _sup, supContent, _sub, subContent) => {
        const cleanSup = supContent.startsWith('(') ? supContent.slice(1, -1) : supContent;
        const cleanSub = subContent.startsWith('(') ? subContent.slice(1, -1) : subContent;
        return `$\\text{}^{${cleanSup}}_{${cleanSub}}$`;
    });

    // General sub/sup: ^A, _Z, ^(text), _(text)
    // Supports: _(text), ^(text), _(text), ^text
    processed = processed.replace(/([_\^])\(([^)]+)\)/g, (_, type, content) => {
        return type === '^' ? `$^{${content}}$` : `$_{${content}}$`;
    });

    // Pattern: ^content or _content (single word/char)
    processed = processed.replace(/(?<!\$)([\^])([a-zA-Z0-9+\-*]+)(?!\$)/g, '$^{$2}$');
    processed = processed.replace(/(?<!\$)([_])([a-zA-Z0-9+\-*]+)(?!\$)/g, '$_{$2}$');

    // Combine any adjacent LaTeX blocks (including those created above)
    // COMMENTED OUT: This entire block may be causing text corruption issues
    // Repeat to catch chains: $A$$B$$C$ -> $ABC$
    // let prev;
    // do {
    //     prev = processed;
    //     processed = processed.replace(/(\$[^$]+\$)\s*(\$[^$]+\$)/g, (_m, p1, p2) => {
    //         return `$${p1.slice(1, -1)}${p2.slice(1, -1)}$`;
    //     });
    //     // COMMENTED OUT: This may incorrectly remove content in edge cases
    //     // processed = processed.replace(/\$\s*\$/g, '');
    // } while (processed !== prev);

    // Specific Scientific symbols
    processed = processed.replace(/\bP_ext\b/g, '$P_{\\text{ext}}$');

    // Delta U, Delta H, etc.
    // COMMENTED OUT: The JSON already contains Unicode Δ symbols which display correctly
    // Converting them to LaTeX can cause rendering issues
    // processed = processed.replace(/Δ([A-Z])/g, '$\\Delta $1$');
    // processed = processed.replace(/\\Delta\\s*([A-Z])/g, '$\\Delta $1$');

    // Work 'w' and Heat 'q' (heuristic: surrounded by spaces or equals)
    // COMMENTED OUT: This can interfere with normal text rendering
    // processed = processed.replace(/(^|\s)(w|q)(\s*=\s*)/g, '$1$$$2$$$3');

    // Units separated by dot: L.atm or L·atm -> L$\cdot$atm
    // Example: 5.00 L.atm
    processed = processed.replace(/(\s)([A-Z])[\\.·]([a-z]{2,3})\b/g, '$1$2 $\\cdot$ $3');

    // Numbers with units -> keep together?
    // In markdown, we can use non-breaking space or just let it flow.
    // Let's try to wrap equations.

    // Isothermal, Adiabatic...

    // Equations: anything with = might be worth wrapping in $...$ if it looks mathy
    // Regex for simple math expressions: "w = - P_ext x DeltaV"
    // It's hard to catch all perfectly without ruining text.
    // Let's focus on the specific user request: "w = - P_ext x \Delta V"

    // Replace 'x' multiplication with \times in math context?
    // processed = processed.replace(/(\d+)\s*x\s*(\d+)/g, '$1 \\times $2');

    // Fix the specific example from the user image:
    // "U = w" -> "$\Delta U = w$"
    // "w = - P_ext x \Delta V"

    // Generic Variable Subscripts: V_2, T_1, v_eff -> $V_2$, $T_1$, $v_{eff}$
    processed = processed.replace(/\b([a-zA-Z])_(\d+|[a-z]{1,4})\b/g, '$$$1_{$2}$$');

    // Replace standard multiplication and arrow signs with LaTeX equivalents
    processed = processed.replace(/×/g, '$\\times$');
    processed = processed.replace(/→/g, '$\\rightarrow$');

    // 3. Line Breaks & Structure

    // Ensure newlines are preserved as double newlines for React-Markdown
    // Single \n in markdown is often rendered as a space.
    processed = processed.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');

    // Section trigger logic - converts plain text section names to markdown headings
    // Note: Skips lines that already have markdown heading syntax (###)
    const newSectionTriggers = [
        'Calculation', 'Solution', 'Explanation', 'Detailed Solution',
        'Why This Answer is Correct', 'Why This Answer?', 'Why This Answer',
        'Common Mistakes', 'Concept', 'Core Concept', 'CORE CONCEPT',
        'Step by Step Solution', 'STEP BY STEP SOLUTION', 'Step-by-Step Solution', 'STEP-BY-STEP SOLUTION',
        'Step by Step Understanding', 'STEP BY STEP UNDERSTANDING', 'Step-by-Step Understanding', 'STEP-BY-STEP UNDERSTANDING',
        'Option Analysis', 'OPTION ANALYSIS', 'Final Result', 'FINAL RESULT',
        'Identification of Diseases', 'IDENTIFICATION OF DISEASES', 'Analysis of Options', 'ANALYSIS OF OPTIONS',
        'Step by Step Mechanism', 'STEP BY STEP MECHANISM', 'Why Menstruation Does Not Occur', 'WHY MENSTRUATION DOES NOT OCCUR',
        'Features of Metaphase', 'FEATURES OF METAPHASE', 'Interpreting the Figure', 'INTERPRETING THE FIGURE',
        'Composition of Lymph', 'COMPOSITION OF LYMPH', 'Role of the Lymphatic System', 'ROLE OF THE LYMPHATIC SYSTEM', 'Functions of Lymph', 'FUNCTIONS OF LYMPH',
        'Step by Step Analysis', 'STEP BY STEP ANALYSIS'
    ];

    newSectionTriggers.forEach(trigger => {
        // Match trigger words at: start of string, after terminators (handling multiple dots like ..), or after newlines
        // This naturally skips lines that start with # (markdown headings)
        const escapedTrigger = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        processed = processed.replace(
            new RegExp(`(^\\s*|[.!?)\\]}]+[\\s.!?)\\]}]*|\\n\\s*)(${escapedTrigger})\\s*[:.\\-]*\\s*(?=[\\s\\n]|$|\\[|\\w|["'(])`, 'gim'),
            '$1\n\n## $2\n\n'
        );
    });

    // REMOVED: Calculation chain breaking and colon splitting heuristics.
    // User requested strict adherence to JSON \n.



    // Fix up "Work done by ... is \n\n= ..." if that happened
    // If "is" is at the end of the line, join it with the next line?
    // Actually, "Work done ... is w = ..." usually fits on one line if short.
    // The user wants:
    // Def
    // Formula
    // Calc

    // Let's rely on the equation chain breaking specifically.

    return processed.trim();
};

/**
 * Simplified basic formatter (wraps formatTextForMarkdown).
 */
export const formatBasicAnswerBreakdown = (text: string): string => {
    // Use the advanced Markdown/LaTeX formatter for basic answers too
    return formatTextForMarkdown(text);
};

/**
 * Preprocesses text for Text-to-Speech.
 * @param text The text to process
 * @param subject Optional subject context ('Physics', 'Chemistry', 'Biology') to refine pronunciation
 */
export const preprocessTextForSpeech = (text: string, subject: string = '', keywords: Record<string, string> = {}): string => {
    if (!text) return "";
    let cleanText = text;

    cleanText = cleanText.replace(/[\u00A0\s]+/g, ' ');
    cleanText = cleanText.replace(/(\\n|\\r|[\r\n])+/gi, '. ');
    cleanText = cleanText.replace(/\$\$/g, '').replace(/[$]/g, '').replace(/\*\*/g, '');

    return cleanText;
};
