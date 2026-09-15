"use strict";

const ASSET_ROOT = "https://bubinjo.github.io/bdev-signatures/assets";

const ORGANIZATION = {
  company: "B.DEV d.o.o.",
  website: "https://bubinjo.dev",
  identityUrl: ASSET_ROOT + "/bdev-signature-identity-v2.png?v=0.6.0",
  infoBackgroundUrl: ASSET_ROOT + "/bdev-signature-info-bg-v2.jpg?v=0.6.0",
  artworkUrl: ASSET_ROOT + "/bdev-signature-artwork-v2.png?v=0.6.0"
};

const BRAND = {
  navy: "#03163D",
  navySecondary: "#06245A",
  blue: "#246BFD",
  cyan: "#13C8FF",
  violet: "#7048FF",
  white: "#FFFFFF",
  muted: "#AFC4DD",
  contact: "#EAF4FF",
  divider: "#2D6FD2"
};

const FONT_STACK = "'Segoe UI',Arial,sans-serif";

const FALLBACK_PROFILE = {
  displayName: "B.DEV",
  jobTitle: "",
  department: "",
  company: ORGANIZATION.company,
  businessPhone: "",
  mobilePhone: "",
  email: "",
  website: ORGANIZATION.website
};

function valueOrEmpty(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function normalizeGraphProfile(user) {
  const data = user || {};
  const businessPhones = Array.isArray(data.businessPhones) ? data.businessPhones : [];
  const personalName = [valueOrEmpty(data.givenName), valueOrEmpty(data.surname)]
    .filter(Boolean)
    .join(" ");

  return {
    displayName:
      personalName ||
      valueOrEmpty(data.displayName) ||
      valueOrEmpty(data.mail) ||
      valueOrEmpty(data.userPrincipalName) ||
      FALLBACK_PROFILE.displayName,
    jobTitle: valueOrEmpty(data.jobTitle),
    department: valueOrEmpty(data.department),
    company: valueOrEmpty(data.companyName) || ORGANIZATION.company,
    businessPhone: valueOrEmpty(businessPhones[0]),
    mobilePhone: valueOrEmpty(data.mobilePhone),
    email: valueOrEmpty(data.mail) || valueOrEmpty(data.userPrincipalName),
    website: ORGANIZATION.website
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function phoneHref(value) {
  return value ? "tel:" + String(value).replace(/[^\d+]/g, "") : "";
}

function websiteHref(value) {
  const candidate = valueOrEmpty(value);
  return /^https?:\/\//i.test(candidate) ? candidate : ORGANIZATION.website;
}

function websiteLabel(value) {
  return valueOrEmpty(value)
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function contactRow(label, value, href) {
  if (!value || !href) return "";

  return (
    '<tr>' +
    '<td width="17" height="16" style="width:17px;height:16px;padding:0;color:' +
    BRAND.cyan +
    ";font:700 11px/16px " +
    FONT_STACK +
    ';vertical-align:top;">' +
    escapeHtml(label) +
    "</td>" +
    '<td width="13" height="16" style="width:13px;height:16px;padding:0;color:' +
    BRAND.divider +
    ";font:400 11px/16px " +
    FONT_STACK +
    ';vertical-align:top;">&#124;</td>' +
    '<td height="16" style="height:16px;padding:0;vertical-align:top;">' +
    '<a href="' +
    escapeHtml(href) +
    '" style="color:' +
    BRAND.contact +
    "!important;font:400 11px/16px " +
    FONT_STACK +
    ';mso-style-priority:99;text-decoration:none!important;">' +
    escapeHtml(value) +
    "</a></td></tr>"
  );
}

function buildContactRows(data) {
  const website = websiteHref(data.website);
  const phone = data.mobilePhone || data.businessPhone;

  return [
    contactRow("M", phone, phoneHref(phone)),
    contactRow("E", data.email, data.email ? "mailto:" + data.email : ""),
    contactRow("W", websiteLabel(website), website)
  ]
    .filter(Boolean)
    .join("");
}

function compactItem(value, color, weight) {
  if (!value) return "";

  return (
    '<span style="color:' +
    color +
    ";font:" +
    weight +
    " 11px/1.4 " +
    FONT_STACK +
    ';white-space:nowrap;">' +
    escapeHtml(value) +
    "</span>"
  );
}

function compactSeparator() {
  return (
    '<span style="padding:0 6px;color:' +
    BRAND.blue +
    ";font:700 11px/1.4 " +
    FONT_STACK +
    ';">|</span>'
  );
}

function buildCompactSignature(data) {
  const phone = data.mobilePhone || data.businessPhone;
  const items = [
    compactItem(data.displayName, BRAND.navy, "700"),
    compactItem(data.jobTitle, BRAND.blue, "700"),
    compactItem(data.company || ORGANIZATION.company, "#415674", "400"),
    data.email
      ? '<a href="mailto:' +
        escapeHtml(data.email) +
        '" style="color:#415674;font:400 11px/1.4 ' +
        FONT_STACK +
        ';text-decoration:none;white-space:nowrap;">' +
        escapeHtml(data.email) +
        "</a>"
      : "",
    phone
      ? '<a href="' +
        escapeHtml(phoneHref(phone)) +
        '" style="color:#415674;font:400 11px/1.4 ' +
        FONT_STACK +
        ';text-decoration:none;white-space:nowrap;">' +
        escapeHtml(phone) +
        "</a>"
      : ""
  ].filter(Boolean);

  return (
    '<table data-bdev-signature="compact-v1" role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:collapse;font-family:' +
    FONT_STACK +
    ';">' +
    '<tr><td width="3" bgcolor="' +
    BRAND.cyan +
    '" style="width:3px;background:' +
    BRAND.cyan +
    ';font-size:0;line-height:0;">&nbsp;</td>' +
    '<td style="padding:3px 0 3px 9px;">' +
    items.join(compactSeparator()) +
    "</td></tr></table>"
  );
}

function buildFullSignature(data) {
  const contacts = buildContactRows(data);

  return (
    '<table data-bdev-signature="full-banner-v3" role="presentation" border="0" cellspacing="0" cellpadding="0" width="640" bgcolor="' +
    BRAND.navy +
    '" style="width:640px;max-width:100%;margin-top:16px;border-collapse:collapse;background:' +
    BRAND.navy +
    ';border-radius:12px;overflow:hidden;font-family:' +
    FONT_STACK +
    ';">' +
    '<tr>' +
    '<td width="129" height="176" align="left" valign="top" style="width:129px;height:176px;padding:0;vertical-align:top;">' +
    '<a href="' +
    escapeHtml(websiteHref(data.website)) +
    '" style="display:block;text-decoration:none;">' +
    '<img src="' +
    escapeHtml(ORGANIZATION.identityUrl) +
    '" width="129" height="176" alt="B.DEV" style="display:block;width:129px;height:176px;margin:0;border:0;outline:none;text-decoration:none;" />' +
    "</a></td>" +
    '<td width="1" height="176" valign="middle" bgcolor="' +
    BRAND.navy +
    '" style="width:1px;height:176px;padding:0;background:' +
    BRAND.navy +
    ';vertical-align:middle;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="1" style="width:1px;border-collapse:collapse;">' +
    '<tr><td width="1" height="22" style="width:1px;height:22px;font-size:0;line-height:0;">&nbsp;</td></tr>' +
    '<tr><td width="1" height="132" bgcolor="' +
    BRAND.divider +
    '" style="width:1px;height:132px;background:' +
    BRAND.divider +
    ';font-size:0;line-height:0;">&nbsp;</td></tr>' +
    '<tr><td width="1" height="22" style="width:1px;height:22px;font-size:0;line-height:0;">&nbsp;</td></tr>' +
    '</table></td>' +
    '<td width="290" height="176" valign="top" background="' +
    escapeHtml(ORGANIZATION.infoBackgroundUrl) +
    '" bgcolor="' +
    BRAND.navy +
    '" style="width:290px;height:176px;padding:0;background-color:' +
    BRAND.navy +
    ";background-image:url(" +
    escapeHtml(ORGANIZATION.infoBackgroundUrl) +
    ');background-position:left top;background-repeat:no-repeat;vertical-align:top;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;border-collapse:collapse;">' +
    '<tr><td style="padding:21px 14px 8px 22px;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;border-collapse:collapse;">' +
    '<tr><td style="padding:0;color:' +
    BRAND.white +
    ";font:700 19px/23px " +
    FONT_STACK +
    ';">' +
    escapeHtml(data.displayName) +
    "</td></tr>" +
    (data.jobTitle
      ? '<tr><td style="padding:2px 0 0;color:' +
        BRAND.cyan +
        ";font:600 13px/18px " +
        FONT_STACK +
        ';">' +
        escapeHtml(data.jobTitle) +
        "</td></tr>"
      : "") +
    '<tr><td style="padding:2px 0 0;color:' +
    BRAND.muted +
    ";font:400 11px/16px " +
    FONT_STACK +
    ';">' +
    escapeHtml(data.company || ORGANIZATION.company) +
    "</td></tr></table>" +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:collapse;">' +
    contacts +
    "</table>" +
    "</td></tr></table></td>" +
    '<td width="220" height="176" align="left" valign="top" style="width:220px;height:176px;padding:0;vertical-align:top;">' +
    '<img src="' +
    escapeHtml(ORGANIZATION.artworkUrl) +
    '" width="220" height="176" alt="B.DEV cloud infrastructure" style="display:block;width:220px;height:176px;margin:0;border:0;outline:none;text-decoration:none;" />' +
    "</td>" +
    "</tr></table>"
  );
}

function buildSignatureHtml(composeType, profile) {
  const data = profile || FALLBACK_PROFILE;
  const compact = composeType === "reply" || composeType === "forward";
  return compact ? buildCompactSignature(data) : buildFullSignature(data);
}

module.exports = {
  BRAND,
  FALLBACK_PROFILE,
  ORGANIZATION,
  buildSignatureHtml,
  escapeHtml,
  normalizeGraphProfile
};
