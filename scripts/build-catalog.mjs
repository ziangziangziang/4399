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
  let currentKey = null;
  let inList = false;
  let listKey = null;
  let indentStack = [];
  
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const indent = line.match(/^\s*/)?.[0]?.length || 0;
    
    const match = trimmed.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      
      // If we're inside a nested object, add to it instead of creating a new top-level key
      if (currentKey && result[currentKey] && typeof result[currentKey] === 'object' && !Array.isArray(result[currentKey])) {
        result[currentKey][key] = value === '' || value === '[]' ? {} : parseValue(value);
        continue;
      }
      
      currentKey = key;
      inList = false;
      
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
          result[key] = isList ? [] : {};
          currentKey = key;
          listKey = isList ? key : null;
          inList = isList;
        } else {
          result[key] = [];
          listKey = key;
          inList = true;
        }
      } else {
        result[key] = parseValue(value);
        listKey = null;
      }
      continue;
    }
    
    if (inList && trimmed.startsWith('- ')) {
      const item = trimmed.slice(2).trim();
      if (Array.isArray(result[listKey])) {
        result[listKey].push(parseValue(item));
      }
      continue;
    }
    
    const nestedMatch = trimmed.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (nestedMatch && currentKey) {
      const [, nestedKey, value] = nestedMatch;
      if (!result[currentKey]) result[currentKey] = {};
      if (typeof result[currentKey] === 'object' && !Array.isArray(result[currentKey])) {
        result[currentKey][nestedKey] = parseValue(value);
      }
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
    
    games.push({
      slug: game.slug || slug,
      title: game.title || slug,
      description: game.description || '',
      tags: game.tags || [],
      controls: game.controls || [],
      playPath: game.playPath || 'build/index.html',
      thumbnail: game.thumbnail || `assets/thumbnail.svg`,
      icon: game.icon || `assets/icon.svg`,
      libs: game.libs || {},
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