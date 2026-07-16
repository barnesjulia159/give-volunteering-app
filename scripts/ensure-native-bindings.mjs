import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);

function resolveVersion(pkgName, fallbackVersion) {
  try {
    const packageJsonPath = require.resolve(`${pkgName}/package.json`, {
      paths: [process.cwd()],
    });
    const packageJson = require(packageJsonPath);
    return packageJson.version || fallbackVersion;
  } catch {
    return fallbackVersion;
  }
}

function hasPackage(pkgName) {
  try {
    require.resolve(`${pkgName}/package.json`, { paths: [process.cwd()] });
    return true;
  } catch {
    return false;
  }
}

const lightningcssVersion = resolveVersion("lightningcss", "1.32.0");
const oxideVersion = resolveVersion("@tailwindcss/oxide", "4.3.2");

function getNativePackagesForRuntime() {
  if (process.platform === "win32" && process.arch === "x64") {
    return [
      `lightningcss-win32-x64-msvc@${lightningcssVersion}`,
      `@tailwindcss/oxide-win32-x64-msvc@${oxideVersion}`,
    ];
  }

  if (process.platform === "linux" && process.arch === "x64") {
    return [
      `lightningcss-linux-x64-gnu@${lightningcssVersion}`,
      `@tailwindcss/oxide-linux-x64-gnu@${oxideVersion}`,
    ];
  }

  return [];
}

function getFallbackCopiesForRuntime() {
  if (process.platform === "win32" && process.arch === "x64") {
    return [
      {
        source: "node_modules/lightningcss-win32-x64-msvc/lightningcss.win32-x64-msvc.node",
        destination: "node_modules/lightningcss/lightningcss.win32-x64-msvc.node",
      },
      {
        source: "node_modules/@tailwindcss/oxide-win32-x64-msvc/tailwindcss-oxide.win32-x64-msvc.node",
        destination: "node_modules/@tailwindcss/oxide/tailwindcss-oxide.win32-x64-msvc.node",
      },
    ];
  }

  if (process.platform === "linux" && process.arch === "x64") {
    return [
      {
        source: "node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node",
        destination: "node_modules/lightningcss/lightningcss.linux-x64-gnu.node",
      },
      {
        source: "node_modules/@tailwindcss/oxide-linux-x64-gnu/tailwindcss-oxide.linux-x64-gnu.node",
        destination: "node_modules/@tailwindcss/oxide/tailwindcss-oxide.linux-x64-gnu.node",
      },
    ];
  }

  return [];
}

const nativePackages = getNativePackagesForRuntime();
const fallbackCopies = getFallbackCopiesForRuntime();

if (nativePackages.length === 0) {
  console.log(
    `No native sync targets configured for ${process.platform}-${process.arch}.`
  );
  process.exit(0);
}

const missing = nativePackages.filter((entry) => {
  const atIndex = entry.lastIndexOf("@");
  const pkgName = entry.slice(0, atIndex);
  return !hasPackage(pkgName);
});

if (missing.length === 0) {
  console.log("Native bindings already installed.");
} else {
  console.log(`Installing missing native bindings: ${missing.join(", ")}`);

  const installArgs = ["install", "--no-save", "--no-package-lock", ...missing];

  if (process.env.npm_execpath) {
    execFileSync(process.execPath, [process.env.npm_execpath, ...installArgs], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
  } else {
    execFileSync("npm", installArgs, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: process.platform === "win32",
    });
  }

  console.log("Native binding package install complete.");
}

for (const pair of fallbackCopies) {
  const sourcePath = join(process.cwd(), pair.source);
  const destinationPath = join(process.cwd(), pair.destination);

  if (!existsSync(sourcePath)) {
    console.warn(`Skipping fallback copy, source missing: ${pair.source}`);
    continue;
  }

  if (!existsSync(destinationPath)) {
    copyFileSync(sourcePath, destinationPath);
    console.log(`Copied fallback binary: ${pair.destination}`);
  }
}

console.log("Native binding sync complete.");
