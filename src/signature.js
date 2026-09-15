"use strict";

const ASSET_ROOT = "https://bubinjo.github.io/bdev-signatures/assets";

const ORGANIZATION = {
  company: "B.DEV d.o.o.",
  website: "https://bubinjo.dev",
  identityUrl: ASSET_ROOT + "/bdev-signature-identity-v1.png?v=0.5.0",
  infoBackgroundUrl: ASSET_ROOT + "/bdev-signature-info-bg-v1.jpg?v=0.5.0",
  artworkUrl: ASSET_ROOT + "/bdev-signature-artwork-v1.png?v=0.5.0"
};

const BRAND = {
  navy: "#03163D",
  navyDeep: "#020D2A",
  navyEdge: "#124B96",
  blue: "#246BFD",
  cyan: "#13C8FF",
  violet: "#7048FF",
  white: "#F7FAFF",
  muted: "#AEC4E8",
  mutedStrong: "#D7E5FA"
};

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
    '<td width="19" style="width:19px;padding:1px 5px 1px 0;color:' +
    BRAND.cyan +
    ';font:700 9px/1.35 Arial,sans-serif;letter-spacing:.6px;vertical-align:top;">' +
    escapeHtml(label) +
    "</td>" +
    '<td style="padding:1px 0;vertical-align:top;">' +
    '<a href="' +
    escapeHtml(href) +
    '" style="color:' +
    BRAND.mutedStrong +
    ';font:11px/1.35 Arial,sans-serif;text-decoration:none;">' +
    escapeHtml(value) +
    "</a></td></tr>"
  );
}

function buildContactRows(data) {
  const website = websiteHref(data.website);

  return [
    contactRow("T", data.businessPhone, phoneHref(data.businessPhone)),
    contactRow("M", data.mobilePhone, phoneHref(data.mobilePhone)),
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
    ' 11px/1.4 Arial,sans-serif;white-space:nowrap;">' +
    escapeHtml(value) +
    "</span>"
  );
}

function compactSeparator() {
  return (
    '<span style="padding:0 6px;color:' +
    BRAND.blue +
    ';font:700 11px/1.4 Arial,sans-serif;">|</span>'
  );
}

function buildCompactSignature(data) {
  const phone = data.businessPhone || data.mobilePhone;
  const items = [
    compactItem(data.displayName, BRAND.navy, "700"),
    compactItem(data.jobTitle, BRAND.blue, "700"),
    compactItem(data.company || ORGANIZATION.company, "#415674", "400"),
    data.email
      ? '<a href="mailto:' +
        escapeHtml(data.email) +
        '" style="color:#415674;font:400 11px/1.4 Arial,sans-serif;text-decoration:none;white-space:nowrap;">' +
        escapeHtml(data.email) +
        "</a>"
      : "",
    phone
      ? '<a href="' +
        escapeHtml(phoneHref(phone)) +
        '" style="color:#415674;font:400 11px/1.4 Arial,sans-serif;text-decoration:none;white-space:nowrap;">' +
        escapeHtml(phone) +
        "</a>"
      : ""
  ].filter(Boolean);

  return (
    '<table data-bdev-signature="compact-v1" role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:collapse;font-family:Arial,sans-serif;">' +
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
    '<table data-bdev-signature="full-banner-v2" role="presentation" border="0" cellspacing="0" cellpadding="0" width="640" bgcolor="' +
    BRAND.navy +
    '" style="width:640px;max-width:100%;margin-top:16px;border-collapse:collapse;background:' +
    BRAND.navy +
    ';border-radius:12px;overflow:hidden;font-family:Arial,sans-serif;">' +
    '<tr>' +
    '<td width="132" height="178" align="left" valign="top" style="width:132px;height:178px;padding:0;vertical-align:top;">' +
    '<a href="' +
    escapeHtml(websiteHref(data.website)) +
    '" style="display:block;text-decoration:none;">' +
    '<img src="' +
    escapeHtml(ORGANIZATION.identityUrl) +
    '" width="132" height="178" alt="B.DEV" style="display:block;width:132px;height:178px;margin:0;border:0;outline:none;text-decoration:none;" />' +
    "</a></td>" +
    '<td width="263" height="178" valign="middle" background="' +
    escapeHtml(ORGANIZATION.infoBackgroundUrl) +
    '" bgcolor="' +
    BRAND.navy +
    '" style="width:263px;height:178px;padding:0;background-color:' +
    BRAND.navy +
    ";background-image:url(" +
    escapeHtml(ORGANIZATION.infoBackgroundUrl) +
    ');background-position:left top;background-repeat:no-repeat;vertical-align:middle;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;border-collapse:collapse;">' +
    '<tr><td style="padding:13px 16px 12px 18px;">' +
    '<div style="color:' +
    BRAND.white +
    ';font:700 20px/1.15 Arial,sans-serif;letter-spacing:-.25px;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    (data.jobTitle
      ? '<div style="margin-top:3px;color:' +
        BRAND.cyan +
        ';font:700 12px/1.3 Arial,sans-serif;">' +
        escapeHtml(data.jobTitle) +
        "</div>"
      : "") +
    '<div style="margin-top:5px;color:' +
    BRAND.muted +
    ';font:400 11px/1.35 Arial,sans-serif;">' +
    escapeHtml(data.company || ORGANIZATION.company) +
    "</div>" +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:7px;border-collapse:collapse;">' +
    contacts +
    "</table>" +
    "</td></tr></table></td>" +
    '<td width="245" height="178" align="left" valign="top" style="width:245px;height:178px;padding:0;vertical-align:top;">' +
    '<img src="' +
    escapeHtml(ORGANIZATION.artworkUrl) +
    '" width="245" height="178" alt="B.DEV cloud infrastructure" style="display:block;width:245px;height:178px;margin:0;border:0;outline:none;text-decoration:none;" />' +
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
