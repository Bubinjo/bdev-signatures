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
  assert.match(html, /bdev-signature-identity-v2\.png\?v=0\.6\.0/);
  assert.match(html, /bdev-signature-info-bg-v2\.jpg\?v=0\.6\.0/);
  assert.match(html, /bdev-signature-artwork-v2\.png\?v=0\.6\.0/);
  assert.match(html, /width="640"/);
  assert.match(html, /width="129" height="176"/);
  assert.match(html, /width="290" height="176"/);
  assert.match(html, /width="220" height="176"/);
  assert.match(html, /width="1" height="132"/);
  assert.match(html, /#03163D/);
  assert.match(html, /#2D6FD2/);
  assert.match(html, /#13C8FF/);
  assert.match(html, /#FFFFFF/);
  assert.match(html, /#AFC4DD/);
  assert.match(html, /#EAF4FF/);
  assert.match(html, /font:700 19px\/23px 'Segoe UI',Arial,sans-serif/);
  assert.match(html, /font:600 13px\/18px 'Segoe UI',Arial,sans-serif/);
  assert.match(html, /font:400 11px\/16px 'Segoe UI',Arial,sans-serif/);
  assert.match(html, /font:700 11px\/16px 'Segoe UI',Arial,sans-serif/);
  assert.match(html, /mailto:danijel@bubinjo\.dev/);
  assert.match(html, /tel:\+38664154854/);
  assert.match(html, />bubinjo\.dev</);
  assert.match(html, />M<\/td><td[^>]*>&#124;<\/td>/);
  assert.match(html, />E<\/td><td[^>]*>&#124;<\/td>/);
  assert.match(html, />W<\/td><td[^>]*>&#124;<\/td>/);
  assert.match(html, /data-bdev-signature="full-banner-v3"/);
  assert.doesNotMatch(html, /IDEJE V REŠITVE/i);
  assert.doesNotMatch(html, /BUILD.*DEVELOP.*DELIVER/i);
  assert.doesNotMatch(html, /text-shadow/i);
  assert.doesNotMatch(html, /display\s*:\s*(grid|flex)/i);
  assert.doesNotMatch(html, /position\s*:\s*absolute/i);
  assert.doesNotMatch(html, /<(script|svg)\b/i);
  assert.doesNotMatch(html, />B\.DEV<\/span>/);
  assert.match(html, /background="https:\/\/bubinjo\.github\.io\/bdev-signatures\/assets\/bdev-signature-info-bg-v2\.jpg\?v=0\.6\.0"/);
  assert.equal((html.match(/bdev-signature-identity-v2/g) || []).length, 1);
  assert.equal((html.match(/bdev-signature-artwork-v2/g) || []).length, 1);
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

test("uses one M contact row and prefers mobile over business phone", () => {
  const html = signature.buildSignatureHtml(
    "newMail",
    signature.normalizeGraphProfile({
      givenName: "Test",
      surname: "User",
      businessPhones: ["+386 1 111 11 11"],
      mobilePhone: "+386 40 222 222",
      mail: "test@bubinjo.dev"
    })
  );

  assert.match(html, /tel:\+38640222222/);
  assert.doesNotMatch(html, /tel:\+38611111111/);
  assert.equal((html.match(/>M<\/td>/g) || []).length, 1);
});

test("falls back to the business phone when mobile is missing", () => {
  const html = signature.buildSignatureHtml(
    "newMail",
    signature.normalizeGraphProfile({
      displayName: "Test User",
      businessPhones: ["+386 1 111 11 11"],
      mobilePhone: "",
      mail: "test@bubinjo.dev"
    })
  );

  assert.match(html, /tel:\+38611111111/);
  assert.equal((html.match(/>M<\/td>/g) || []).length, 1);
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
