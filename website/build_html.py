import os
import re

text_file = r'd:\AICourse26\Homeworks\HW05\Resources\extracted_text.txt'
output_html = r'd:\AICourse26\Homeworks\HW05\website\index.html'

with open(text_file, 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f.readlines()]

html_template = """<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="TOP 10 機器學習演算法研讀報告">
    <title>TOP 10 機器學習演算法研讀報告</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="sidebar">
        <div class="logo">ML Algorithms</div>
        <nav id="toc"></nav>
    </div>
    <main class="content">
        <header class="hero">
            <h1 class="hero-title">TOP 10<br>機器學習演算法<br>研讀報告</h1>
            <p class="hero-subtitle">詳細說明、範例、圖文對照與實作導讀</p>
        </header>
        <div class="article-body">
            {content}
        </div>
    </main>
    <script>
        // Generate TOC
        const toc = document.getElementById('toc');
        const headings = document.querySelectorAll('.article-body h2, .article-body h3');
        const ul = document.createElement('ul');
        headings.forEach((heading, index) => {
            if(!heading.id) heading.id = 'heading-' + index;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + heading.id;
            a.textContent = heading.textContent;
            a.className = 'toc-link ' + heading.tagName.toLowerCase();
            li.appendChild(a);
            ul.appendChild(li);
        });
        toc.appendChild(ul);
        
        // Highlight active TOC item
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.toc-link').forEach(link => {
                        link.classList.remove('active');
                        if(link.getAttribute('href') === '#' + entry.target.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: "0px 0px -80% 0px" });
        headings.forEach(h => observer.observe(h));
    </script>
</body>
</html>
"""

content = []
image_counter = 1
in_table = False
table_buffer = []

def format_code(code_str):
    keywords = ["model =", "pred =", "prob ="]
    for kw in keywords:
        code_str = code_str.replace(kw, "\n" + kw)
    return code_str.strip()

for i, line in enumerate(lines):
    if not line:
        continue
    
    if line == "TOP 10機器學習演算法研讀報告" or line == "詳細說明、範例、圖文對照與實作導讀":
        continue # Skipped, handled by hero
        
    if line.startswith("圖 "):
        content.append(f'<figure class="image-card"><img src="images/image{image_counter}.png" alt="{line}"><figcaption>{line}</figcaption></figure>')
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
            content.append('<div class="table-container"><table>')
            content.append('<thead><tr>')
            for j in range(5):
                content.append(f'<th>{table_buffer[j]}</th>')
            content.append('</tr></thead><tbody>')
            
            row_data = table_buffer[5:-1]
            for r in range(0, len(row_data), 5):
                if r + 4 < len(row_data):
                    content.append('<tr>')
                    for c in range(5):
                        content.append(f'<td>{row_data[r+c]}</td>')
                    content.append('</tr>')
            content.append('</tbody></table></div>')
            content.append(f'<p class="table-caption">{table_buffer[-1]}</p>')
            continue
        continue

    # Code blocks
    if "from sklearn" in line and "model =" in line:
        formatted = format_code(line)
        content.append(f'<pre class="code-block"><code>{formatted}</code></pre>')
        continue

    # Headings
    if re.match(r'^\d+\.\s+[A-Za-z]+', line) or line in ["目錄", "總覽表：十大演算法比較", "報告目的與閱讀方式", "從問題型態看演算法分類", "機器學習流程與 CRISP-DM 觀念", "附錄 A：如何選擇演算法", "附錄 B：評估指標與常見陷阱", "參考資料"]:
        content.append(f'<h2 class="section-title">{line}</h2>')
        continue
    
    if line in ["核心直覺與學習目標", "範例情境", "優點", "限制與注意事項", "Python 入門範例", "延伸實作建議與報告寫法"]:
        content.append(f'<h3>{line}</h3>')
        continue

    # List items
    if line.startswith("章節定位："):
        content.append(f'<p class="meta-info"><strong>{line.split("：", 1)[0]}：</strong> {line.split("：", 1)[1]}</p>')
        continue

    content.append(f'<p>{line}</p>')

html_output = html_template.replace("{content}", "\n".join(content))

with open(output_html, 'w', encoding='utf-8') as f:
    f.write(html_output)
print("index.html created successfully.")
