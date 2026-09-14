"use strict";

const ORGANIZATION = {
  company: "B.DEV d.o.o.",
  website: "https://bubinjo.dev",
  logoUrl: "https://bubinjo.github.io/bdev-signatures/assets/icon-128.png"
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
    displayName: personalName ||
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

function roleHtml(data, compact) {
  const roleParts = [data.jobTitle, data.department].filter(Boolean);
  if (!roleParts.length) return "";

  return (
    '<div style="margin-top:' +
    (compact ? "2px" : "4px") +
    ";color:#52616b;font:" +
    (compact ? "12px" : "13px") +
    '/1.45 Arial,sans-serif;">' +
    roleParts.map(escapeHtml).join(' <span style="color:#40c9a2;">·</span> ') +
    "</div>"
  );
}

function contactCell(label, value, href) {
  if (!value || !href) return "";

  return (
    '<td style="padding:0 15px 0 0;white-space:nowrap;vertical-align:middle;">' +
    '<span style="color:#2f9c95;font:700 10px Arial,sans-serif;letter-spacing:.5px;">' +
    escapeHtml(label) +
    "</span> " +
    '<a href="' +
    escapeHtml(href) +
    '" style="color:#263840;font:12px Arial,sans-serif;text-decoration:none;">' +
    escapeHtml(value) +
    "</a></td>"
  );
}

function buildContactStrip(data) {
  const websiteLabel = data.website
    ? data.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";

  const contacts =
    contactCell("T", data.businessPhone, phoneHref(data.businessPhone)) +
    contactCell("M", data.mobilePhone, phoneHref(data.mobilePhone)) +
    contactCell("E", data.email, data.email ? "mailto:" + data.email : "") +
    contactCell("W", websiteLabel, data.website);

  if (!contacts) return "";

  return (
    '<tr><td colspan="2" style="padding-top:13px;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#e5f9e0;border-left:3px solid #40c9a2;">' +
    '<tr><td style="padding:9px 0 9px 12px;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;"><tr>' +
    contacts +
    "</tr></table>" +
    "</td></tr></table>" +
    "</td></tr>"
  );
}

function buildCompactSignature(data) {
  return (
    '<table data-bdev-signature="compact-v2" role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:collapse;font-family:Arial,sans-serif;">' +
    "<tr>" +
    '<td style="border-left:3px solid #40c9a2;padding:1px 0 1px 11px;">' +
    '<div style="color:#16222a;font:700 14px/1.35 Arial,sans-serif;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    roleHtml(data, true) +
    '<div style="margin-top:3px;color:#2f9c95;font:700 10px/1.3 Arial,sans-serif;letter-spacing:.7px;text-transform:uppercase;">' +
    escapeHtml(data.company) +
    "</div>" +
    "</td></tr></table>"
  );
}

function buildFullSignature(data) {
  return (
    '<table data-bdev-signature="full-v2" role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:16px;border-collapse:collapse;font-family:Arial,sans-serif;">' +
    "<tr>" +
    '<td width="72" style="width:72px;padding:0 17px 0 0;vertical-align:middle;">' +
    '<a href="' +
    escapeHtml(data.website || ORGANIZATION.website) +
    '" style="text-decoration:none;">' +
    '<img src="' +
    escapeHtml(ORGANIZATION.logoUrl) +
    '" width="72" height="72" alt="B.DEV" style="display:block;width:72px;height:72px;border:0;border-radius:14px;" />' +
    "</a></td>" +
    '<td style="padding:0;vertical-align:middle;">' +
    '<div style="color:#2f9c95;font:700 10px/1.3 Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">' +
    escapeHtml(data.company) +
    "</div>" +
    '<div style="margin-top:3px;color:#16222a;font:700 19px/1.25 Arial,sans-serif;letter-spacing:-.2px;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    roleHtml(data, false) +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:9px;border-collapse:collapse;"><tr>' +
    '<td width="36" height="3" style="width:36px;height:3px;background:#40c9a2;font-size:0;line-height:0;">&nbsp;</td>' +
    '<td width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td>' +
    '<td width="12" height="3" style="width:12px;height:3px;background:#a3f7b5;font-size:0;line-height:0;">&nbsp;</td>' +
    "</tr></table>" +
    "</td></tr>" +
    buildContactStrip(data) +
    "</table>"
  );
}

function buildSignatureHtml(composeType, profile) {
  const data = profile || FALLBACK_PROFILE;
  const compact = composeType === "reply" || composeType === "forward";
  return compact ? buildCompactSignature(data) : buildFullSignature(data);
}

module.exports = {
  FALLBACK_PROFILE,
  ORGANIZATION,
  buildSignatureHtml,
  escapeHtml,
  normalizeGraphProfile
};
