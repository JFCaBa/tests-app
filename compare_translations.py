
import re
import os
import json

def parse_js_to_dict_advanced(js_content):
    # Remove 'export default ' and the trailing semicolon/whitespace
    content = js_content.replace('export default ', '').strip()
    if content.endswith(';'):
        content = content[:-1]

    # Normalize string literals: replace single quotes and backticks with double quotes
    # Ensure that escaped single quotes within strings are not affected by the replacement
    content = re.sub(r"(?<=[^\\])'([^']*?)(?<![\\])'", r'"\1"', content)
    content = re.sub(r'`([^`]+)`', r'"\1"', content)

    # Add quotes to unquoted keys
    content = re.sub(r'([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', content)

    # Handle multiline string values by replacing newlines with \n
    # This regex looks for a double quote, then any characters (non-greedy) including newlines, then another double quote.
    # It replaces newlines within these quoted strings with \n.
    content = re.sub(r'"([^ "]*?)"', lambda m: '"' + m.group(1).replace('\n', '\\n') + '"', content, flags=re.DOTALL)

    # Remove trailing commas from objects and arrays
    content = re.sub(r',(\s*[}\]])', r'\1', content)

    # Replace {{variable}} with a placeholder for comparison
    content = re.sub(r'\{\{([a-zA-Z0-9_]+)\}\}', r'__VAR__\1__', content)

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"Problematic content snippet: {content[max(0, e.pos-50):e.pos+50]}")
        raise

def get_all_keys(obj, prefix=''):
    keys = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_prefix = f"{prefix}.{k}" if prefix else k
            keys.append(new_prefix)
            keys.extend(get_all_keys(v, new_prefix))
    elif isinstance(obj, list):
        for item in obj:
            keys.extend(get_all_keys(item, prefix))
    return keys

en_file_path = "/opt/testmyrussian/repo/frontend/src/i18n/translations/en.ts"
es_file_path = "/opt/testmyrussian/repo/frontend/src/i18n/translations/es.ts"

with open(en_file_path, 'r', encoding='utf-8') as f:
    en_content = f.read()
with open(es_file_path, 'r', encoding='utf-8') as f:
    es_content = f.read()

en_data = parse_js_to_dict_advanced(en_content)
es_data = parse_js_to_dict_advanced(es_content)

en_keys = set(get_all_keys(en_data))
es_keys = set(get_all_keys(es_data))

missing_keys = en_keys - es_keys

if missing_keys:
    print("The following keys are present in en.ts but missing in es.ts:")
    for key in sorted(missing_keys):
        print(key)
else:
    print("All keys from en.ts are present in es.ts.")
