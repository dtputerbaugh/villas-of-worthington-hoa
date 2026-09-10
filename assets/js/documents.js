// Renders the Documents page list from documents/documents.json, grouped
// into categories.
//
// To add a new document: drop the PDF into the /documents folder, then add
// one entry to documents/documents.json (see README.md for the exact
// steps). Set "category" to one of the existing category names to group it
// with similar documents, or a new name to start a new group -- groups are
// shown in the order their first document appears in the file. No HTML
// editing required.
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
      groupByCategory(docs).forEach(function (group) {
        list.appendChild(renderCategoryHeading(group.category));
        group.docs.forEach(function (doc) {
          list.appendChild(renderDocItem(doc));
        });
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

  // Groups documents by their "category" field, preserving the order each
  // category first appears in the source file (uncategorized documents,
  // if any, land in a trailing "Other Documents" group).
  function groupByCategory(docs) {
    var order = [];
    var byCategory = {};
    docs.forEach(function (doc) {
      var cat = doc.category || "Other Documents";
      if (!byCategory[cat]) {
        byCategory[cat] = [];
        order.push(cat);
      }
      byCategory[cat].push(doc);
    });
    return order.map(function (cat) {
      return { category: cat, docs: byCategory[cat] };
    });
  }

  function renderCategoryHeading(category) {
    var li = document.createElement("li");
    li.className = "doc-category-heading";
    var h2 = document.createElement("h2");
    h2.textContent = category;
    li.appendChild(h2);
    return li;
  }

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
