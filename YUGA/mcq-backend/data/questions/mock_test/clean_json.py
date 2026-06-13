
import json
import os
import re

def clean_text(text):
    if not isinstance(text, str):
        return text
    
    # 1. Remove bolding **
    text = text.replace("**", "")
    
    # 2. Fix 20000 and 28000 pronunciation
    text = text.replace("20000", "20,000")
    text = text.replace("28000", "28,000")
    
    # 3. Handle "NN" issue (newlines read as N)
    # Replace double and single newlines with space or period
    text = text.replace("\\n\\n", ". ")
    text = text.replace("\n\n", ". ")
    text = text.replace("\\n", " ")
    text = text.replace("\n", " ")
    
    # 4. Remove leading/trailing spaces
    text = text.strip()
    
    # 5. Revert "eye-on" and "eye on" back to "ion"
    # Previously, "ion" was replaced with "eye-on" or "eye on", which caused display spelling issues.
    text = re.sub(r'\beye-ons\b', 'ions', text, flags=re.IGNORECASE)
    text = re.sub(r'\beye-on\b', 'ion', text, flags=re.IGNORECASE)
    text = re.sub(r'\beye ons\b', 'ions', text, flags=re.IGNORECASE)
    text = re.sub(r'\beye on\b', 'ion', text, flags=re.IGNORECASE)
    
    # 6. Fix hyphen as minus issue for text words
    # Replace hyphens in non-math words with spaces (e.g. Step-by-step)
    text = re.sub(r'([a-zA-Z])\-([a-zA-Z])', r'\1 \2', text)
    
    # 7. "The" as "T-h-e" issue
    # If "The" is followed by a space at the start of a sentence/string, some TTS might spell it out if they think it's an initial.
    # Let's try to ensure it's not all-caps and has no unusual characters.
    # (Actually it's usually already correct, but we'll normalize it).

    return text

def process_file(filepath):
    print(f"Processing {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for item in data:
            if "explanation" in item:
                item["explanation"] = clean_text(item["explanation"])
            if "basic_answer" in item:
                item["basic_answer"] = clean_text(item["basic_answer"])
            if "text" in item:
                item["text"] = clean_text(item["text"])
            
            # Empty keywords as per user preference
            item["keywords"] = {}
            
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

base_dir = r"d:\New folder\Coding\YUGA\mcq-backend\data\questions\mock_test"
files = [
    os.path.join(base_dir, r"mock_test_paper_1\mock_paper_1.json"),
    os.path.join(base_dir, r"mock_test_paper_2\mock_paper_2.json"),
    os.path.join(base_dir, r"mock_test_paper_3\mock_paper_3.json"),
    os.path.join(base_dir, r"mock_test_paper_4\mock_paper_4.json"),
    os.path.join(base_dir, r"mock_test_paper_5\mock_paper_5.json"),
    os.path.join(base_dir, r"mock_test_paper_6\mock_paper_6.json"),
]

for f in files:
    if os.path.exists(f):
        process_file(f)
    else:
        print(f"File not found: {f}")
