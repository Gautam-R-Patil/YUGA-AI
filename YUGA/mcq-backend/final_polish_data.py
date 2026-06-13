import json
import os
import re

def fix_explanation_final(item):
    explanation = item.get("explanation", "")
    if not explanation:
        return explanation
    
    # 1. Repair specific known errors from previous pass
    # Solve the "L = 2 / 2. L = 1 H" math break
    explanation = explanation.replace("L = 2 /\nL = 1 H", "L = 2 / 2. L = 1 H")
    
    # 2. Standardize formatting of "STEP BY STEP SOLUTION"
    # User wanted: "STEP BY STEP SOLUTION. \nStep 1 \nStep 2"
    if "STEP BY STEP SOLUTION" in explanation:
        # Ensure space before \n as requested in their prompt
        explanation = re.sub(r'STEP BY STEP SOLUTION\.\s*\n?', 'STEP BY STEP SOLUTION. \n', explanation, flags=re.IGNORECASE)
    
    # 3. Clean up formatting around other headers
    for header in ["CORE CONCEPT", "WHY THIS ANSWER", "COMMON MISTAKES", "FINAL RESULT", "CONCLUSION"]:
        explanation = re.sub(rf'\.\s*{header}', f'. {header}', explanation)
    
    # 4. Remove any accidentally doubled dots
    explanation = re.sub(r'\.\.', '.', explanation)
    
    return explanation

def process_all_files():
    base_path = r"d:\New folder\Coding\YUGA\mcq-backend\data\questions\mock_test"
    files = []
    for root, dirs, filenames in os.walk(base_path):
        for filename in filenames:
            if filename.startswith("mock_paper_") and filename.endswith(".json"):
                files.append(os.path.join(root, filename))

    for filepath in files:
        print(f"Final Polish for {filepath}...")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            for item in data:
                if isinstance(item, dict):
                    item["explanation"] = fix_explanation_final(item)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"Done: {filepath}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    process_all_files()
