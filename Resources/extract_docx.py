import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
        
        tree = ET.fromstring(xml_content)
        
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text = []
        for paragraph in tree.iterfind('.//w:p', namespaces):
            para_text = []
            for run in paragraph.iterfind('.//w:t', namespaces):
                if run.text:
                    para_text.append(run.text)
            if para_text:
                text.append(''.join(para_text))
            else:
                text.append('')
        
        return '\n'.join(text)
    except Exception as e:
        return str(e)

with open(r'd:\AICourse26\Homeworks\HW05\Resources\extracted_text.txt', 'w', encoding='utf-8') as f:
    f.write(extract_text_from_docx(r'd:\AICourse26\Homeworks\HW05\Resources\top10_machine_learning_algorithms_研讀報告.docx'))
