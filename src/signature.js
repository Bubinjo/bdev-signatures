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

function roleText(data) {
  return [data.jobTitle, data.department].filter(Boolean);
}

function contactLink(value, href) {
  if (!value || !href) return "";

  return (
    '<a href="' +
    escapeHtml(href) +
    '" style="color:#d9e7eb;font:12px/1.5 Arial,sans-serif;text-decoration:none;white-space:nowrap;">' +
    escapeHtml(value) +
    "</a>"
  );
}

function buildContacts(data) {
  const items = [
    data.businessPhone
      ? contactLink(data.businessPhone, phoneHref(data.businessPhone))
      : "",
    data.mobilePhone
      ? contactLink(data.mobilePhone, phoneHref(data.mobilePhone))
      : "",
    data.email
      ? contactLink(data.email, "mailto:" + data.email)
      : ""
  ].filter(Boolean);

  if (!items.length) return "";

  return items
    .map(function (item, index) {
      const separator =
        index === items.length - 1
          ? ""
          : '<span style="padding:0 9px;color:#36d9c4;font:12px Arial,sans-serif;">/</span>';
      return item + separator;
    })
    .join("");
}

function buildCompactSignature(data) {
  const roles = roleText(data);

  return (
    '<table data-bdev-signature="compact-v3" role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:collapse;font-family:Arial,sans-serif;">' +
    '<tr><td style="border-left:2px solid #36d9c4;padding:0 0 0 10px;">' +
    '<div style="color:#16222a;font:700 14px/1.35 Arial,sans-serif;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    (roles.length
      ? '<div style="margin-top:2px;color:#52616b;font:12px/1.4 Arial,sans-serif;">' +
        roles.map(escapeHtml).join(" · ") +
        "</div>"
      : "") +
    '<div style="margin-top:3px;font:700 11px/1.3 Arial,sans-serif;letter-spacing:.1px;">' +
    '<a href="' +
    escapeHtml(data.website || ORGANIZATION.website) +
    '" style="color:#128f86;text-decoration:none;">bubinjo.dev</a>' +
    "</div>" +
    "</td></tr></table>"
  );
}

function buildFullSignature(data) {
  const roles = roleText(data);
  const contacts = buildContacts(data);

  return (
    '<table data-bdev-signature="full-v3" role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:16px;border-collapse:separate;font-family:Arial,sans-serif;">' +
    '<tr><td bgcolor="#091a23" style="background:#091a23;border:1px solid #173641;border-radius:14px;padding:17px 19px;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;border-collapse:collapse;">' +

    '<tr><td width="44" style="width:44px;padding:0 13px 0 0;vertical-align:middle;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="42" height="42" style="width:42px;height:42px;border-collapse:separate;">' +
    '<tr><td bgcolor="#102a34" align="center" valign="middle" style="background:#102a34;border:1px solid #2e7180;border-radius:10px;color:#9cffb7;font:700 16px/1 Consolas,Monaco,monospace;text-align:center;">&gt;_</td></tr>' +
    "</table></td>" +

    '<td style="padding:0;vertical-align:middle;">' +
    '<div style="font:700 17px/1.15 Arial,sans-serif;letter-spacing:-.2px;">' +
    '<a href="' +
    escapeHtml(data.website || ORGANIZATION.website) +
    '" style="color:#f3f8fa;text-decoration:none;">bubinjo<span style="color:#36d9c4;">.dev</span></a>' +
    "</div>" +
    '<div style="margin-top:5px;color:#7898a3;font:700 8px/1.25 Arial,sans-serif;letter-spacing:1.6px;text-transform:uppercase;">IT INFRASTRUCTURE SOLUTIONS</div>' +
    "</td>" +

    '<td align="right" style="padding:0 0 0 16px;vertical-align:middle;">' +
    '<span style="border:1px solid #28515e;border-radius:12px;color:#8db0b9;font:700 9px/1 Arial,sans-serif;letter-spacing:.8px;padding:5px 8px;white-space:nowrap;">' +
    escapeHtml(data.company) +
    "</span></td></tr>" +

    '<tr><td colspan="3" style="padding:14px 0 13px;">' +
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;border-collapse:collapse;">' +
    '<tr><td width="54" height="1" bgcolor="#36d9c4" style="width:54px;height:1px;background:#36d9c4;font-size:0;line-height:0;">&nbsp;</td>' +
    '<td height="1" bgcolor="#173641" style="height:1px;background:#173641;font-size:0;line-height:0;">&nbsp;</td></tr>' +
    "</table></td></tr>" +

    '<tr><td colspan="3" style="padding:0;">' +
    '<div style="color:#ffffff;font:700 19px/1.25 Arial,sans-serif;letter-spacing:-.2px;">' +
    escapeHtml(data.displayName) +
    "</div>" +
    (roles.length
      ? '<div style="margin-top:4px;color:#9fb7bf;font:12px/1.45 Arial,sans-serif;">' +
        roles
          .map(escapeHtml)
          .join(' <span style="padding:0 5px;color:#36d9c4;">·</span> ') +
        "</div>"
      : "") +
    (contacts
      ? '<div style="margin-top:11px;color:#d9e7eb;font:12px/1.5 Arial,sans-serif;">' +
        contacts +
        "</div>"
      : "") +
    "</td></tr>" +

    "</table></td></tr></table>"
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
