import json
with open('data/questions/mock_test/mock_test_paper_1/mock_paper_1.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    for item in data:
        if item['id'] == 83:
            text = item['explanation']
            for char in text:
                if ord(char) > 127:
                    print(f"Char: {char}, Code: {hex(ord(char))}")
