import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = join(import.meta.dirname, '..');
const SITE_PUBLIC = join(ROOT_DIR, 'site', 'public');
const SITE_DIST = join(ROOT_DIR, 'site', 'dist');
const VENDOR_DIR = join(ROOT_DIR, 'vendor');

const args = process.argv.slice(2);
const mode = args[0] === 'dev' ? 'dev' : 'prod';

const base = mode === 'dev' ? '/' : '/4399/';

const templatePath = join(SITE_PUBLIC, 'importmap.template.json');
const outputPath = join(SITE_PUBLIC, 'importmap.json');

if (!existsSync(templatePath)) {
  console.error('Import map template not found:', templatePath);
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf-8');
const importMap = JSON.parse(template);

for (const key of Object.keys(importMap.imports)) {
  importMap.imports[key] = importMap.imports[key].replace('{{BASE}}', base);
}

mkdirSync(SITE_DIST, { recursive: true });
writeFileSync(outputPath, JSON.stringify(importMap, null, 2));
console.log('Import map generated:', outputPath);
console.log('Base path:', base);