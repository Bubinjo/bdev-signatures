import { cp, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("site", "dist", { recursive: true });

await build({
  entryPoints: ["src/runtime.js"],
  outfile: "dist/runtime.js",
  bundle: true,
  platform: "browser",
  format: "iife",
  target: ["es2017"],
  minify: true,
  legalComments: "none"
});

await cp("manifest.xml", "dist/manifest.xml");
await cp("manifest-pilot.xml", "dist/manifest-pilot.xml");

console.log("Built NAA-enabled GitHub Pages site in dist/.");
