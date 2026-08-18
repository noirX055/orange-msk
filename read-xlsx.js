const XLSX = require('xlsx');
const wb = XLSX.readFile(process.argv[2]);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

// Analyze full hierarchy depth
const depthMap = {};
const samplesByDepth = {};

data.forEach(row => {
  const parts = (row['Группы'] || '').split('/');
  const depth = parts.length;
  depthMap[depth] = (depthMap[depth] || 0) + 1;
  if (!samplesByDepth[depth]) samplesByDepth[depth] = [];
  if (samplesByDepth[depth].length < 3) samplesByDepth[depth].push(row['Группы']);
});

console.log('=== DEPTH DISTRIBUTION ===');
Object.entries(depthMap).sort((a,b) => a[0]-b[0]).forEach(([d, c]) => {
  console.log(`Depth ${d}: ${c} rows`);
  console.log(`  Examples: ${(samplesByDepth[d] || []).join(' | ')}`);
});

// Check which "brands" are actually categories
const level1 = new Set();
data.forEach(row => {
  const parts = (row['Группы'] || '').split('/');
  level1.add(parts[0]);
});

console.log('\n=== LEVEL 1 VALUES ===');
[...level1].sort().forEach(v => {
  const count = data.filter(r => (r['Группы'] || '').startsWith(v + '/')).length + data.filter(r => r['Группы'] === v).length;
  console.log(`${v}: ${count} items`);
});

// Check if there are prices anywhere
console.log('\n=== ALL COLUMN NAMES ===');
const allKeys = new Set();
data.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));
console.log([...allKeys]);
