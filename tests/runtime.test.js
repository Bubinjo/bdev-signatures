const test = require("node:test");
const assert = require("node:assert/strict");
const signature = require("../src/signature.js");

test("builds a full signature for new mail", () => {
  const profile = signature.normalizeGraphProfile({
    displayName: "Danijel Buba",
    jobTitle: "System Engineer",
    department: "IT",
    companyName: "B.DEV d.o.o.",
    businessPhones: ["+386 1 000 00 00"],
    mobilePhone: "+386 40 000 000",
    mail: "danijel@bubinjo.dev"
  });
  const html = signature.buildSignatureHtml("newMail", profile);

  assert.match(html, /Danijel Buba/);
  assert.match(html, /System Engineer/);
  assert.match(html, /mailto:danijel@bubinjo\.dev/);
  assert.match(html, /\+386 40 000 000/);
});

test("builds a compact signature for replies", () => {
  const html = signature.buildSignatureHtml("reply", {
    displayName: "Danijel Buba",
    jobTitle: "System Engineer",
    department: "IT",
    company: "B.DEV d.o.o.",
    businessPhone: "+386 1 000 00 00",
    mobilePhone: "+386 40 000 000",
    email: "danijel@bubinjo.dev",
    website: "https://bubinjo.dev"
  });

  assert.match(html, /Danijel Buba/);
  assert.doesNotMatch(html, /mailto:/);
  assert.doesNotMatch(html, /\+386 40 000 000/);
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

test("omits optional empty attributes", () => {
  const html = signature.buildSignatureHtml("newMail", {
    displayName: "Test User",
    jobTitle: "Engineer",
    company: "B.DEV d.o.o."
  });

  assert.match(html, /Test User/);
  assert.doesNotMatch(html, />M</);
  assert.doesNotMatch(html, />E</);
});

test("escapes directory-sourced values", () => {
  const html = signature.buildSignatureHtml("newMail", {
    displayName: '<img src=x onerror="alert(1)">',
    jobTitle: "Engineer",
    company: "B.DEV d.o.o."
  });

  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
});
