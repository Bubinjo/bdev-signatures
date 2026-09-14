const test = require("node:test");
const assert = require("node:assert/strict");
const signature = require("../src/signature.js");

function graphProfile() {
  return signature.normalizeGraphProfile({
    displayName: "B.DEV | Danijel",
    givenName: "Danijel",
    surname: "Buba",
    jobTitle: "System Engineer",
    department: "System Engineering",
    companyName: "B.DEV d.o.o.",
    businessPhones: [],
    mobilePhone: "+38664154854",
    mail: "danijel@bubinjo.dev"
  });
}

test("prefers the personal name over an administrative display name", () => {
  assert.equal(graphProfile().displayName, "Danijel Buba");
});

test("builds a neon-tech CGP signature for new mail", () => {
  const html = signature.buildSignatureHtml("newMail", graphProfile());

  assert.match(html, /Danijel Buba/);
  assert.match(html, /IT INFRASTRUCTURE SOLUTIONS/);
  assert.match(html, /bubinjo<span/);
  assert.match(html, /&gt;_/);
  assert.match(html, /#091a23/);
  assert.match(html, /mailto:danijel@bubinjo\.dev/);
  assert.match(html, /tel:\+38664154854/);
  assert.match(html, /data-bdev-signature="full-v3"/);
  assert.doesNotMatch(html, /#e5f9e0/);
  assert.doesNotMatch(html, /icon-128\.png/);
});

test("builds a compact light signature for replies", () => {
  const html = signature.buildSignatureHtml("reply", graphProfile());

  assert.match(html, /Danijel Buba/);
  assert.match(html, /bubinjo\.dev/);
  assert.match(html, /data-bdev-signature="compact-v3"/);
  assert.doesNotMatch(html, /mailto:/);
  assert.doesNotMatch(html, /IT INFRASTRUCTURE SOLUTIONS/);
  assert.doesNotMatch(html, /\+38664154854/);
});

test("maps Graph fields and uses UPN when mail is empty", () => {
  const profile = signature.normalizeGraphProfile({
    displayName: "Test User",
    jobTitle: "Engineer",
    department: "Operations",
    companyName: "",
    businessPhones: [],
    mobilePhone: null,
    mail: null,
    userPrincipalName: "test@bubinjo.dev"
  });

  assert.equal(profile.email, "test@bubinjo.dev");
  assert.equal(profile.company, "B.DEV d.o.o.");
  assert.equal(profile.businessPhone, "");
});

test("escapes directory-sourced values", () => {
  const html = signature.buildSignatureHtml("newMail", {
    displayName: '<img src=x onerror="alert(1)">',
    jobTitle: "Engineer",
    company: "B.DEV d.o.o.",
    website: "https://bubinjo.dev"
  });

  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
});
