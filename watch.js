const chokidar = require('chokidar');
const { execFileSync } = require('child_process');
const path = require('path');

const watcher = chokidar.watch(['less/**/*.less', 'js/**/*.js'], {
  ignoreInitial: true,
  cwd: __dirname,
});

let timer = null;
const pending = new Set();

function flush() {
  timer = null;
  const files = [...pending];
  pending.clear();
  if (files.length === 0) return;

  console.log('[watch] changed:', files);
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'build.js'), ...files], {
      stdio: 'inherit',
      cwd: __dirname,
    });
  } catch (e) {
    console.error('[watch] build failed');
  }
}

watcher.on('all', (event, file) => {
  if (event !== 'add' && event !== 'change') return;
  pending.add(file);
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 300);   // 300ms 防抖
});

console.log('[watch] watching less/**/*.less and js/**/*.js ...');