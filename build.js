const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// -------- 路径配置 --------
const lessDir = path.join(__dirname, 'less');
const cssDir = path.join(__dirname, 'css');
const minCssDir = path.join(__dirname, 'min.css');
const jsDir = path.join(__dirname, 'js');
const minJsDir = path.join(__dirname, 'min.js');

// -------- 单个 LESS 编译 --------
function compileLess(src) {
  const fileName = path.basename(src);

  // partial（_ 开头）不单独输出，但它被 @import 依赖，简单起见触发全量 LESS 重编译
  if (fileName.startsWith('_')) {
    console.log(`[LESS] partial ${fileName} changed, rebuild all less`);
    buildAllLess();
    return;
  }
  // console.log(`[LESS] partial ${fileName} changed, rebuild`);
  const base = path.basename(src, '.less');
  const outNormal = path.join(cssDir, `${base}.css`);
  const outMin = path.join(minCssDir, `${base}.min.css`);

  console.log(`[LESS] ${fileName} → ${base}.css / ${base}.min.css`);
  execSync(`npx lessc --include-path=css "${src}" "${outNormal}"`, { stdio: 'inherit' });
  execSync(`npx lessc --include-path=css --plugin=less-plugin-clean-css "${src}" "${outMin}"`, { stdio: 'inherit' });
}

// -------- 单个 JS 压缩 --------
function compileJs(src) {
  const fileName = path.basename(src);
  const base = path.basename(src, '.js');
  const outMin = path.join(minJsDir, `${base}.min.js`);

  console.log(`[JS] ${fileName} → ${base}.min.js`);
  execSync(`npx uglify-js "${src}" -o "${outMin}"`, { stdio: 'inherit' });
}

// -------- 全量编译 --------
function buildAllLess() {
  const lessFiles = fs.readdirSync(lessDir)
    .filter(f => f.endsWith('.less') && !f.startsWith('_'));
  for (const f of lessFiles) compileLess(path.join(lessDir, f));
}

function buildAllJs() {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  for (const f of jsFiles) compileJs(path.join(jsDir, f));
}

// -------- 入口：有参数则增量，无参数则全量 --------
// console.log('[raw argv]', JSON.stringify(process.argv));

const changedFiles = process.argv.slice(2);

if (changedFiles.length === 0) {
  buildAllLess();
  buildAllJs();
} else {
  for (const file of changedFiles) {
    const abs = path.resolve(file);
    if (!fs.existsSync(abs)) continue; // 删除事件直接跳过
    const ext = path.extname(abs);
    if (ext === '.less') compileLess(abs);
    else if (ext === '.js') compileJs(abs);
  }
}

console.log('\n✅ build finished');