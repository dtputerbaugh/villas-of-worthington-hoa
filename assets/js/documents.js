// Renders the Documents page list from documents/documents.json.
//
// To add a new document: drop the PDF into the /documents folder, then add
// one entry to documents/documents.json (see README.md for the exact
// steps). No HTML editing required.
document.addEventListener("DOMContentLoaded", function () {
  var list = document.getElementById("doc-list");
  if (!list) return;

  fetch("documents/documents.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load documents.json (" + res.status + ")");
      return res.json();
    })
    .then(function (docs) {
      list.innerHTML = "";
      docs.forEach(function (doc) {
        list.appendChild(renderDocItem(doc));
      });
    })
    .catch(function (err) {
      list.innerHTML =
        '<li class="doc-list-error">Documents could not be loaded right now (' +
        escapeHtml(err.message) +
        "). If you're viewing this file directly from disk, run a local server " +
        "instead (see README.md) — browsers block this kind of file loading " +
        "for pages opened with file://.</li>";
    });

  function renderDocItem(doc) {
    var li = document.createElement("li");
    li.className = "doc-item";

    var info = document.createElement("div");
    info.className = "doc-info";

    var h3 = document.createElement("h3");
    h3.textContent = doc.title;
    info.appendChild(h3);

    if (doc.note) {
      var note = document.createElement("div");
      note.className = "doc-note";
      note.textContent = doc.note;
      info.appendChild(note);
    }

    li.appendChild(info);

    if (doc.file) {
      var link = document.createElement("a");
      link.className = "btn btn-secondary";
      link.href = "documents/" + doc.file;
      link.textContent = "Download PDF";
      link.setAttribute("download", "");
      li.appendChild(link);
    } else {
      var pending = document.createElement("span");
      pending.className = "doc-status-note";
      pending.textContent = "Not yet posted";
      li.appendChild(pending);
    }

    return li;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
