import os
import re

frontend_dir = 'frontend'

replacements = [
    # General ##982598 as primary text
    (r'style=\{\{\s*color:\s*[\'\"]##982598[\'\"]\s*\}\}', r'className=\"text-primary\"'),
    
    # ##982598 as primary background
    (r'style=\{\{\s*background:\s*[\'\"]##982598[\'\"]\s*\}\}', r'className=\"bg-primary\"'),
    
    # Hero / Buttons with text-primary-foreground
    (r'style=\{\{\s*background:\s*[\'\"]##982598[\'\"]\s*,\s*color:\s*[\'\"]#000[\'\"]\s*\}\}', r'className=\"bg-primary text-primary-foreground\"'),

    # Background rgba(89,225,132,0.06) -> bg-primary/10 (close enough)
    (r'style=\{\{\s*background:\s*[\'\"]rgba\(89,225,132,0\.06\)[\'\"]\s*\}\}', r'className=\"bg-primary/10\"'),

    # Complex badge style
    (r'className=\"([^\"]*)\"\s*style=\{\{\s*color:\s*[\'\"]##982598[\'\"]\s*,\s*borderColor:\s*[\'\"]rgba\(89,225,132,0\.\d+\)[\'\"]\s*,\s*background:\s*[\'\"]rgba\(89,225,132,0\.\d+\)[\'\"]\s*\}\}', r'className=\"\1 text-primary border-primary/30 bg-primary/10\"'),
    
    (r'style=\{\{\s*color:\s*[\'\"]##982598[\'\"]\s*,\s*borderColor:\s*[\'\"]rgba\(89,225,132,0\.\d+\)[\'\"]\s*,\s*background:\s*[\'\"]rgba\(89,225,132,0\.\d+\)[\'\"]\s*\}\}', r'className=\"text-primary border-primary/30 bg-primary/10\"'),

    # Background gradient in HowItWorks and others
    (r'style=\{\{\s*background:\s*[\'\"]radial-gradient\(circle, rgba\(89,225,132,0\.12\) 0%, transparent 70%\)[\'\"]\s*\}\}', r'className=\"bg-[radial-gradient(circle,var(--color-primary)_0%,transparent_70%)] opacity-30\"'),
    
    (r'style=\{\{\s*background:\s*[\'\"]linear-gradient\(to bottom, transparent, rgba\(89,225,132,0\.25\), transparent\)[\'\"]\s*\}\}', r'className=\"bg-[linear-gradient(to_bottom,transparent,var(--color-primary),transparent)] opacity-25\"'),

    (r'style=\{\{\s*background:\s*[\'\"]linear-gradient\(to bottom, transparent 0%, rgba\(89,225,132,0\.15\) 10%, rgba\(89,225,132,0\.15\) 90%, transparent 100%\)[\'\"]\s*\}\}', r'className=\"bg-[linear-gradient(to_bottom,transparent_0%,var(--color-primary)_10%,var(--color-primary)_90%,transparent_100%)] opacity-15\"'),
    
    # Specific color rgba(89,225,132,0.06)
    (r'style=\{\{\s*color:\s*[\'\"]rgba\(89,225,132,0\.06\)[\'\"]\s*\}\}', r'className=\"text-primary/10\"'),

    # Nav tertiary -> primary
    (r'style=\{\{\s*backgroundColor:\s*[\'\"]var\(--tertiary\)[\'\"]\s*\}\}', r'className=\"bg-primary\"'),
    
    # text-white to text-foreground globally (careful but let\'s do it)
    (r'text-white\/([0-9]+)', r'text-foreground/\1'),
    (r'text-white\b(?!/)', r'text-foreground'),
    (r'bg-white\/([0-9]+)', r'bg-foreground/\1'),
    (r'border-white\/([0-9]+)', r'border-foreground/\1'),

    # remaining specific inline style string replacements for page.tsx
    (r'style=\{\{\s*color:\s*h\.done \? [\'\"]##982598[\'\"] : [\'\"]rgba\(255,255,255,0\.3\)[\'\"]\s*\}\}', r'className={h.done ? \"text-primary\" : \"text-foreground/30\"}'),
    (r'style=\{\{\s*width:\s*`\$\{h\.pct\}%`,\s*background:\s*h\.done\s*\?\s*[\'\"]##982598[\'\"]\s*:\s*[\'\"]linear-gradient\(to right, ##982598aa, ##98259855\)[\'\"]\s*\}\}', r'style={{ width: `${h.pct}%` }} className={h.done ? \"bg-primary\" : \"bg-primary/50\"}'),
    (r'style=\{\{\s*background:\s*[\'\"]rgba\(255,255,255,0\.03\)[\'\"]\s*,\s*boxShadow:\s*[\'\"]0 0 80px rgba\(89,225,132,0\.12\), inset 0 0 40px rgba\(89,225,132,0\.04\)[\'\"]\s*\}\}', r'className=\"bg-foreground/5 shadow-[0_0_80px_var(--color-primary),inset_0_0_40px_var(--color-primary)]\" style={{ boxShadow: \"0 0 80px color-mix(in srgb, var(--primary) 12%, transparent), inset 0 0 40px color-mix(in srgb, var(--primary) 4%, transparent)\" }}'),
    (r'style=\{\{\s*background:\s*[\'\"]linear-gradient\(to bottom, transparent, var\(--background\)\)[\'\"]\s*,\s*zIndex:\s*5\s*,\s*\}\}', r'className=\"z-[5] bg-gradient-to-b from-transparent to-background\"')
]

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            orig_content = content
            for pattern, repl in replacements:
                content = re.sub(pattern, repl, content)
                
            if content != orig_content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated {path}')
