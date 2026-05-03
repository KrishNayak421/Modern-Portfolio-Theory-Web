import os
import glob
import re

frontend_dir = r'c:\Users\Divya\OneDrive\Desktop\Modern-Portfolio-Theory-Web\frontend\src'

for root, _, files in os.walk(frontend_dir):
    for f in files:
        if f.endswith('.js') or f.endswith('.tsx') or f.endswith('.ts'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Replace import "../styles/something.css" with import "@/styles/something.css"
            new_content = re.sub(r'import\s+[\"\']\.\./styles/(.*\.css)[\"\']', r'import "@/styles/\1"', content)
            new_content = re.sub(r'import\s+[\"\']\.\./\.\./styles/(.*\.css)[\"\']', r'import "@/styles/\1"', new_content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f'Updated {filepath}')
