import { readFile } from "node:fs/promises";

const manifest = await readFile("manifest.xml", "utf8");
const requiredFragments = [
  "<Version>0.6.0.0</Version>",
  '<Set Name="Mailbox"',
  'DefaultMinVersion="1.10"',
  'Type="OnNewMessageCompose"',
  'FunctionName="applyBdevSignature"',
  'resid="AutorunPage"',
  'resid="RuntimeJs"',
  '<Permissions>ReadWriteMailbox</Permissions>',
  'index-v6.html',
  'runtime-v6.html',
  'runtime-v6.js'
];

const missing = requiredFragments.filter((fragment) => !manifest.includes(fragment));

if (missing.length > 0) {
  console.error("Manifest is missing required fragments:", missing);
  process.exit(1);
}

console.log("Manifest contains the required v0.6 cache-busted configuration.");
