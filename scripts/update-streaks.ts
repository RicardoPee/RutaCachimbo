import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      findFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const appDir = path.join(__dirname, '../app');
const files = findFiles(appDir);

let count = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<UserProgress') && content.includes('hasActiveSubscription=')) {
    if (!content.includes('streak={')) {
      content = content.replace(
        /hasActiveSubscription=\{([^}]+)\}/g,
        'hasActiveSubscription={$1}\n          streak={userProgress.streak}'
      );
      fs.writeFileSync(file, content);
      count++;
    }
  }
}
console.log(`Se inyectó la Racha (Streak) en ${count} pantallas automáticamente.`);
