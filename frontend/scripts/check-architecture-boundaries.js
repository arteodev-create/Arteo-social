const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const LAYER_RULES = [
  {
    layer: 'shared',
    prefix: 'shared/',
    forbidden: ['@app', '@widgets', '@features', '@entities', '@stores', '@constants', '@registry'],
    message: 'shared must stay product-agnostic and only depend on shared or infrastructure exceptions.',
  },
  {
    layer: 'entities',
    prefix: 'entities/',
    forbidden: ['@app', '@widgets'],
    message: 'entities must not depend on app or widget composition layers.',
  },
  {
    layer: 'features',
    prefix: 'features/',
    forbidden: ['@app', '@widgets'],
    message: 'features must not depend on app pages or widget composition.',
  },
  {
    layer: 'widgets',
    prefix: 'widgets/',
    forbidden: ['@app'],
    message: 'widgets must not depend on app pages or route shells.',
  },
  {
    layer: 'app',
    prefix: 'app/',
    forbidden: [],
    message: 'app is the top composition layer.',
  },
];

const LEGACY_ALIASES = ['@components', '@hooks', '@utils', '@pages', '@types', '@stores'];

const ALLOWED_EXCEPTIONS = [];

function readFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readFiles(fullPath));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalize(filePath) {
  return path.relative(SRC_DIR, filePath).replace(/\\/g, '/');
}

function getImports(source) {
  const imports = [];
  const staticImportPattern = /import(?:[\s\S]*?)from\s+['"]([^'"]+)['"]/g;
  const sideEffectImportPattern = /import\s+['"]([^'"]+)['"]/g;
  const dynamicImportPattern = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const pattern of [staticImportPattern, sideEffectImportPattern, dynamicImportPattern]) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      imports.push(match[1]);
    }
  }

  return imports;
}

function startsWithAlias(importPath, alias) {
  return importPath === alias || importPath.startsWith(`${alias}/`);
}

function isException(file, importPath) {
  return ALLOWED_EXCEPTIONS.some((exception) => (
    exception.file === file &&
    exception.imports.some((allowedImport) => importPath === allowedImport || importPath.startsWith(`${allowedImport}/`))
  ));
}

function findLayer(file) {
  return LAYER_RULES.find((rule) => file.startsWith(rule.prefix));
}

function checkFile(filePath) {
  const file = normalize(filePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const imports = getImports(source);
  const layer = findLayer(file);
  const violations = [];

  for (const importPath of imports) {
    for (const legacyAlias of LEGACY_ALIASES) {
      if (startsWithAlias(importPath, legacyAlias)) {
        violations.push({
          file,
          importPath,
          reason: `legacy alias ${legacyAlias} is retired; use app/features/entities/widgets/shared facades.`,
        });
      }
    }

    if (!layer || isException(file, importPath)) continue;

    for (const forbiddenAlias of layer.forbidden) {
      if (startsWithAlias(importPath, forbiddenAlias)) {
        violations.push({
          file,
          importPath,
          reason: layer.message,
        });
      }
    }
  }

  return violations;
}

const violations = readFiles(SRC_DIR).flatMap(checkFile);

if (violations.length > 0) {
  console.error(`Architecture boundary violations: ${violations.length}`);
  for (const violation of violations) {
    console.error(`- ${violation.file} imports ${violation.importPath}: ${violation.reason}`);
  }
  process.exit(1);
}

console.log('Architecture boundary check passed.');
