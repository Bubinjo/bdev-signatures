import { readFile } from "node:fs/promises";

const manifest = await readFile("manifest.xml", "utf8");
const requiredFragments = [
  "<Version>0.8.0.0</Version>",
  '<Set Name="Mailbox"',
  'DefaultMinVersion="1.10"',
  'Type="OnNewMessageCompose"',
  'FunctionName="applyBdevSignature"',
  'resid="AutorunPage"',
  'resid="RuntimeJs"',
  '<Permissions>ReadWriteMailbox</Permissions>',
  'index-v8.html',
  'runtime-v8.html',
  'runtime-v8.js'
];

const missing = requiredFragments.filter((fragment) => !manifest.includes(fragment));

if (missing.length > 0) {
  console.error("Manifest is missing required fragments:", missing);
  process.exit(1);
}

console.log("Manifest contains the required v0.8 cache-busted configuration.");
