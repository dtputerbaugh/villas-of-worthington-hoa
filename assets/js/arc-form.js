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

    var lines = [];
    lines.push("ARCHITECTURAL CHANGE REQUEST");
    lines.push("");
    lines.push("OWNER & PROPERTY INFORMATION");
    lines.push("Owner Name(s): " + v("ownerName"));
    lines.push("Property Address: " + v("propertyAddress"));
    lines.push("Phone: " + v("phone"));
    lines.push("Email: " + v("email"));
    if (v("mailingAddress")) lines.push("Mailing Address (if different): " + v("mailingAddress"));
    lines.push("");
    lines.push("TYPE OF REQUEST");
    lines.push(requestTypes.length ? requestTypes.join(", ") : "(none selected)");
    lines.push("");
    lines.push("DESCRIPTION OF PROPOSED WORK");
    lines.push(v("description"));
    lines.push("");

    if (v("contractorName") || v("startDate") || v("endDate")) {
      lines.push("CONTRACTOR INFORMATION");
      if (v("contractorName")) lines.push("Contractor Name: " + v("contractorName"));
      if (v("startDate")) lines.push("Estimated Start Date: " + v("startDate"));
      if (v("endDate")) lines.push("Estimated Completion Date: " + v("endDate"));
      lines.push("");
    }

    lines.push("ATTACHMENTS THE REQUESTER PLANS TO INCLUDE");
    lines.push(attachments.length ? attachments.join(", ") : "(none noted)");
    lines.push("");
    lines.push("OWNER CERTIFICATION");
    lines.push(
      "Requester confirmed: reviewed the Design Guidelines and Declaration " +
        "provisions applicable to this request and agrees to complete the " +
        "work as described above."
    );
    lines.push("Typed Name (serves as signature): " + v("signatureName"));
    lines.push("Date: " + v("signatureDate"));

    var subjectAddress = v("propertyAddress") || v("ownerName") || "Villas of Worthington";
    var subject = "ARC Request — " + subjectAddress;
    var body = lines.join("\n");

    var mailtoUrl =
      "mailto:" + encodeURIComponent(BOARD_EMAIL) +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    window.location.href = mailtoUrl;

    if (status) {
      status.hidden = false;
      status.textContent =
        "Your email app should now be open with this request filled in and " +
        "addressed to " + BOARD_EMAIL + ". Review it, attach any files noted " +
        "above, and click Send there — this page cannot send it for you.";
    }
  });
});
