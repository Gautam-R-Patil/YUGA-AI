import sys
filepath = 'd:/New folder/Coding/YUGA/mcq-frontend/src/core/utils/textFormatting.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_str = 'export const preprocessTextForSpeech = (text: string, subject: string = \'\', keywords: Record<string, string> = {}): string => {'
start_idx = content.find(start_str)

if start_idx == -1:
    print('Start not found')
    sys.exit(1)

brace_count = 0
started = False
end_idx = -1

for i in range(start_idx, len(content)):
    if content[i] == '{':
        brace_count += 1
        started = True
    elif content[i] == '}':
        brace_count -= 1
    
    if started and brace_count == 0:
        end_idx = i
        break

if end_idx == -1:
    print('End not found')
    sys.exit(1)

new_func = """export const preprocessTextForSpeech = (text: string, subject: string = '', keywords: Record<string, string> = {}): string => {
    if (!text) return "";
    let cleanText = text;

    cleanText = cleanText.replace(/[\\u00A0\\s]+/g, ' ');
    cleanText = cleanText.replace(/(\\\\n|\\\\r|[\\r\\n])+/gi, '. ');
    cleanText = cleanText.replace(/\\$\\$/g, '').replace(/[$]/g, '').replace(/\\*\\*/g, '');

    return cleanText;
};"""

new_content = content[:start_idx] + new_func + content[end_idx+1:]
with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_content)
    
print('Successfully fixed typescript preprocess method')
