import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("site", "dist", { recursive: true });
await cp("manifest.xml", "dist/manifest.xml");
await cp("manifest-pilot.xml", "dist/manifest-pilot.xml");

console.log("Built static GitHub Pages site in dist/.");
