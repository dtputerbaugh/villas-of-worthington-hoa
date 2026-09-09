// Renders the Meeting Minutes list from minutes/minutes.json, the same
// pattern as the Documents page. To add a set of minutes once the Board
// starts posting them: drop the PDF into /minutes and add one entry to
// minutes/minutes.json — e.g. { "title": "September 2026 Board Meeting",
// "file": "2026-09-Minutes.pdf", "note": "Approved October 2026" }.
document.addEventListener("DOMContentLoaded", function () {
  var list = document.getElementById("minutes-list");
  if (!list) return;

  fetch("minutes/minutes.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load minutes.json (" + res.status + ")");
      return res.json();
    })
    .then(function (items) {
      list.innerHTML = "";
      if (!items.length) {
        list.appendChild(renderEmptyState());
        return;
      }
      items.forEach(function (item) {
        list.appendChild(renderItem(item));
      });
    })
    .catch(function (err) {
      list.innerHTML =
        '<li class="doc-list-error">Meeting minutes could not be loaded right now (' +
        escapeHtml(err.message) +
        ").</li>";
    });

  function renderEmptyState() {
    var li = document.createElement("li");
    li.className = "doc-list-empty";
    li.innerHTML =
      "<strong>Work in progress.</strong> The Board is still setting up a " +
      "regular process for posting approved meeting minutes here. Check " +
      'back soon, or see the <a href="contact.html">Contact page</a> to ask ' +
      "about a specific meeting.";
    return li;
  }

  function renderItem(item) {
    var li = document.createElement("li");
    li.className = "doc-item";

    var info = document.createElement("div");
    info.className = "doc-info";

    var h3 = document.createElement("h3");
    h3.textContent = item.title;
    info.appendChild(h3);

    if (item.note) {
      var note = document.createElement("div");
      note.className = "doc-note";
      note.textContent = item.note;
      info.appendChild(note);
    }

    li.appendChild(info);

    if (item.file) {
      var link = document.createElement("a");
      link.className = "btn btn-secondary";
      link.href = "minutes/" + item.file;
      link.textContent = "Download PDF";
      link.setAttribute("download", "");
      li.appendChild(link);
    }

    return li;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
