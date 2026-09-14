/* global Office */
"use strict";

const { createNestablePublicClientApplication } = require("@azure/msal-browser");
const signature = require("./signature");

const AUTH_CONFIG = {
  clientId: "9d306768-45da-4299-af5f-c5ca17164d41",
  authority: "https://login.microsoftonline.com/ef128b1e-9a0a-4181-88a8-1a08e037fc0a"
};

const GRAPH_PROFILE_URL =
  "https://graph.microsoft.com/v1.0/me?$select=displayName,givenName,surname,jobTitle,department,companyName,businessPhones,mobilePhone,mail,userPrincipalName,officeLocation";
const TOKEN_REQUEST = { scopes: ["User.Read"] };
const DIAGNOSTIC_KEY = "bdev-signature-event-diagnostic-v2";

let pcaPromise;

function recordDiagnostic(stage, detail) {
  try {
    if (typeof localStorage === "undefined") return;

    localStorage.setItem(
      DIAGNOSTIC_KEY,
      JSON.stringify({
        stage,
        detail: detail || "",
        timestamp: new Date().toISOString()
      })
    );
  } catch (_) {
    // Diagnostics must never interrupt signature insertion.
  }
}

function getDiagnostic() {
  try {
    if (typeof localStorage === "undefined") return null;
    const value = localStorage.getItem(DIAGNOSTIC_KEY);
    return value ? JSON.parse(value) : null;
  } catch (_) {
    return null;
  }
}

function clearDiagnostic() {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(DIAGNOSTIC_KEY);
  } catch (_) {
    // Ignore unavailable browser storage.
  }
}

function assertNaaSupport() {
  const requirements = Office &&
    Office.context &&
    Office.context.requirements;

  if (
    requirements &&
    typeof requirements.isSetSupported === "function" &&
    !requirements.isSetSupported("NestedAppAuth", "1.1")
  ) {
    throw new Error("Ta Outlook odjemalec ne podpira Nested App Authentication 1.1.");
  }
}

function getPca() {
  assertNaaSupport();

  if (!pcaPromise) {
    pcaPromise = createNestablePublicClientApplication({ auth: AUTH_CONFIG });
  }

  return pcaPromise;
}

async function acquireAccessToken(interactive) {
  const pca = await getPca();

  try {
    const result = await pca.acquireTokenSilent(TOKEN_REQUEST);
    return result.accessToken;
  } catch (silentError) {
    if (!interactive) throw silentError;

    const result = await pca.acquireTokenPopup(TOKEN_REQUEST);
    return result.accessToken;
  }
}

async function getGraphProfile(interactive) {
  const accessToken = await acquireAccessToken(Boolean(interactive));
  const response = await fetch(GRAPH_PROFILE_URL, {
    headers: { Authorization: "Bearer " + accessToken }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error("Microsoft Graph " + response.status + ": " + detail);
  }

  return signature.normalizeGraphProfile(await response.json());
}

function getOfficeFallbackProfile() {
  const mailbox = Office && Office.context && Office.context.mailbox;
  const user = (mailbox && mailbox.userProfile) || {};
  const email = user.emailAddress || "";

  return {
    displayName: user.displayName || email || signature.FALLBACK_PROFILE.displayName,
    jobTitle: "",
    department: "",
    company: signature.ORGANIZATION.company,
    businessPhone: "",
    mobilePhone: "",
    email,
    website: signature.ORGANIZATION.website
  };
}

async function resolveProfile(interactive) {
  try {
    return { profile: await getGraphProfile(interactive), source: "graph" };
  } catch (error) {
    recordDiagnostic("graph-fallback", error && error.message ? error.message : String(error));
    return { profile: getOfficeFallbackProfile(), source: "office-fallback", error };
  }
}

function getComposeType() {
  return new Promise((resolve) => {
    const item = Office.context.mailbox.item;

    if (!item.getComposeTypeAsync) {
      resolve("newMail");
      return;
    }

    item.getComposeTypeAsync((result) => {
      const succeeded =
        result.status === "succeeded" ||
        (Office.AsyncResultStatus && result.status === Office.AsyncResultStatus.Succeeded);
      resolve(succeeded && result.value ? result.value.composeType : "newMail");
    });
  });
}

function setSignature(html) {
  return new Promise((resolve, reject) => {
    const body = Office.context.mailbox.item.body;

    if (!body || !body.setSignatureAsync) {
      reject(new Error("Outlook client ne podpira setSignatureAsync (Mailbox 1.10)."));
      return;
    }

    body.setSignatureAsync(
      html,
      { coercionType: Office.CoercionType ? Office.CoercionType.Html : "html" },
      (result) => {
        const succeeded =
          result.status === "succeeded" ||
          (Office.AsyncResultStatus && result.status === Office.AsyncResultStatus.Succeeded);

        if (succeeded) {
          resolve();
        } else {
          reject(new Error((result.error && result.error.message) || "Vstavljanje podpisa ni uspelo."));
        }
      }
    );
  });
}

async function insertSignature(interactive) {
  const [composeType, resolved] = await Promise.all([
    getComposeType(),
    resolveProfile(Boolean(interactive))
  ]);

  await setSignature(signature.buildSignatureHtml(composeType, resolved.profile));
  return resolved;
}

function insertForCurrentItem(callback, interactive) {
  insertSignature(Boolean(interactive))
    .then((result) => (callback || function () {})(null, result))
    .catch((error) => (callback || function () {})(error));
}

async function connectAndGetProfile() {
  const profile = await getGraphProfile(true);
  recordDiagnostic("graph-connected", "Microsoft Graph profil je uspešno prebran.");
  return profile;
}

function handleComposeEvent(event) {
  let completed = false;
  recordDiagnostic("event-invoked", "Outlook je sprožil OnNewMessageCompose.");

  function finish() {
    if (!completed) {
      completed = true;
      event.completed();
    }
  }

  insertSignature(false)
    .then((result) => {
      const stage = result.source === "graph" ? "signature-success-graph" : "signature-success-fallback";
      const detail =
        result.source === "graph"
          ? "Dinamični podpis iz Microsoft Grapha je bil samodejno vstavljen."
          : "Vstavljen je bil minimalni Office podpis. V taskpanu izvedi prvo povezavo z Microsoft 365.";
      recordDiagnostic(stage, detail);
    })
    .catch((error) => {
      recordDiagnostic("signature-error", error && error.message ? error.message : String(error));
      if (typeof console !== "undefined") console.error("B.DEV signature:", error);
    })
    .finally(finish);
}

const api = {
  AUTH_CONFIG,
  buildSignatureHtml: signature.buildSignatureHtml,
  clearDiagnostic,
  connectAndGetProfile,
  escapeHtml: signature.escapeHtml,
  getDiagnostic,
  getGraphProfile,
  getOfficeFallbackProfile,
  handleComposeEvent,
  insertForCurrentItem,
  normalizeGraphProfile: signature.normalizeGraphProfile,
  recordDiagnostic
};

if (typeof self !== "undefined") {
  self.BdevSignature = api;

  const isEventRuntime = self.location && /\/runtime\.html$/.test(self.location.pathname);
  if (isEventRuntime) recordDiagnostic("runtime-loaded", "Event runtime JavaScript se je naložil.");

  Office.actions.associate("applyBdevSignature", handleComposeEvent);
  if (isEventRuntime) recordDiagnostic("handler-associated", "Handler applyBdevSignature je registriran.");

  Office.onReady(function () {});
}

module.exports = api;
