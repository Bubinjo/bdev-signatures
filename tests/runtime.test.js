const test = require("node:test");
const assert = require("node:assert/strict");
const signature = require("../site/runtime.js");

test("builds a full signature for new mail", () => {
  const html = signature.buildSignatureHtml("newMail", signature.POC_PROFILE);

  assert.match(html, /Danijel Buba/);
  assert.match(html, /System Engineer/);
  assert.match(html, /mailto:danijel@bubinjo\.dev/);
  assert.match(html, /\+386 40 000 000/);
});
test("builds a compact signature for replies", () => {
  const html = signature.buildSignatureHtml("reply", signature.POC_PROFILE);

  assert.match(html, /Danijel Buba/);
  assert.doesNotMatch(html, /mailto:/);
  assert.doesNotMatch(html, /\+386 40 000 000/);
});

test("omits optional empty attributes", () => {
  const html = signature.buildSignatureHtml("newMail", {
    displayName: "Test User",
    jobTitle: "Engineer",
    company: "B.DEV"
  });

  assert.match(html, /Test User/);
  assert.doesNotMatch(html, />M</);
  assert.doesNotMatch(html, />E</);
});

test("escapes directory-sourced values", () => {
  const html = signature.buildSignatureHtml("newMail", {
    displayName: '<img src=x onerror="alert(1)">',
    jobTitle: "Engineer",
    company: "B.DEV"
  });

  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
});
