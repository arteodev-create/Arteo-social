const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BUILD_STATIC_JS = path.join(process.cwd(), 'build', 'static', 'js');
const MAIN_BUDGET_KB = Number(process.env.MAIN_JS_GZIP_BUDGET_KB || 340);

if (!fs.existsSync(BUILD_STATIC_JS)) {
  console.error('Bundle budget check failed: build/static/js does not exist. Run npm run build first.');
  process.exit(1);
}

const mainBundles = fs
  .readdirSync(BUILD_STATIC_JS)
  .filter((file) => /^main\..+\.js$/.test(file));

if (mainBundles.length !== 1) {
  console.error(`Bundle budget check failed: expected 1 main bundle, found ${mainBundles.length}.`);
  process.exit(1);
}

const mainBundle = path.join(BUILD_STATIC_JS, mainBundles[0]);
const gzipSizeKb = zlib.gzipSync(fs.readFileSync(mainBundle)).length / 1024;

if (gzipSizeKb > MAIN_BUDGET_KB) {
  console.error(
    `Bundle budget exceeded: main JS is ${gzipSizeKb.toFixed(2)} kB gzip, budget is ${MAIN_BUDGET_KB} kB.`
  );
  process.exit(1);
}

console.log(`Bundle budget check passed: main JS is ${gzipSizeKb.toFixed(2)} kB gzip (budget ${MAIN_BUDGET_KB} kB).`);
