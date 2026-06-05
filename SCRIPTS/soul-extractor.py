#!/usr/bin/env python3
"""
soul-extractor.py — Extract user prompts from RRL JSONL files.
Handles the actual Claude Code JSONL format with environment_details, tool_results, pasted content, etc.
Output: clean user text, one prompt per line.
"""
import json, re, sys, os

def extract_soul_from_rrl(rrl_path):
    user_prompts = []
    with open(rrl_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                msg = obj.get('message', {})
                if msg.get('role') != 'user':
                    continue
                
                content = msg.get('content', '')
                if isinstance(content, str):
                    text = content
                elif isinstance(content, list):
                    texts = []
                    for item in content:
                        if isinstance(item, dict) and item.get('type') == 'text':
                            texts.append(item.get('text', ''))
                    text = '\n'.join(texts)
                else:
                    continue
                
                # Remove system injections
                text = re.sub(r'<environment_details>.*?</environment_details>', '', text, flags=re.DOTALL)
                text = re.sub(r'<command-message>.*?</command-message>', '', text, flags=re.DOTALL)
                text = re.sub(r'<command-name>.*?</command-name>', '', text, flags=re.DOTALL)
                text = re.sub(r'<local-command-caveat>.*?</local-command-caveat>', '', text, flags=re.DOTALL)
                text = re.sub(r'<local-command-stdout>.*?</local-command-stdout>', '', text, flags=re.DOTALL)
                text = re.sub(r'<command-args>.*?</command-args>', '', text, flags=re.DOTALL)
                text = re.sub(r'\[Pasted text #\d+\s*\+?\d* lines?\]', '', text)
                text = text.strip()
                
                if len(text) > 3:
                    user_prompts.append(text)
            except Exception:
                continue
    return user_prompts

if __name__ == '__main__':
    rrl_path = sys.argv[1] if len(sys.argv) > 1 else r'D:\OB-1-CANONICAL\RRL\RRL-65.txt'
    prompts = extract_soul_from_rrl(rrl_path)
    print(f'=== SOUL from {os.path.basename(rrl_path)} — {len(prompts)} prompts ===\n')
    for i, p in enumerate(prompts, 1):
        print(f'[{i}] {p[:500]}')
        print()
