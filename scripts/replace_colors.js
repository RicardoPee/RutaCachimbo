const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-white dark:bg-slate-900/g, replacement: 'bg-card' },
  { regex: /bg-slate-50 dark:bg-slate-900/g, replacement: 'bg-muted' },
  { regex: /bg-slate-100 dark:bg-slate-800/g, replacement: 'bg-muted' },
  { regex: /bg-slate-100 dark:bg-slate-900/g, replacement: 'bg-muted' },
  { regex: /bg-slate-50\/50 dark:bg-slate-900\/50/g, replacement: 'bg-muted/50' },
  { regex: /border-slate-200 dark:border-slate-800/g, replacement: 'border-border' },
  { regex: /border-neutral-200 dark:border-slate-800/g, replacement: 'border-border' },
  { regex: /text-slate-500 dark:text-slate-400/g, replacement: 'text-muted-foreground' },
  { regex: /text-slate-600 dark:text-slate-300/g, replacement: 'text-muted-foreground' },
  { regex: /text-neutral-500 dark:text-neutral-400/g, replacement: 'text-muted-foreground' },
  { regex: /text-slate-800 dark:text-slate-200/g, replacement: 'text-foreground' },
  { regex: /text-slate-700 dark:text-slate-200/g, replacement: 'text-foreground' },
  { regex: /text-neutral-800 dark:text-neutral-200/g, replacement: 'text-foreground' },
  { regex: /text-neutral-700 dark:text-neutral-200/g, replacement: 'text-foreground' },
  { regex: /bg-slate-900 border-2 border-slate-800/g, replacement: 'bg-card border-2 border-border' },
  { regex: /dark:bg-slate-900/g, replacement: 'dark:bg-card' },
  { regex: /dark:bg-slate-950/g, replacement: 'dark:bg-background' },
  { regex: /dark:border-slate-800/g, replacement: 'dark:border-border' },
  { regex: /dark:text-slate-400/g, replacement: 'dark:text-muted-foreground' },
  { regex: /dark:text-slate-200/g, replacement: 'dark:text-foreground' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, '../app'));
processDirectory(path.join(__dirname, '../components'));
console.log("Done");
console.log("Done");
