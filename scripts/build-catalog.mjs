import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const GAMES_DIR = join(ROOT_DIR, 'games');
const OUTPUT_FILE = join(ROOT_DIR, 'site', 'public', 'catalog.json');

function parseYAML(content) {
  const result = {};
  const lines = content.split('\n');
  const keyStack = [{ obj: result, indent: -1, key: null }];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const indent = line.match(/^\s*/)?.[0]?.length || 0;
    
    // Pop stack until we find parent with smaller indent
    while (keyStack.length > 1 && keyStack[keyStack.length - 1].indent >= indent) {
      keyStack.pop();
    }
    
    const currentObj = keyStack[keyStack.length - 1].obj;
    
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      
      if (value === '' || value === '[]') {
        // Check if next line is indented (nested object or list)
        let isNested = false;
        let isList = false;
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          const nextTrimmed = nextLine.trim();
          if (!nextTrimmed || nextTrimmed.startsWith('#')) continue;
          const nextIndent = nextLine.match(/^\s*/)?.[0]?.length || 0;
          if (nextIndent > indent) {
            isNested = true;
            isList = nextTrimmed.startsWith('- ');
            break;
          }
          break;
        }
        
        if (isNested) {
          currentObj[key] = isList ? [] : {};
          keyStack.push({ obj: currentObj[key], indent, key });
        } else {
          currentObj[key] = [];
        }
      } else {
        currentObj[key] = parseValue(value);
      }
      continue;
    }
    
    // List item
    if (trimmed.startsWith('- ')) {
      const item = trimmed.slice(2).trim();
      const parent = keyStack[keyStack.length - 1];
      
      if (Array.isArray(parent.obj)) {
        // Direct list item - add to current array
        parent.obj.push(parseValue(item));
      } else {
        // List item under a nested object - find the array key
        // Look for keys that are 'zh' or 'en' with arrays
        for (const k of Object.keys(parent.obj)) {
          if (Array.isArray(parent.obj[k])) {
            parent.obj[k].push(parseValue(item));
            break;
          }
        }
      }
      continue;
    }
  }
  
  return result;
}

function parseValue(value) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    // Inline array: [item1, item2, ...]
    const inner = value.slice(1, -1).trim();
    if (inner === '') return [];
    const items = inner.split(',').map(item => item.trim());
    return items.map(item => {
      if (item.startsWith('"') && item.endsWith('"')) {
        return item.slice(1, -1);
      }
      if (item.startsWith("'") && item.endsWith("'")) {
        return item.slice(1, -1);
      }
      if (item === 'true') return true;
      if (item === 'false') return false;
      if (/^\d+$/.test(item)) return parseInt(item, 10);
      if (/^\d+\.\d+$/.test(item)) return parseFloat(item);
      return item;
    });
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  return value;
}

async function main() {
  console.log('Building game catalog...');
  
  const gamesDir = await readdir(GAMES_DIR);
  const games = [];
  
  for (const slug of gamesDir) {
    const gameDir = join(GAMES_DIR, slug);
    const gameYamlPath = join(gameDir, 'game.yml');
    
    try {
      await readFile(gameYamlPath, 'utf-8');
      console.log(`  Found: ${slug}`);
    } catch {
      continue;
    }
    
    const yamlContent = await readFile(gameYamlPath, 'utf-8');
    const game = parseYAML(yamlContent);
    
    let description = game.description || '';
    let descriptionZh = game.descriptionZh || '';
    if (typeof game.description === 'object' && game.description) {
      description = game.description.en || game.description.zh || '';
      descriptionZh = game.description.zh || game.description.en || '';
    }
    
    let controls = game.controls || [];
    if (typeof game.controls === 'object' && game.controls) {
      // Handle nested controls { zh: [...], en: [...] }
      controls = game.controls.zh || game.controls.en || [];
    }
    
    const thumbnailPath = game.thumbnail ? 
      `play/${slug}/${game.thumbnail.replace(/^assets\//, 'assets/')}` : 
      `play/${slug}/assets/thumbnail.svg`;
    const iconPath = game.icon ? 
      `play/${slug}/${game.icon.replace(/^assets\//, 'assets/')}` : 
      `play/${slug}/assets/icon.svg`;
    
    games.push({
      slug: game.slug || slug,
      title: game.title || slug,
      titleZh: game.titleZh || slug,
      description,
      descriptionZh,
      tags: game.tags || [],
      controls,
      category: game.category || 'all',
      categoryZh: game.categoryZh || game.category || 'all',
      playPath: game.playPath || `play/${slug}/index.html`,
      thumbnail: thumbnailPath,
      icon: iconPath,
      libs: game.libs || {},
      rating: game.rating ?? 3.5,
      views: game.views ?? 1000,
      publishedAt: game.publishedAt || new Date().toISOString(),
    });
  }
  
  games.sort((a, b) => a.title.localeCompare(b.title));
  
  const outputPath = join(ROOT_DIR, 'site', 'public', 'catalog.json');
  await import('node:fs/promises').then(fs => 
    fs.writeFile(outputPath, JSON.stringify(games, null, 2))
  );
  
  console.log(`✓ Catalog written to: ${outputPath}`);
  console.log(`  Total games: ${games.length}`);
}

main().catch(err => {
  console.error('Error building catalog:', err);
  process.exit(1);
});