// Architectural Change Request form.
//
// This is a static site with no backend, so "submitting" this form means
// building a plain-text summary of the answers and handing it to the
// visitor's own email app as a pre-filled message to the board. Nothing is
// actually sent until the visitor reviews it and clicks Send in their own
// email app — there is no server here to send it for them.
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("arc-form");
  if (!form) return;

  var BOARD_EMAIL = "board@villasofworthingtonhoa.com";
  var status = document.getElementById("arc-form-status");
  var fallback = document.getElementById("arc-form-fallback");
  var fallbackText = document.getElementById("arc-form-fallback-text");
  var copyBtn = document.getElementById("arc-form-copy-btn");
  var copyStatus = document.getElementById("arc-form-copy-status");

  // Most email clients and browsers start truncating or refusing mailto:
  // links somewhere around 2,000 characters (Outlook's own limit is close
  // to that). A long "Description of Proposed Work" can realistically push
  // this form past it, so anything over this is treated as too long to
  // trust to a mailto: link at all -- the fallback below is used instead of
  // attempting one.
  var MAILTO_SAFE_LENGTH = 1800;

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = fallbackText.value;
      var showCopyStatus = function (msg) {
        if (!copyStatus) return;
        copyStatus.hidden = false;
        copyStatus.textContent = msg;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { showCopyStatus("Copied. Paste it into the body of an email addressed to " + BOARD_EMAIL + "."); },
          function () { fallbackText.select(); showCopyStatus("Couldn't copy automatically -- text is selected, use your device's copy command."); }
        );
      } else {
        fallbackText.select();
        showCopyStatus("Text is selected -- use your device's copy command (e.g. Ctrl/Cmd+C).");
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    var v = function (name) {
      var el = form.elements[name];
      return el ? el.value.trim() : "";
    };

    var checkedLabels = function (name) {
      var boxes = form.querySelectorAll('input[name="' + name + '"]:checked');
      return Array.prototype.map.call(boxes, function (box) {
        return box.dataset.label || box.value;
      });
    };

    var requestTypes = checkedLabels("requestType");
    var other = v("requestTypeOther");
    if (other) requestTypes.push("Other: " + other);

    var attachments = checkedLabels("attachments");

    // Plain-text email bodies can't carry real formatting (bold, color,
    // HTML), so "clean" here just means: a short banner, a divider line
    // between sections instead of running everything together, and a
    // closing line so the Board can see at a glance this came from the
    // website form rather than a forwarded/copied message.
    var RULE = "----------------------------------------";
    var lines = [];
    var section = function (title) {
      if (lines.length) lines.push("");
      lines.push(title);
      lines.push(RULE);
    };

    lines.push("ARCHITECTURAL CHANGE REQUEST");
    lines.push("Villas of Worthington HOA");

    section("OWNER & PROPERTY INFORMATION");
    lines.push("Owner Name(s): " + v("ownerName"));
    lines.push("Property Address: " + v("propertyAddress"));
    lines.push("Phone: " + v("phone"));
    lines.push("Email: " + v("email"));
    if (v("mailingAddress")) lines.push("Mailing Address (if different): " + v("mailingAddress"));

    section("TYPE OF REQUEST");
    lines.push(requestTypes.length ? requestTypes.join(", ") : "(none selected)");

    section("DESCRIPTION OF PROPOSED WORK");
    lines.push(v("description"));

    if (v("contractorName") || v("startDate") || v("endDate")) {
      section("CONTRACTOR INFORMATION");
      if (v("contractorName")) lines.push("Contractor Name: " + v("contractorName"));
      if (v("startDate")) lines.push("Estimated Start Date: " + v("startDate"));
      if (v("endDate")) lines.push("Estimated Completion Date: " + v("endDate"));
    }

    section("ATTACHMENTS THE REQUESTER PLANS TO INCLUDE");
    lines.push(attachments.length ? attachments.join(", ") : "(none noted)");

    section("OWNER CERTIFICATION");
    lines.push(
      "Requester confirmed: reviewed the Design Guidelines and Declaration " +
        "provisions applicable to this request and agrees to complete the " +
        "work as described above."
    );
    lines.push("");
    lines.push("Typed Name (serves as signature): " + v("signatureName"));
    if (v("signatureDate")) lines.push("Date: " + v("signatureDate"));

    lines.push("");
    lines.push(RULE);
    lines.push("Submitted via the Villas of Worthington HOA website's ARC Request form.");

    var subjectAddress = v("propertyAddress") || v("ownerName") || "Villas of Worthington";
    var subject = "ARC Request: " + subjectAddress;
    var body = lines.join("\n");

    // The address itself is not percent-encoded here -- it only contains
    // characters (letters, digits, @, ., -) that are already URL-safe, and
    // encoding the @ to %40 (which encodeURIComponent would do) is legal
    // per RFC 6068 but has caused real mail-handler chains -- browser ->
    // webmail redirect flows especially -- to mis-parse the recipient
    // entirely, leaving the raw, still-encoded string sitting in the "To"
    // field instead of a working address. Subject/body still need encoding
    // (they contain spaces, punctuation, and newlines mailto: requires
    // escaped).
    var mailtoUrl =
      "mailto:" + BOARD_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    // Always fill in the copy/paste fallback before attempting mailto:, so
    // it's ready regardless of whether the email app opens. Deliberately
    // does NOT include "To: <address>" as part of this text -- the address
    // is given separately, as its own mailto: link, right above. Combining
    // them invited a real failure mode: a visitor select-all-and-pastes the
    // whole block into their email's "To" field (a natural first move for
    // "copy this and send it"), and multi-line text pasted into a
    // recipient field can come out mangled/percent-encoded by the mail
    // client itself. Keeping them separate means the worst case is a
    // "Subject: ..." line landing at the top of the message body, which is
    // harmless -- not a broken recipient address.
    if (fallbackText) {
      fallbackText.value = "Subject: " + subject + "\n\n" + body;
    }

    var tooLong = mailtoUrl.length > MAILTO_SAFE_LENGTH;
    if (!tooLong) {
      window.location.href = mailtoUrl;
    }

    if (status) {
      status.hidden = false;
      status.textContent = tooLong
        ? "This request is too long for a mailto: link to carry reliably. " +
          "Use the copy/paste option below instead of waiting for an email " +
          "app to open."
        : "Your email app should now be open with this request filled in and " +
          "addressed to " + BOARD_EMAIL + ". Review it, attach any files noted " +
          "above, and click Send there. This page cannot send it for you. If " +
          "nothing opened, use the copy/paste option below instead.";
    }

    if (fallback) {
      fallback.hidden = false;
    }
  });
});
