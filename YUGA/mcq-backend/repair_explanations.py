import json
import os
import re

def fix_explanation_v2(explanation):
    if not explanation or "STEP BY STEP SOLUTION" not in explanation:
        return explanation
    
    # Split into sections based on headers
    headers = [
        "CORE CONCEPT", "STEP BY STEP SOLUTION", "WHY THIS ANSWER", 
        "COMMON MISTAKES", "FINAL RESULT", "STEP BY STEP EXPLANATION",
        "STRUCTURE OF A VIRUS", "OPTION ANALYSIS", "STRUCTURE", "ANALYSIS", "CONCLUSION"
    ]
    
    # Regex to split while keeping delimiters
    pattern = r'(' + '|'.join(re.escape(h) for h in headers) + r')\.'
    parts = re.split(pattern, explanation, flags=re.IGNORECASE)
    
    new_parts = []
    i = 0
    while i < len(parts):
        part = parts[i]
        
        # If it's a header, just append it
        if any(h.upper() == part.upper() for h in headers):
            new_parts.append(part + ".")
            i += 1
            if i < len(parts):
                content = parts[i]
                # If this is the STEP BY STEP part, reformat steps
                if part.upper() in ["STEP BY STEP SOLUTION", "STEP BY STEP EXPLANATION"]:
                    # 1. Newline after title
                    content = re.sub(r'^\s*(1\.\s+)?', r'\n', content)
                    # 2. Sequential steps 2, 3, etc.
                    # Replace only one occurrence of each number to be safe
                    for step_num in range(2, 31):
                        # Match something like ". 2. " or "   2. " or "\n 2. "
                        # We use \s+ or \. \s+ as prefix
                        step_pattern = rf'(?<=\.)\s*{step_num}\.\s+|(?<=\s)\s*{step_num}\.\s+|^[ \t]*{step_num}\.\s+'
                        # We use re.sub with count=1
                        content = re.sub(step_pattern, r'\n', content, count=1)
                    
                    # Cleanup: strip lines
                    lines = [line.strip() for line in content.split('\n')]
                    content = '\n'.join(lines)
                
                new_parts.append(content)
                i += 1
        else:
            new_parts.append(part)
            i += 1
            
    res = "".join(new_parts)
    
    # Final cleanup of double dots or double spaces created by splitting
    res = re.sub(r'\.+', '.', res)
    res = re.sub(r'\n+', '\n', res)
    
    # Repair common math errors if " / \n" appears
    # This specifically fixes things like "L = 2 / \n" where a "2. " was removed
    res = res.replace(" / \n", " / 2. ")
    res = res.replace(" / \r\n", " / 2. ") # Just in case

    return res

def process_all_files():
    base_path = r"d:\New folder\Coding\YUGA\mcq-backend\data\questions\mock_test"
    files = []
    for root, dirs, filenames in os.walk(base_path):
        for filename in filenames:
            if filename.startswith("mock_paper_") and filename.endswith(".json"):
                files.append(os.path.join(root, filename))

    for filepath in files:
        print(f"Repairing and Refactoring {filepath}...")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            for item in data:
                if "explanation" in item:
                    item["explanation"] = fix_explanation_v2(item["explanation"])
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"Done: {filepath}")
        except Exception as e:
            print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    process_all_files()
