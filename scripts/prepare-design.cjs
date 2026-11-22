const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const write = (name, content) => {
  const target = path.join(root, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) fs.writeFileSync(target, content);
};
function prepareDesign() {
  const names = ['tray', 'coffee', 'check-circle', 'tote', 'bell', 'map-pin', 'trash', 'seal-percent'];
  const icons = Object.fromEntries(names.map(name => {
    const svg = fs.readFileSync(path.join(root, 'node_modules/@phosphor-icons/core/assets/duotone', `${name}-duotone.svg`), 'utf8');
    return [name, svg.replace('<svg ', '<svg aria-hidden="true" focusable="false" ')];
  }));
  write('lib/icons.js', `export const ICONS = ${JSON.stringify(icons, null, 2)};\n`);
  write('vendor/anime.min.js', fs.readFileSync(path.join(root, 'node_modules/animejs/dist/bundles/anime.umd.min.js'), 'utf8'));
  for (const [folder, source] of [['animejs', 'animejs/LICENSE.md'], ['phosphor', '@phosphor-icons/core/LICENSE']]) {
    write(`vendor/${folder}-LICENSE.txt`, fs.readFileSync(path.join(root, 'node_modules', source), 'utf8'));
  }
}
module.exports = { prepareDesign };
if (require.main === module) prepareDesign();
