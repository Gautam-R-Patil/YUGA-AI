import json
import os

mock_dirs = ["mock_test_paper_1", "mock_test_paper_2", "mock_test_paper_3", "mock_test_paper_4", "mock_test_paper_5", "mock_test_paper_6"]
base_path = r"d:\New folder\Coding\YUGA\mcq-backend\data\questions\mock_test"

report = []

for md in mock_dirs:
    paper_num = md.split('_')[-1]
    file_name = f"mock_paper_{paper_num}.json"
    file_path = os.path.join(base_path, md, file_name)
    
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            report.append(f"--- PAPER {paper_num} (Sample 5 Qs) ---")
            # Sample first 2, middle 1, last 2
            indices = [0, 1, len(data)//2, len(data)-2, len(data)-1]
            for idx in indices:
                q = data[idx]
                report.append(f"Q{q['id']} ({q['subject']}): {q['text'][:100]}...")
                report.append(f"  KEYWORDS: {q.get('keywords', {})}")
                report.append("")

with open("tts_verification_report.txt", "w", encoding='utf-8') as f:
    f.write("\n".join(report))
