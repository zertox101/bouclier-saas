import os

file_path = r"c:\Users\ASUS\Desktop\cyberattack\bouclier-saas\frontend\src\app\(dashboard)\alerts\page.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the accidental comment
content = content.replace('{/* ... (rest of the component structure remains the same) ... */}', '')

# Fix Archive button
archive_old = '''                    <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                       <Archive className="w-4 h-4" /> Archive
                    </button>'''

archive_new = '''                    <button 
                       onClick={() => handleArchive(selectedAlert)}
                       disabled={!!isActioning}
                       className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                       <Archive className="w-4 h-4" /> {isActioning === 'archiving' ? 'Archiving...' : 'Archive'}
                    </button>'''

# Fix Investigate button
investigate_old = '''                       <button className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                          Investigate in Graph
                       </button>'''

investigate_new = '''                       <button 
                          onClick={() => handleInvestigate(selectedAlert)}
                          disabled={!!isActioning}
                          className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
                       >
                          {isActioning === 'investigating' ? 'TRANSITIONING...' : 'Investigate in Graph'}
                       </button>'''

content = content.replace(archive_old, archive_new)
content = content.replace(investigate_old, investigate_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restoration and connection complete.")
