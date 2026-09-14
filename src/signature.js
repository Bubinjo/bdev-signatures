"use strict";

const ORGANIZATION = {
  company: "B.DEV d.o.o.",
  website: "https://bubinjo.dev",
  logoUrl:
    "https://bubinjo.github.io/bdev-signatures/assets/bdev-terminal-mark-v2-240.png"
};

const BRAND = {
  navy: "#03163D",
  navyDeep: "#020D2A",
  navyEdge: "#124B96",
  blue: "#246BFD",
  cyan: "#13C8FF",
  violet: "#7048FF",
  magenta: "#C04BFF",
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

function roleText(data) {
  return [data.jobTitle, data.department].filter(Boolean);
}

function contactRow(label, value, href) {
  if (!value || !href) return "";

  return (
    '<tr>' +
    '<td width="22" style="width:22px;padding:1px 7px 1px 0;color:' +
    BRAND.cyan +
    ';font:700 9px/1.45 Arial,sans-serif;letter-spacing:.8px;vertical-align:top;">' +
    escapeHtml(label) +
    "</td>" +
    '<td style="padding:1px 0;vertical-align:top;">' +
    '<a href="' +
    escapeHtml(href) +
    '" style="color:' +
    BRAND.mutedStrong +
    ';font:11.5px/1.45 Arial,sans-serif;text-decoration:none;">' +
    escapeHtml(value) +
    "</a></td></tr>"
  );
}

function buildContactRows(data) {
  return [
    contactRow("T", data.businessPhone, phoneHref(data.businessPhone)),
    contactRow("M", data.mobilePhone, phoneHref(data.mobilePhone)),
    contactRow("E", data.email, data.email ? "mailto:" + data.email : "")
  ]
    .filter(Boolean)
    .join("");
}

function brandWordmark(data) {
  return (
    '<a href="' +
    escapeHtml(data.website || ORGANIZATION.website) +
    '" style="color:' +
    BRAND.white +
    ';font:700 13px/1.1 Arial,sans-serif;letter-spacing:-.25px;text-decoration:none;">' +
    'bubinjo<span style="color:' +
    BRAND.blue +
    ';">.dev</span></a>'
  );
}

function buildCompactSignature(data) {
  const roles = roleText(data);

  return (
    '<table data-bdev-signature="compact-v5" role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:separate;font-family:Arial,sans-serif;">' +
    '<tr><td bgcolor="' +
    BRAND.navy +
    '" style="background:' +
    BRAND.navy +
    ';border-radius:10px;padding:9px 12px;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">' +
    '<tr><td width="34" style="width:34px;padding:0 10px 0 0;vertical-align:middle;">' +
    '<img src="' +
    ORGANIZATION.logoUrl +
    '" width="34" height="34" alt="B.DEV" style="display:block;width:34px;height:34px;border:0;border-radius:7px;outline:none;" />' +
    '</td><td style="padding:0;vertical-align:middle;">' +
    '<div style="color:' +
    BRAND.white +
    ';font:700 14px/1.25 Arial,sans-serif;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    (roles.length
      ? '<div style="margin-top:2px;color:' +
        BRAND.muted +
        ';font:11px/1.35 Arial,sans-serif;">' +
        roles
          .map(escapeHtml)
          .join(' <span style="padding:0 4px;color:' + BRAND.cyan + ';">·</span> ') +
        "</div>"
      : "") +
    '<div style="margin-top:3px;">' +
    brandWordmark(data) +
    "</div></td></tr>" +
    '<tr><td colspan="2" style="padding:8px 0 0;">' +
    '<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">' +
    '<tr><td width="34%" height="2" bgcolor="' +
    BRAND.cyan +
    '" style="height:2px;background:' +
    BRAND.cyan +
    ';font-size:0;line-height:0;">&nbsp;</td>' +
    '<td width="33%" height="2" bgcolor="' +
    BRAND.blue +
    '" style="height:2px;background:' +
    BRAND.blue +
    ';font-size:0;line-height:0;">&nbsp;</td>' +
    '<td width="33%" height="2" bgcolor="' +
    BRAND.violet +
    '" style="height:2px;background:' +
    BRAND.violet +
    ';font-size:0;line-height:0;">&nbsp;</td></tr></table>' +
    "</td></tr></table></td></tr></table>"
  );
}

function buildFullSignature(data) {
  const roles = roleText(data);
  const contacts = buildContactRows(data);

  return (
    '<table data-bdev-signature="full-v5" role="presentation" border="0" cellspacing="0" cellpadding="0" width="400" style="width:400px;max-width:100%;margin-top:16px;border-collapse:separate;font-family:Arial,sans-serif;">' +
    '<tr><td bgcolor="' +
    BRAND.navy +
    '" style="background:' +
    BRAND.navy +
    ';background-image:linear-gradient(145deg,' +
    BRAND.navyDeep +
    ' 0%,' +
    BRAND.navy +
    ' 68%,#082B63 100%);border-radius:13px;overflow:hidden;">' +

    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;border-collapse:collapse;">' +
    '<tr><td style="padding:16px 18px;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;border-collapse:collapse;">' +
    '<tr><td width="67" style="width:67px;padding:2px 14px 0 0;vertical-align:top;">' +
    '<img src="' +
    ORGANIZATION.logoUrl +
    '" width="62" height="62" alt="B.DEV" style="display:block;width:62px;height:62px;border:0;outline:none;" />' +
    '</td><td width="1" bgcolor="' +
    BRAND.blue +
    '" style="width:1px;background:' +
    BRAND.blue +
    ';font-size:0;line-height:0;">&nbsp;</td>' +

    '<td style="padding:0 0 0 15px;vertical-align:top;">' +
    '<div style="margin-bottom:3px;color:' +
    BRAND.cyan +
    ';font:700 8.5px/1.2 Arial,sans-serif;letter-spacing:1.2px;text-transform:uppercase;">' +
    escapeHtml(data.company || ORGANIZATION.company) +
    "</div>" +
    '<div style="color:' +
    BRAND.white +
    ';font:700 18px/1.2 Arial,sans-serif;letter-spacing:-.25px;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    (roles.length
      ? '<div style="margin-top:4px;color:' +
        BRAND.muted +
        ';font:11.5px/1.4 Arial,sans-serif;">' +
        roles
          .map(escapeHtml)
          .join(' <span style="padding:0 5px;color:' + BRAND.cyan + ';">·</span> ') +
        "</div>"
      : "") +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:8px;border-collapse:collapse;">' +
    '<tr><td width="22" height="2" bgcolor="' +
    BRAND.cyan +
    '" style="width:22px;height:2px;background:' +
    BRAND.cyan +
    ';font-size:0;line-height:0;">&nbsp;</td>' +
    '<td width="28" height="2" bgcolor="' +
    BRAND.blue +
    '" style="width:28px;height:2px;background:' +
    BRAND.blue +
    ';font-size:0;line-height:0;">&nbsp;</td>' +
    '<td width="18" height="2" bgcolor="' +
    BRAND.violet +
    '" style="width:18px;height:2px;background:' +
    BRAND.violet +
    ';font-size:0;line-height:0;">&nbsp;</td></tr></table>' +

    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:7px;border-collapse:collapse;">' +
    contacts +
    "</table>" +
    '<div style="margin-top:7px;">' +
    brandWordmark(data) +
    "</div>" +
    "</td></tr></table></td></tr></table>" +
    "</td></tr></table>"
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
