"use strict";

const ORGANIZATION = {
  company: "B.DEV d.o.o.",
  website: "https://bubinjo.dev"
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

function line(label, value) {
  if (!value) return "";

  return (
    '<tr><td style="padding:1px 0;color:#58616b;white-space:nowrap;">' +
    escapeHtml(label) +
    '</td><td style="padding:1px 0 1px 8px;color:#1f2933;">' +
    escapeHtml(value) +
    "</td></tr>"
  );
}

function linkedLine(label, value, href) {
  if (!value || !href) return "";

  return (
    '<tr><td style="padding:1px 0;color:#58616b;white-space:nowrap;">' +
    escapeHtml(label) +
    '</td><td style="padding:1px 0 1px 8px;">' +
    '<a style="color:#167d78;text-decoration:none;" href="' +
    escapeHtml(href) +
    '">' +
    escapeHtml(value) +
    "</a></td></tr>"
  );
}

function buildSignatureHtml(composeType, profile) {
  const data = profile || FALLBACK_PROFILE;
  const compact = composeType === "reply" || composeType === "forward";
  let details = "";

  if (!compact) {
    details =
      '<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:8px;font:12px Arial,sans-serif;border-collapse:collapse;">' +
      line("T", data.businessPhone) +
      line("M", data.mobilePhone) +
      linkedLine("E", data.email, data.email ? "mailto:" + data.email : "") +
      linkedLine("W", data.website ? data.website.replace(/^https?:\/\//, "") : "", data.website) +
      "</table>";
  }

  const roleParts = [data.jobTitle, data.department].filter(Boolean);

  return (
    '<div data-bdev-signature="dynamic-v2" style="font-family:Arial,sans-serif;color:#1f2933;line-height:1.35;">' +
    '<div style="height:12px;line-height:12px;">&nbsp;</div>' +
    '<div style="border-left:4px solid #2f9c95;padding-left:12px;">' +
    '<div style="font-size:15px;font-weight:700;color:#16222a;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    (roleParts.length
      ? '<div style="font-size:12px;color:#58616b;">' + roleParts.map(escapeHtml).join(" · ") + "</div>"
      : "") +
    '<div style="margin-top:3px;font-size:12px;font-weight:700;color:#167d78;">' +
    escapeHtml(data.company) +
    "</div>" +
    details +
    "</div></div>"
  );
}

module.exports = {
  FALLBACK_PROFILE,
  ORGANIZATION,
  buildSignatureHtml,
  escapeHtml,
  normalizeGraphProfile
};
