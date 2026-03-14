
import fs from 'fs';

const content = fs.readFileSync('i:/Development/My AI/work-intelligence-tracker/src/App.tsx', 'utf8');

const divOpen = (content.match(/<div(\b|>)/g) || []).length;
const divClose = (content.match(/<\/div>/g) || []).length;

const fragOpen = (content.match(/<>/g) || []).length;
const fragClose = (content.match(/<\/>/g) || []).length;

const braceOpen = (content.match(/{/g) || []).length;
const braceClose = (content.match(/}/g) || []).length;

const parenOpen = (content.match(/\(/g) || []).length;
const parenClose = (content.match(/\)/g) || []).length;

const regex = /<div(\b|>)|<\/div>|<>|<Fragment>|<\/Fragment>|<\/>/g;
let match;
let stack = [];
while ((match = regex.exec(content)) !== null) {
  const t = match[0];
  const pos = match.index;
  const line = content.substring(0, pos).split('\n').length;
  if (t === '<\/div>') {
    const popped = stack.pop();
    if (!popped || popped.type !== 'div') 
        console.log(`MISMATCH at line ${line}: Close DIV but stack had ${popped ? popped.type : 'nothing'} (opened at ${popped ? popped.line : 'N/A'})`);
  } else if (t === '<\/Fragment>' || t === '<\/ \/>' || t === '<\/>') {
    const popped = stack.pop();
    if (!popped || popped.type !== 'frag') 
        console.log(`MISMATCH at line ${line}: Close FRAG but stack had ${popped ? popped.type : 'nothing'} (opened at ${popped ? popped.line : 'N/A'})`);
  } else if (t.startsWith('<div')) {
    stack.push({type: 'div', line: line});
  } else {
    stack.push({type: 'frag', line: line});
  }
}
console.log('Final Stack Size:', stack.length);
console.log('Final Stack:', stack.map(s => `${s.type}@${s.line}`));

const tabs = ['dashboard', 'analytics', 'team', 'reports', 'tasks', 'support', 'leads', 'workflow'];
tabs.forEach(tab => {
  const startPattern = new RegExp(`activeTab === '${tab}' && \\(`, 'g');
  const startMatches = (content.match(startPattern) || []).length;
  console.log(`Tab ${tab}: Starts=${startMatches}`);
});

// Check dashboard more closely
const dashArea = content.match(/activeTab === 'dashboard' && \([\s\S]+?activeTab === 'analytics'/);
if (dashArea) {
    const dashContent = dashArea[0];
    const dOpen = (dashContent.match(/<div(\b|>)/g) || []).length;
    const dClose = (dashContent.match(/<\/div>/g) || []).length;
    const pOpen = (dashContent.match(/\(/g) || []).length;
    const pClose = (dashContent.match(/\)/g) || []).length;
    console.log(`DASHBOARD AREA DIV: Open=${dOpen}, Close=${dClose}, Diff=${dOpen - dClose}`);
    console.log(`DASHBOARD AREA PAREN: Open=${pOpen}, Close=${pClose}, Diff=${pOpen - pClose}`);
}
