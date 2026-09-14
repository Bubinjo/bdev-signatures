/* global Office */
(function (root, factory) {
  "use strict";

  var api = factory();

  var isCommonJs = typeof module === "object" && module.exports;

  if (isCommonJs) {
    module.exports = api;
  }

  root.BdevSignature = api;

  // Office.js is loaded before this file in Outlook. Register the event handler
  // directly so a missing/late conditional check cannot silently skip activation.
  if (!isCommonJs) {
    Office.actions.associate("applyBdevSignature", api.handleComposeEvent);
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var POC_PROFILE = {
    displayName: "Danijel Buba",
    jobTitle: "System Engineer",
    department: "IT",
    company: "B.DEV d.o.o.",
    businessPhone: "+386 1 000 00 00",
    mobilePhone: "+386 40 000 000",
    email: "danijel@bubinjo.dev",
    website: "https://bubinjo.dev"
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function line(label, value) {
    if (!value) {
      return "";
    }

    return (
      '<tr><td style="padding:1px 0;color:#58616b;white-space:nowrap;">' +
      escapeHtml(label) +
      '</td><td style="padding:1px 0 1px 8px;color:#1f2933;">' +
      escapeHtml(value) +
      "</td></tr>"
    );
  }

  function linkedLine(label, value, href) {
    if (!value) {
      return "";
    }

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
    var data = profile || POC_PROFILE;
    var compact = composeType === "reply" || composeType === "forward";
    var details = "";

    if (!compact) {
      details =
        '<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:8px;font:12px Arial,sans-serif;border-collapse:collapse;">' +
        line("T", data.businessPhone) +
        line("M", data.mobilePhone) +
        linkedLine("E", data.email, "mailto:" + data.email) +
        linkedLine("W", data.website ? data.website.replace(/^https?:\/\//, "") : "", data.website) +
        "</table>";
    }

    return (
      '<div data-bdev-signature="poc-v1" style="font-family:Arial,sans-serif;color:#1f2933;line-height:1.35;">' +
      '<div style="height:12px;line-height:12px;">&nbsp;</div>' +
      '<div style="border-left:4px solid #2f9c95;padding-left:12px;">' +
      '<div style="font-size:15px;font-weight:700;color:#16222a;">' +
      escapeHtml(data.displayName) +
      "</div>" +
      '<div style="font-size:12px;color:#58616b;">' +
      escapeHtml(data.jobTitle) +
      (data.department ? " · " + escapeHtml(data.department) : "") +
      "</div>" +
      '<div style="margin-top:3px;font-size:12px;font-weight:700;color:#167d78;">' +
      escapeHtml(data.company) +
      "</div>" +
      details +
      "</div></div>"
    );
  }

  function composeType(callback) {
    var item = Office.context.mailbox.item;

    if (!item.getComposeTypeAsync) {
      callback("newMail");
      return;
    }

    item.getComposeTypeAsync(function (result) {
      var succeeded = result.status === "succeeded";
      if (Office.AsyncResultStatus) {
        succeeded = succeeded || result.status === Office.AsyncResultStatus.Succeeded;
      }

      callback(succeeded && result.value ? result.value.composeType : "newMail");
    });
  }

  function setSignature(html, callback) {
    var body = Office.context.mailbox.item.body;

    if (!body || !body.setSignatureAsync) {
      callback(new Error("Outlook client ne podpira setSignatureAsync (Mailbox 1.10)."));
      return;
    }

    body.setSignatureAsync(html, { coercionType: "html" }, function (result) {
      var succeeded = result.status === "succeeded";
      if (Office.AsyncResultStatus) {
        succeeded = succeeded || result.status === Office.AsyncResultStatus.Succeeded;
      }

      if (succeeded) {
        callback(null);
        return;
      }

      callback(new Error((result.error && result.error.message) || "Vstavljanje podpisa ni uspelo."));
    });
  }

  function insertForCurrentItem(callback) {
    composeType(function (type) {
      setSignature(buildSignatureHtml(type, POC_PROFILE), callback || function () {});
    });
  }

  function handleComposeEvent(event) {
    var completed = false;

    function finish() {
      if (!completed) {
        completed = true;
        event.completed();
      }
    }

    try {
      insertForCurrentItem(function (error) {
        if (error && typeof console !== "undefined") {
          console.error("B.DEV signature:", error);
        }
        finish();
      });
    } catch (error) {
      if (typeof console !== "undefined") {
        console.error("B.DEV signature:", error);
      }
      finish();
    }
  }

  return {
    POC_PROFILE: POC_PROFILE,
    buildSignatureHtml: buildSignatureHtml,
    escapeHtml: escapeHtml,
    handleComposeEvent: handleComposeEvent,
    insertForCurrentItem: insertForCurrentItem
  };
});
