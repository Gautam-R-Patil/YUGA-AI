import json
import os
import glob
from collections import defaultdict

oneshot_dir = r"d:\Coding\YUGA\mcq-backend\data\classroom\oneshorts\neet"
mock_test_dir = r"d:\Coding\YUGA\mcq-backend\data\questions\mock_test"
micro_mock_test_dir = r"d:\Coding\YUGA\mcq-backend\data\questions\micro_mock_test"

def get_oneshot_data():
    subject_chars = defaultdict(int)
    files = glob.glob(os.path.join(oneshot_dir, "**", "*.json"), recursive=True)
    for f in files:
        try:
            with open(f, 'r', encoding='utf-8') as jf:
                data = json.load(jf)
                if isinstance(data, dict):
                    subj = data.get("metadata", {}).get("subject", "Unknown")
                    script = data.get("lecture_script", "")
                    if script:
                        subject_chars[subj] += len(str(script))
        except: pass
    return subject_chars

def get_mock_test_data():
    subject_chars = defaultdict(int)
    dirs = [mock_test_dir, micro_mock_test_dir]
    for d in dirs:
        files = glob.glob(os.path.join(d, "**", "*.json"), recursive=True)
        for f in files:
            try:
                with open(f, 'r', encoding='utf-8') as jf:
                    data = json.load(jf)
                    if isinstance(data, list):
                        for item in data:
                            subj = item.get("subject", "Unknown")
                            ans = item.get("basic_answer", "")
                            exp = item.get("explanation", "")
                            if ans: subject_chars[subj] += len(str(ans))
                            if exp: subject_chars[subj] += len(str(exp))
            except: pass
    return subject_chars

os_data = get_oneshot_data()
mt_data = get_mock_test_data()

all_subjects = sorted(list(set(os_data.keys()) | set(mt_data.keys())))
cpm = 900

with open("final_results.txt", "w") as f:
    f.write(f"{'Subject':<15} | {'Oneshot (min)':<15} | {'Mock Test (min)':<15} | {'Total (min)':<15}\n")
    f.write("-" * 65 + "\n")
    total_os_min = 0
    total_mt_min = 0
    for subj in all_subjects:
        os_min = os_data[subj] / cpm
        mt_min = mt_data[subj] / cpm
        f.write(f"{subj:<15} | {os_min:>15.2f} | {mt_min:>15.2f} | {(os_min + mt_min):>15.2f}\n")
        total_os_min += os_min
        total_mt_min += mt_min
    f.write("-" * 65 + "\n")
    total_min = total_os_min + total_mt_min
    f.write(f"{'TOTAL':<15} | {total_os_min:>15.2f} | {total_mt_min:>15.2f} | {total_min:>15.2f}\n")
    f.write(f"\nTotal Hours: {total_min/60:.2f}\n")
