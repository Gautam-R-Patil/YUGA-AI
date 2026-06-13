import json
import os
import re

def fix_explanation(explanation):
    if not explanation or "STEP BY STEP SOLUTION" not in explanation:
        return explanation
    
    # 1. Newline after title, remove "1. " if present right after
    # We match "STEP BY STEP SOLUTION." with case-insensitive and allow for space/newline after it.
    explanation = re.sub(r'(STEP BY STEP SOLUTION\.)\s*(1\.\s+)?', r'\1\n', explanation, flags=re.IGNORECASE)
    
    # 2. Subsequent numbers to newlines (2. through 30.)
    # We look for a previous ending (typically ". ") followed by the number " N. "
    # Sometimes it's multiple spaces.
    for i in range(2, 31):
        pattern = rf'[\.\s]+\s*{i}\.\s+'
        # Replace occurrences with a single newline
        explanation = re.sub(pattern, '\n', explanation)
        
    # 3. Handle cases where steps were separated by " - " or " • " if needed?
    # User specifically mentioned numbers, so we skip other symbols to be safe.
        
    # Final cleanup: remove trailing whitespace per line to keep it clean
    lines = [line.strip() for line in explanation.split('\n')]
    return '\n'.join(lines)

def fix_keywords(item):
    subject = item.get("subject", "").lower()
    keywords = item.get("keywords", {})
    if not keywords or not isinstance(keywords, dict):
        return keywords
        
    new_keywords = {}
    
    # Meta-keywords to exclude generally
    exclude = {
        "EXPLANATION", "CORE", "CONCEPT", "STEP", "SOLUTION", "CONCLUSION", 
        "CORRECT", "ANSWER", "COMMON", "MISTAKES", "NEET", "ANALYSIS", 
        "STRUCTURE", "OPTION", "B", "C", "D"
    }
    
    for k, v in keywords.items():
        k_upper = str(k).upper()
        
        # 1. Handle "A": "ampere" accuracy issue
        if k_upper == "A":
            if v.lower() == "ampere":
                text_context = (item.get('text', '') + " " + item.get('explanation', '') + " " + item.get('basic_answer', '')).lower()
                # Physics/Chemistry context check
                is_physics = any(kw in subject for kw in ["physics", "chemistry", "electricity"])
                has_current_context = any(kw in text_context for kw in ["current", "circuit", "ampere", " 2 a", " 5 a", " 1 a", "10 a"])
                if is_physics and has_current_context:
                    new_keywords[k] = v
                continue # If not valid physics/current context, it's garbage
            else:
                # Other "A" mappings (usually single letter noise)
                continue
            
        # 2. Exclude meta-keywords and option labels
        if k_upper in exclude:
            continue
            
        # 3. Clean up exploded acronyms (e.g. "DNA": "D N A")
        if v.replace(" ", "").upper() == k_upper and len(k_upper) > 1:
            continue
            
        new_keywords[k] = v
            
    return new_keywords

def process_all_files():
    base_path = r"d:\New folder\Coding\YUGA\mcq-backend\data\questions\mock_test"
    
    files = []
    # Search for all mock_paper_*.json files in subdirectories
    for root, dirs, filenames in os.walk(base_path):
        for filename in filenames:
            if filename.startswith("mock_paper_") and filename.endswith(".json"):
                files.append(os.path.join(root, filename))

    total_files = len(files)
    questions_processed = 0
    
    for filepath in files:
        print(f"Processing {filepath}...")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not isinstance(data, list):
                print(f"Skipping {filepath}: not a list")
                continue
                
            for item in data:
                if not isinstance(item, dict): continue
                
                # Apply reformatting to explanation
                if "explanation" in item:
                    item["explanation"] = fix_explanation(item["explanation"])
                
                # Apply keyword cleaning
                if "keywords" in item:
                    item["keywords"] = fix_keywords(item)
                
                questions_processed += 1
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"Done: {filepath}")
        except Exception as e:
            print(f"Error processing {filepath}: {e}")

    print(f"\nFinal Summary: Processed {total_files} files and {questions_processed} questions.")

if __name__ == "__main__":
    process_all_files()
