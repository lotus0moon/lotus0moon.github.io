const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// -------- LESS 批量编译 --------
const lessDir = path.join(__dirname, 'less');
const cssDir = path.join(__dirname, 'css');
const minCssDir = path.join(__dirname, 'min.css');

const lessFiles = fs.readdirSync(lessDir)
  .filter(f => f.endsWith('.less') && !f.startsWith('_'));

for(const f of lessFiles) {
  const src = path.join(lessDir, f);
  const base = path.basename(f, '.less');
  const outNormal = path.join(cssDir, `${base}.css`);
  const outMin = path.join(minCssDir, `${base}.min.css`);

  console.log(`[LESS] ${f} → ${base}.css / ${base}.min.css`);
  // 输出普通未压缩css
  execSync(`npx lessc --include-path=css "${src}" "${outNormal}"`, {stdio:'inherit'});
  // 使用独立clean‑css插件输出压缩css
  execSync(`npx lessc --include-path=css --plugin=less-plugin-clean-css "${src}" "${outMin}"`, {stdio:'inherit'});
}

// -------- JS 批量压缩 --------
const jsDir = path.join(__dirname, 'js');
const minJsDir = path.join(__dirname, 'min.js');
const jsFiles = fs.readdirSync(jsDir);

for(const f of jsFiles) {
  const src = path.join(jsDir, f);
  const base = path.basename(f, '.js');
  const outMin = path.join(minJsDir, `${base}.min.js`);

  console.log(`[JS] ${f} → ${base}.min.js`);
  execSync(`npx uglify-js "${src}" -o "${outMin}"`, {stdio:'inherit'});
}

console.log("\n✅ build finished");