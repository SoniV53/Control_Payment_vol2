const fs = require('fs');
const path = require('path');
function findInDir(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findInDir(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = findInDir('./src/app', /\.html$/);
const tsFiles = findInDir('./src/app', /\.ts$/);

const iconRegex = /(?:<ion-icon[^>]*name=["']([^"']+)["'])|(?:getIcon\([^"']*["']([^"']+)["'][^)]*\))/g;
const icons = new Set();

for (const file of [...htmlFiles, ...tsFiles]) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = iconRegex.exec(content)) !== null) {
    if (match[1]) icons.add(match[1]);
    if (match[2]) icons.add(match[2]);
  }
}

const assetsDir = './src/assets/ionicons';
let existing = [];
if (fs.existsSync(assetsDir)) {
  existing = fs.readdirSync(assetsDir).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', ''));
}

const existingSet = new Set(existing);
const missing = [...icons].filter(i => !existingSet.has(i));

console.log('--- MISSING ICONS ---');
missing.sort().forEach(i => console.log(i));
