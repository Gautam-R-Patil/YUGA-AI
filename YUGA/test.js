const json = '{"text": "CORE\\\\nCONCEPT"}';
const parsed = JSON.parse(json);
console.log('Parsed text has backslash?', parsed.text.includes('\\\\'));
console.log('Has newline?', parsed.text.includes('\\n'));
