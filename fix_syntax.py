import os
import re

frontend_dir = 'frontend'

def fix_content(content):
    # 1. replace literal backslash quotes with quotes
    content = content.replace('\\"', '"')
    
    # 2. merge duplicate classNames with strings
    for _ in range(5):
        content = re.sub(r'className="([^"]*)"\s*className="([^"]*)"', r'className="\1 \2"', content)
        
    # 3. merge duplicate classNames where the second is an expression
    content = re.sub(r'className="([^"]*)"\s*className=\{([^}]+)\}', r'className={`\1 ${\2}`}', content)
    
    return content

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            new_content = fix_content(content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Fixed {path}')
