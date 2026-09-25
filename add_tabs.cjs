const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

const tabsUI = `
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveTab(opt.value as any)}
            className={\`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors \${
              activeTab === opt.value
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }\`}
          >
            {opt.label}
          </button>
        ))}
      </div>
`;

code = code.replace("<Card className=\"overflow-hidden border-slate-200/60 shadow-sm\">", tabsUI + "\n      <Card className=\"overflow-hidden border-slate-200/60 shadow-sm\">");

fs.writeFileSync('src/pages/KamadPages.tsx', code);
