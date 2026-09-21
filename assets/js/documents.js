// Refreshes the Documents page list from documents/documents.json.
//
// documents.html already ships with this exact list as real, static HTML
// (see the comment there) -- so JavaScript is an enhancement here, not a
// requirement. On a successful fetch, this replaces that static content
// with a freshly-built version (so a documents.json change takes effect
// immediately for JS-enabled visitors, even before someone regenerates
// the static block). On failure, it deliberately leaves the existing
// content alone rather than replacing working content with an error --
// only logs to the console, for anyone debugging.
//
// To add a new document: drop the PDF into the /documents folder, then add
// one entry to documents/documents.json (see README.md for the exact
// steps, including regenerating the static list in documents.html). Set
// "category" to one of the existing category names to group it with
// similar documents, or a new name to start a new group -- groups are
// shown in the order their first document appears in the file.
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
      console.error("Documents page: could not refresh the list from documents.json; showing the static version already on the page instead.", err);
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
});
