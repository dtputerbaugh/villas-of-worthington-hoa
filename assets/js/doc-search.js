// Full-text search across the governing documents, from a pre-built index
// (assets/data/search-index.json). Runs entirely in the browser -- no
// server, no external service; the index is generated ahead of time from
// the real PDFs (see the "Rebuilding the document search index" note in
// README.md) whenever a searchable document changes.
document.addEventListener("DOMContentLoaded", function () {
  var input = document.getElementById("doc-search-input");
  var results = document.getElementById("doc-search-results");
  var normalList = document.getElementById("doc-list");
  if (!input || !results || !normalList) return;

  var index = null;
  var indexError = null;

  fetch("assets/data/search-index.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load search index (" + res.status + ")");
      return res.json();
    })
    .then(function (data) {
      index = data;
    })
    .catch(function (err) {
      indexError = err.message;
    });

  var debounceTimer;
  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 150);
  });

  function runSearch() {
    var query = input.value.trim();

    if (!query) {
      results.hidden = true;
      results.innerHTML = "";
      normalList.hidden = false;
      return;
    }

    normalList.hidden = true;
    results.hidden = false;

    if (indexError) {
      results.innerHTML =
        '<li class="doc-list-error">Search could not be loaded right now (' +
        escapeHtml(indexError) + ").</li>";
      return;
    }
    if (!index) {
      results.innerHTML = '<li class="doc-list-loading">Loading search index&hellip;</li>';
      return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var scored = [];
    for (var i = 0; i < index.length; i++) {
      var chunk = index[i];
      var haystack = (chunk.heading + " " + chunk.text).toLowerCase();
      var score = 0;
      var allPresent = true;
      for (var w = 0; w < words.length; w++) {
        var count = countOccurrences(haystack, words[w]);
        if (count === 0) {
          allPresent = false;
          break;
        }
        score += count;
      }
      if (allPresent) scored.push({ chunk: chunk, score: score });
    }

    scored.sort(function (a, b) {
      return b.score - a.score || a.chunk.text.length - b.chunk.text.length;
    });

    var top = scored.slice(0, 25);

    if (top.length === 0) {
      results.innerHTML =
        '<li class="doc-list-empty">No matches for &ldquo;' + escapeHtml(query) +
        '&rdquo;. Try fewer or different words &mdash; e.g. "fence" instead of ' +
        '"fence height rules."</li>';
      return;
    }

    results.innerHTML = "";
    top.forEach(function (item) {
      results.appendChild(renderResult(item.chunk, words));
    });
  }

  function renderResult(chunk, words) {
    var li = document.createElement("li");
    li.className = "search-result";

    var docLine = document.createElement("div");
    docLine.className = "search-result-doc";
    docLine.textContent = chunk.doc + (chunk.section ? " · §" + chunk.section : "");
    li.appendChild(docLine);

    var heading = document.createElement("div");
    heading.className = "search-result-heading";
    heading.textContent = chunk.heading;
    li.appendChild(heading);

    var snippet = document.createElement("p");
    snippet.className = "search-result-snippet";
    snippet.appendChild(buildSnippet(chunk.text, words));
    li.appendChild(snippet);

    if (chunk.file) {
      var link = document.createElement("a");
      link.className = "search-result-link";
      link.href = "documents/" + chunk.file + (chunk.page ? "#page=" + chunk.page : "");
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent =
        "View in " + chunk.doc + (chunk.page ? " (page " + chunk.page + ")" : "") + " →";
      li.appendChild(link);
    }

    return li;
  }

  // Builds a ~200-character window of text around the first match, with
  // matched query words wrapped in <mark> -- built as real DOM nodes
  // (never innerHTML on document text) so nothing in a PDF's text can be
  // interpreted as markup.
  function buildSnippet(text, words) {
    var frag = document.createDocumentFragment();
    var lower = text.toLowerCase();
    var firstIndex = -1;
    for (var w = 0; w < words.length; w++) {
      var idx = lower.indexOf(words[w]);
      if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) firstIndex = idx;
    }
    if (firstIndex === -1) firstIndex = 0;

    var windowStart = Math.max(0, firstIndex - 80);
    var windowEnd = Math.min(text.length, firstIndex + 160);
    var snippetText = text.slice(windowStart, windowEnd);
    var prefix = windowStart > 0 ? "…" : "";
    var suffix = windowEnd < text.length ? "…" : "";

    var wordPattern = words
      .map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); })
      .join("|");
    var re = new RegExp("(" + wordPattern + ")", "ig");

    frag.appendChild(document.createTextNode(prefix));
    var lastEnd = 0;
    var match;
    while ((match = re.exec(snippetText)) !== null) {
      frag.appendChild(document.createTextNode(snippetText.slice(lastEnd, match.index)));
      var mark = document.createElement("mark");
      mark.textContent = match[0];
      frag.appendChild(mark);
      lastEnd = match.index + match[0].length;
    }
    frag.appendChild(document.createTextNode(snippetText.slice(lastEnd) + suffix));
    return frag;
  }

  function countOccurrences(haystack, needle) {
    if (!needle) return 0;
    var count = 0;
    var pos = 0;
    while ((pos = haystack.indexOf(needle, pos)) !== -1) {
      count++;
      pos += needle.length;
    }
    return count;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
