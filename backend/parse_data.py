import os
import re
import json

text_file = r'd:\AICourse26\Homeworks\HW05\Resources\extracted_text.txt'
output_json = r'd:\AICourse26\Homeworks\HW05\backend\data.json'

with open(text_file, 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f.readlines()]

data = {
    "general": [],
    "topics": []
}

current_topic = None
image_counter = 1
in_table = False
table_buffer = []
seen_topic_ids = set()

def format_code(code_str):
    keywords = ["model =", "pred =", "prob ="]
    for kw in keywords:
        code_str = code_str.replace(kw, "\n" + kw)
    return code_str.strip()

def append_block(block):
    if current_topic:
        current_topic['content'].append(block)
    else:
        data["general"].append(block)

for line in lines:
    if not line:
        continue
    if line == "TOP 10機器學習演算法研讀報告" or line == "詳細說明、範例、圖文對照與實作導讀":
        continue
        
    if line.startswith("圖 "):
        append_block({
            "type": "image",
            "url": f"/static/images/image{image_counter}.png",
            "caption": line
        })
        image_counter += 1
        continue
        
    if line == "#":
        in_table = True
        table_buffer = ["#"]
        continue
        
    if in_table:
        table_buffer.append(line)
        if line.startswith("表 0-1"):
            in_table = False
            # process table
            headers = table_buffer[:5]
            rows = []
            row_data = table_buffer[5:-1]
            for r in range(0, len(row_data), 5):
                if r + 4 < len(row_data):
                    rows.append(row_data[r:r+5])
            
            append_block({
                "type": "table",
                "headers": headers,
                "rows": rows,
                "caption": table_buffer[-1]
            })
            continue
        continue

    # New topic check
    match = re.match(r'^(\d+)\.\s+(.*)', line)
    if match and any(kw in line for kw in ['Linear', 'Logistic', 'Tree', 'Forest', 'SVM', 'KNN', 'Naive', 'Clustering', 'PCA', 'Deep']):
        topic_id = match.group(1)
        if topic_id in seen_topic_ids:
            # We found the actual chapter, let's find the existing topic and set it as current
            for t in data['topics']:
                if t['id'] == topic_id:
                    current_topic = t
                    break
        else:
            # First time seeing it (Table of Contents), just add it to topics but don't set as current_topic
            new_topic = {
                'id': topic_id,
                'title': line,
                'content': []
            }
            data['topics'].append(new_topic)
            seen_topic_ids.add(topic_id)
            current_topic = None
        continue

    # Code blocks
    if "from sklearn" in line and "model =" in line:
        append_block({
            "type": "code",
            "content": format_code(line)
        })
        continue

    # Subheadings
    if line in ["目錄", "總覽表：十大演算法比較", "報告目的與閱讀方式", "從問題型態看演算法分類", "機器學習流程與 CRISP-DM 觀念", "附錄 A：如何選擇演算法", "附錄 B：評估指標與常見陷阱", "參考資料"]:
        append_block({
            "type": "h2",
            "content": line
        })
        continue
    
    if line in ["核心直覺與學習目標", "範例情境", "優點", "限制與注意事項", "Python 入門範例", "延伸實作建議與報告寫法"]:
        append_block({
            "type": "h3",
            "content": line
        })
        continue

    if line.startswith("章節定位："):
        append_block({
            "type": "meta",
            "content": line
        })
        continue

    # Default paragraph
    append_block({
        "type": "paragraph",
        "content": line
    })

with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("data.json created successfully.")
