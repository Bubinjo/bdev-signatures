import { cp, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("site", "dist", { recursive: true });

const buildRuntime = (outfile) =>
  build({
    entryPoints: ["src/runtime.js"],
    outfile,
    bundle: true,
    platform: "browser",
    format: "iife",
    target: ["es2017"],
    minify: true,
    legalComments: "none"
  });

// Keep legacy filenames alive while v0.8.1 moves Outlook to a fresh runtime URL.
await Promise.all([
  buildRuntime("dist/runtime.js"),
  buildRuntime("dist/runtime-v3.js"),
  buildRuntime("dist/runtime-v4.js"),
  buildRuntime("dist/runtime-v5.js"),
  buildRuntime("dist/runtime-v6.js"),
  buildRuntime("dist/runtime-v7.js"),
  buildRuntime("dist/runtime-v8.js"),
  buildRuntime("dist/runtime-v81.js")
]);

await cp("manifest.xml", "dist/manifest.xml");
await cp("manifest-pilot.xml", "dist/manifest-pilot.xml");

console.log("Built B.DEV Outlook image compatibility candidate v0.8.1 in dist/.");
