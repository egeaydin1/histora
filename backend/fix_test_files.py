#!/usr/bin/env python3
"""
Script to fix all test_ files for Railway compatibility.
"""
import os
import glob
from pathlib import Path

def fix_test_file(file_path):
    """Fix a single test file."""
    print(f"🔧 Fixing {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already fixed
    if 'from test_config import *' in content:
        print(f"✅ {file_path} already fixed")
        return
    
    lines = content.split('\n')
    new_lines = []
    skip_until_async = False
    
    for i, line in enumerate(lines):
        if i == 0 and line.startswith('#!/usr/bin/env python3'):
            new_lines.append(line)
        elif i < 10 and line.startswith('"""') and not skip_until_async:
            new_lines.append(line.replace('"""', '"""\nTest file - Railway compatible.\n"""') if '"""' in line and len(line) > 3 else line)
        elif line.startswith('import os') or line.startswith('import sys') or line.startswith('from pathlib'):
            # Skip these imports, we'll use test_config
            continue
        elif 'Add the backend directory' in line or 'Set environment variables' in line:
            skip_until_async = True
            continue
        elif skip_until_async and (line.startswith('async def') or line.startswith('def ') or line.startswith('class ')):
            skip_until_async = False
            new_lines.append('from test_config import *')
            new_lines.append('')
            new_lines.append(line)
        elif skip_until_async:
            continue
        elif 'http://localhost:8000' in line:
            new_lines.append(line.replace('http://localhost:8000', '${get_base_url()}'))
        elif 'base_url = "http://localhost:8000/api/v1' in line:
            new_lines.append('    base_url = get_api_base_url()')
        else:
            new_lines.append(line)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print(f"✅ Fixed {file_path}")

def main():
    """Fix all test files."""
    backend_dir = Path(__file__).parent
    test_files = glob.glob(str(backend_dir / "test_*.py"))
    
    for test_file in test_files:
        if 'test_config.py' in test_file or 'fix_test_files.py' in test_file:
            continue
        fix_test_file(test_file)
    
    print(f"🎉 Fixed {len(test_files)} test files!")

if __name__ == "__main__":
    main()
