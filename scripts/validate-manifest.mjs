import { readFile } from "node:fs/promises";

const manifest = await readFile("manifest.xml", "utf8");
const requiredFragments = [
  "<Version>0.4.0.0</Version>",
  '<Set Name="Mailbox"',
  'DefaultMinVersion="1.10"',
  'Type="OnNewMessageCompose"',
  'FunctionName="applyBdevSignature"',
  'resid="AutorunPage"',
  'resid="RuntimeJs"',
  '<Permissions>ReadWriteMailbox</Permissions>',
  'index-v4.html',
  'runtime-v4.html',
  'runtime-v4.js'
];

const missing = requiredFragments.filter((fragment) => !manifest.includes(fragment));

if (missing.length > 0) {
  console.error("Manifest is missing required fragments:", missing);
  process.exit(1);
}

console.log("Manifest contains the required v0.4 cache-busted configuration.");
