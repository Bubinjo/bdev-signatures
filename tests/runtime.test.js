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

test("builds the production Company Branding banner signature for new mail", () => {
  const html = signature.buildSignatureHtml("newMail", graphProfile());

  assert.match(html, /Danijel Buba/);
  assert.match(html, /System Engineer/);
  assert.match(html, /B\.DEV d\.o\.o\./);
  assert.match(html, /bdev-signature-identity-v1\.png\?v=0\.5\.0/);
  assert.match(html, /bdev-signature-info-bg-v1\.jpg\?v=0\.5\.0/);
  assert.match(html, /bdev-signature-artwork-v1\.png\?v=0\.5\.0/);
  assert.match(html, /width="640"/);
  assert.match(html, /width="132" height="178"/);
  assert.match(html, /width="263" height="178"/);
  assert.match(html, /width="245" height="178"/);
  assert.match(html, /#03163D/);
  assert.match(html, /#13C8FF/);
  assert.match(html, /mailto:danijel@bubinjo\.dev/);
  assert.match(html, /tel:\+38664154854/);
  assert.match(html, />bubinjo\.dev</);
  assert.match(html, /data-bdev-signature="full-banner-v2"/);
  assert.doesNotMatch(html, /IDEJE V REŠITVE/i);
  assert.doesNotMatch(html, /BUILD.*DEVELOP.*DELIVER/i);
  assert.doesNotMatch(html, /display\s*:\s*(grid|flex)/i);
  assert.doesNotMatch(html, /position\s*:\s*absolute/i);
  assert.doesNotMatch(html, /<(script|svg)\b/i);
  assert.doesNotMatch(html, />B\.DEV<\/span>/);
  assert.match(html, /background="https:\/\/bubinjo\.github\.io\/bdev-signatures\/assets\/bdev-signature-info-bg-v1\.jpg\?v=0\.5\.0"/);
  assert.equal((html.match(/bdev-signature-identity-v1/g) || []).length, 1);
  assert.equal((html.match(/bdev-signature-artwork-v1/g) || []).length, 1);
});

test("builds a compact branded signature for replies", () => {
  const html = signature.buildSignatureHtml("reply", graphProfile());

  assert.match(html, /Danijel Buba/);
  assert.match(html, /System Engineer/);
  assert.match(html, /B\.DEV d\.o\.o\./);
  assert.match(html, /mailto:danijel@bubinjo\.dev/);
  assert.match(html, /tel:\+38664154854/);
  assert.match(html, /#03163D/);
  assert.match(html, /data-bdev-signature="compact-v1"/);
  assert.doesNotMatch(html, /bdev-company-brand-panel/);
  assert.doesNotMatch(html, /bdev-company-brand-banner/);
  assert.doesNotMatch(html, /bdev-signature-artwork/);
  assert.doesNotMatch(html, /width="640"/);
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

test("omits missing optional contact rows without breaking the website", () => {
  const html = signature.buildSignatureHtml("newMail", {
    displayName: "Test User",
    jobTitle: "",
    company: "B.DEV d.o.o.",
    businessPhone: "",
    mobilePhone: "",
    email: "",
    website: "https://bubinjo.dev"
  });

  assert.doesNotMatch(html, /mailto:/);
  assert.doesNotMatch(html, /tel:/);
  assert.match(html, /href="https:\/\/bubinjo\.dev"/);
  assert.match(html, />bubinjo\.dev</);
});
