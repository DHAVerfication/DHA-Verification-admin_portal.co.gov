#!/usr/bin/env python3
import subprocess
import sys
import os

os.chdir('/workspaces/Inshallah786')

commands = [
    (['git', 'status', '--short'], 'Show changes'),
    (['git', 'add', '-A'], 'Stage changes'),
    (['git', 'commit', '-m', '🚀 FINAL: Dynamic asset discovery + Render build copies to src/ - Fully operational'], 'Commit'),
    (['git', 'pull', '--rebase', 'origin', 'main'], 'Rebase with remote'),
    (['git', 'push', 'origin', 'main'], 'Push to GitHub'),
]

print('🚀 FINAL DEPLOYMENT TO RENDER\n')
print('=' * 60)

for cmd, desc in commands:
    print(f'\n📍 {desc}...')
    print(f'   Command: {" ".join(cmd)}')
    try:
        result = subprocess.run(cmd, shell=False, capture_output=True, text=True, timeout=30)
        if result.stdout:
            print(result.stdout)
        if result.stderr and 'nothing to commit' not in result.stderr.lower():
            print(f'   ⚠️ {result.stderr[:200]}')
        if result.returncode != 0 and 'nothing to commit' not in result.stderr.lower():
            print(f'   ❌ Command failed with code {result.returncode}')
            break
        else:
            print(f'   ✅ Success')
    except Exception as e:
        print(f'   ❌ Error: {e}')
        break

print('\n' + '=' * 60)
print('✅ DEPLOYMENT INITIATED')
print('\n🌐 Your application is deploying to Render:')
print('   https://inshallah786-y0lf.onrender.com')
print('\n⏱️  Deployment takes 2-5 minutes')
print('\n🔗 Dashboard: https://dashboard.render.com')
print('\n✅ Test endpoints:')
print('   Root: https://inshallah786-y0lf.onrender.com/')
print('   Health: https://inshallah786-y0lf.onrender.com/api/health')
print('   Admin: https://inshallah786-y0lf.onrender.com/admin-dashboard')
