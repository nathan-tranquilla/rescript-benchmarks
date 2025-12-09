// generate.js — FINAL, TESTED & WORKING (December 2025)
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const NUM_MODULES = args[0] ? parseInt(args[0]) : 1000;
const NUM_PACKAGES = args[1] ? parseInt(args[1]) : 10;

console.log(`Generating ${NUM_MODULES} modules across ${NUM_PACKAGES} packages...`);

const ROOT = path.resolve(__dirname);
const TS_ROOT = path.join(ROOT, 'ts-project');
const RES_ROOT = path.join(ROOT, 'rescript-project');

// Clean only src directories, preserve config files
[TS_ROOT, RES_ROOT].forEach(p => {
  const srcPath = path.join(p, 'src');
  if (fs.existsSync(srcPath)) {
    fs.rmSync(srcPath, { recursive: true, force: true });
  }
  // Ensure project and src directories exist
  fs.mkdirSync(p, { recursive: true });
  fs.mkdirSync(srcPath, { recursive: true });
});

// ──────────────────────────────────────────────────────────────────────
// TypeScript – now 100% correct composite + path mapping
function generateTypeScript() {
  // 1. Shared base config with path mapping
  fs.writeFileSync(path.join(TS_ROOT, 'tsconfig.settings.json'), JSON.stringify({
    compilerOptions: {
      baseUrl: "./src",
      paths: {
        "@bench/*": ["*"]
      },
      target: "esnext",
      module: "commonjs",
      strict: true,
      skipLibCheck: true,
      declaration: true,
      declarationMap: true,
      composite: true,
      sourceMap: true
    }
  }, null, 2));

  const references = [];

  for (let i = 0; i < NUM_PACKAGES; i++) {
    const pkgName = `pkg${i}`;
    const pkgPath = path.join(TS_ROOT, 'src', pkgName);
    fs.mkdirSync(pkgPath, { recursive: true });

    // Every package except pkg0 references pkg0 (because Base lives there)
    const pkgReferences = i === 0 ? [] : [{ path: "../pkg0" }];

    fs.writeFileSync(path.join(pkgPath, 'tsconfig.json'), JSON.stringify({
      extends: "../../tsconfig.settings.json",
      compilerOptions: {
        outDir: `../../dist/${pkgName}`,
        rootDir: ".",
        tsBuildInfoFile: `../../.tsbuildinfo/${pkgName}.tsbuildinfo`
      },
      include: ["**/*"],
      references: pkgReferences
    }, null, 2));

    references.push({ path: `./src/${pkgName}` });
  }

  // Root tsconfig – only orchestrates the build
  fs.writeFileSync(path.join(TS_ROOT, 'tsconfig.json'), JSON.stringify({
    files: [],
    references
  }, null, 2));

  // Output folders
  fs.mkdirSync(path.join(TS_ROOT, 'dist'), { recursive: true });
  fs.mkdirSync(path.join(TS_ROOT, '.tsbuildinfo'), { recursive: true });

  // Base module
  fs.writeFileSync(path.join(TS_ROOT, 'src/pkg0/Base.ts'),
    `export type Base = { value: number };\n` +
    `export const baseFn = (x: number): Base => ({ value: x });`
  );

  // Generate modules
  for (let i = 0; i < NUM_MODULES; i++) {
    const pkgIdx = i % NUM_PACKAGES;
    const filePath = path.join(TS_ROOT, 'src', `pkg${pkgIdx}`, `Module${i}.ts`);

    const shouldDepend = Math.random() < 0.12;
    const importLine = shouldDepend
      ? `import { Base, baseFn } from "@bench/pkg0/Base";\n` +
        `const _check: Base = baseFn(${i});\n`
      : '';

    const content =
      `${importLine}\n` +
      `export type T${i} = string;\n` +
      `export const fn${i} = (): T${i} => "module-${i}";`;

    fs.writeFileSync(filePath, content);
  }

  console.log(`TypeScript ready: ${NUM_MODULES} modules, path mapping + correct references`);
}

// ──────────────────────────────────────────────────────────────────────
// ReScript – now with same package structure as TypeScript
function generateReScript() {
  // Create package directories and Base.res in pkg0
  for (let i = 0; i < NUM_PACKAGES; i++) {
    const pkgName = `pkg${i}`;
    const pkgPath = path.join(RES_ROOT, 'src', pkgName);
    fs.mkdirSync(pkgPath, { recursive: true });
  }

  // Base module in pkg0
  fs.writeFileSync(path.join(RES_ROOT, 'src/pkg0/Base.res'),
    `type base = {value: int}\nlet baseFn = (x: int): base => {value: x}`
  );

  // Generate modules distributed across packages
  for (let i = 0; i < NUM_MODULES; i++) {
    const pkgIdx = i % NUM_PACKAGES;
    const pkgName = `pkg${pkgIdx}`;
    const filePath = path.join(RES_ROOT, 'src', pkgName, `Module${i}.res`);
    
    const openLine = Math.random() < 0.12
      ? `open Base\nlet _check: base = baseFn(${i})\n`
      : '';
    const content = `${openLine}\ntype t${i} = string\nlet fn${i} = () => "module-${i}"`;
    fs.writeFileSync(filePath, content);
  }

  // ReScript config with subdirs enabled
  fs.writeFileSync(path.join(RES_ROOT, 'bsconfig.json'), JSON.stringify({
    name: "rescript-bench",
    sources: { dir: "src", subdirs: true },
    "package-specs": { module: "commonjs", "in-source": true }
  }, null, 2));

  console.log(`ReScript ready: ${NUM_MODULES} modules across ${NUM_PACKAGES} packages`);
}

// RUN
generateTypeScript();
generateReScript();

console.log("\nCommands:");
console.log("   rake build_res");
console.log("   rake build_ts");