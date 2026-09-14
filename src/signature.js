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

  return {
    displayName: valueOrEmpty(data.displayName) ||
      [valueOrEmpty(data.givenName), valueOrEmpty(data.surname)].filter(Boolean).join(" ") ||
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

function linkedContact(label, value, href) {
  if (!value || !href) return "";

  return (
    "<tr>" +
    '<td style="padding:1px 8px 1px 0;color:#2f9c95;font:700 11px Arial,sans-serif;vertical-align:top;">' +
    escapeHtml(label) +
    "</td>" +
    '<td style="padding:1px 0;font:12px Arial,sans-serif;vertical-align:top;">' +
    '<a href="' +
    escapeHtml(href) +
    '" style="color:#34434c;text-decoration:none;">' +
    escapeHtml(value) +
    "</a></td></tr>"
  );
}

function phoneHref(value) {
  return value ? "tel:" + String(value).replace(/[^\d+]/g, "") : "";
}

function roleHtml(data) {
  const roleParts = [data.jobTitle, data.department].filter(Boolean);
  if (!roleParts.length) return "";

  return (
    '<div style="margin-top:2px;color:#2f9c95;font:700 12px Arial,sans-serif;">' +
    roleParts.map(escapeHtml).join(" &nbsp;·&nbsp; ") +
    "</div>"
  );
}

function buildCompactSignature(data) {
  return (
    '<table data-bdev-signature="compact-v1" role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:collapse;font-family:Arial,sans-serif;">' +
    "<tr>" +
    '<td style="border-left:3px solid #40c9a2;padding:1px 0 1px 11px;">' +
    '<div style="color:#16222a;font:700 14px Arial,sans-serif;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    roleHtml(data) +
    '<div style="margin-top:2px;color:#664147;font:700 11px Arial,sans-serif;">' +
    escapeHtml(data.company) +
    "</div>" +
    "</td></tr></table>"
  );
}

function buildFullSignature(data) {
  const websiteLabel = data.website ? data.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";
  const details =
    linkedContact("T", data.businessPhone, phoneHref(data.businessPhone)) +
    linkedContact("M", data.mobilePhone, phoneHref(data.mobilePhone)) +
    linkedContact("E", data.email, data.email ? "mailto:" + data.email : "") +
    linkedContact("W", websiteLabel, data.website);

  return (
    '<table data-bdev-signature="full-v1" role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:14px;border-collapse:collapse;font-family:Arial,sans-serif;">' +
    "<tr>" +
    '<td style="padding:2px 16px 2px 0;vertical-align:top;">' +
    '<a href="' +
    escapeHtml(data.website || ORGANIZATION.website) +
    '" style="text-decoration:none;">' +
    '<img src="' +
    escapeHtml(ORGANIZATION.logoUrl) +
    '" width="68" height="68" alt="B.DEV" style="display:block;width:68px;height:68px;border:0;border-radius:13px;" />' +
    "</a></td>" +
    '<td style="border-left:3px solid #40c9a2;padding:1px 0 1px 16px;vertical-align:top;">' +
    '<div style="color:#16222a;font:700 17px Arial,sans-serif;line-height:21px;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    roleHtml(data) +
    '<div style="margin-top:5px;color:#664147;font:700 11px Arial,sans-serif;letter-spacing:.3px;">' +
    escapeHtml(data.company) +
    "</div>" +
    (details
      ? '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:7px;border-collapse:collapse;">' +
        details +
        "</table>"
      : "") +
    "</td></tr></table>"
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
