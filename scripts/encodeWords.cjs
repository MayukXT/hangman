const fs = require('fs');
const KEY = 0x1F;

function xorHex(str) {
  return Array.from(str).map(c => (c.charCodeAt(0) ^ KEY).toString(16).padStart(2, '0')).join('');
}

let src = fs.readFileSync('src/data/words.ts', 'utf-8');

if (src.includes('const dec =')) {
  console.log('Already encoded, skipping.');
  process.exit(0);
}

// Only encode the word: field (the answer), keep hints and clues human-readable
let encoded = src.replace(
  /(\{\s*word\s*:\s*)"([^"]+)"/g,
  (match, prefix, word) => prefix + 'dec("' + xorHex(word) + '")'
);

const decFn = `
// XOR key 0x1F (31) — to encode a new word:
//   Array.from("MY WORD").map(c => (c.charCodeAt(0) ^ 0x1F).toString(16).padStart(2,'0')).join('')
// Run: node scripts/encodeWords.cjs to re-encode after adding raw words.
const dec = (h: string): string => h.match(/.{2}/g)!.map(b => String.fromCharCode(parseInt(b, 16) ^ 0x1F)).join('');

`;

encoded = encoded.replace('export const THEME_DICT', decFn + 'export const THEME_DICT');

fs.writeFileSync('src/data/words.ts', encoded, 'utf-8');
console.log('Done — word answers encoded with XOR 0x1F');
