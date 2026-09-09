// Renders the two stacked-bar charts and the reserve-funding line chart on
// the Finances page. Figures and sourcing are documented in finances.html
// next to each chart; this file only draws them.
document.addEventListener("DOMContentLoaded", function () {
  var SERIES = [
    "var(--series-1)",
    "var(--series-2)",
    "var(--series-3)",
    "var(--series-4)",
    "var(--series-5)",
    "var(--series-6)",
    "var(--series-7)",
  ];

  var UNIT_COUNT = 114;

  // 2025 actual operating spending, grouped into resident-readable
  // categories, plus the small surplus the Association didn't spend.
  // Source: Board's 2025 actuals (from the 2026 budget analysis).
  // Spending categories total $44,305; the unspent line brings the total
  // up to the full $45,600 in 2025 assessment income -- $400.00 per unit
  // exactly, which is what makes the "per homeowner" toggle add up clean.
  var duesBreakdown = [
    { label: "Landscaping, grounds & snow", short: "Landscaping & grounds", value: 16618 },
    { label: "Reserve contribution", short: "Reserve contribution", value: 10207 },
    { label: "Management (2025, being phased out)", short: "Management (2025)", value: 7800 },
    { label: "Legal & professional", short: "Legal & professional", value: 3215 },
    { label: "Insurance", short: "Insurance", value: 2525 },
    { label: "Administrative & other", short: "Admin & other", value: 2221 },
    { label: "Utilities", short: "Utilities", value: 1719 },
    { label: "Unspent (retained)", short: "Unspent (retained)", value: 1295, neutral: true },
  ];

  // Reserve component replacement cost, from the 2025 Reserve Study
  // component inventory -- with the Fountain System ($500) removed; the
  // Association does not own that fountain. (Its removal shifts these
  // percentages by well under half a point; it's excluded on principle,
  // not because the dollar amount matters here.)
  var reserveAllocation = [
    { label: "Ponds", value: 130000 },
    { label: "Mailbox units", value: 21600 },
    { label: "Paved trail", value: 15400 },
    { label: "Property fencing", value: 13100 },
    { label: "Entry feature & signs", value: 6500 },
    { label: "Reserve study updates", value: 660 },
  ];

  // % funded, 2025-2030, from the Board's reserve funding workbook
  // (which follows the 2025 Reserve Study's contribution schedule and
  // uses a 3% assumed return on invested reserves -- the workbook's own
  // figure, used here instead of the professional study's more
  // conservative 0.25% return assumption used for its own projections).
  var pctFunded = [
    { year: 2025, pct: 50.8 },
    { year: 2026, pct: 58.2 },
    { year: 2027, pct: 66.5 },
    { year: 2028, pct: 75.1 },
    { year: 2029, pct: 84.2 },
    { year: 2030, pct: 94.2 },
  ];

  // Anticipated reserve expenditures by year, 2025-2039, from the 2025
  // Reserve Study's 30-year component schedule. Stops at 2039 (the
  // mailbox replacement) rather than running the full 30 years because
  // the 2042 pond replacement (~$214,870) would flatten every other
  // year's bar to near-invisible on the same scale -- it's called out
  // separately in the page copy instead.
  var reserveExpenditures = [
    { year: 2025, value: 0 },
    { year: 2026, value: 1545 },
    { year: 2027, value: 530 },
    { year: 2028, value: 721 },
    { year: 2029, value: 563 },
    { year: 2030, value: 0 },
    { year: 2031, value: 788 },
    { year: 2032, value: 0 },
    { year: 2033, value: 633 },
    { year: 2034, value: 10256, notable: true },
    { year: 2035, value: 0 },
    { year: 2036, value: 0 },
    { year: 2037, value: 941 },
    { year: 2038, value: 2203 },
    { year: 2039, value: 34185, notable: true },
  ];

  setupDuesSankey();
  renderStackedBar("reserve-bar", "reserve-legend", "reserve-table", reserveAllocation, "$");

  // The line and bar charts below draw their axis/value text at a fixed
  // pixel size *in SVG units*, so if the SVG were a fixed-width viewBox
  // stretched to fit a narrow phone via CSS, that text would shrink right
  // along with it -- fine on desktop, close to unreadable on mobile.
  // Measuring the real container width and redrawing at that exact pixel
  // width keeps every label at its designed size on any screen.
  drawResponsive("pct-funded-chart", function (w) {
    renderLineChart("pct-funded-chart", pctFunded, w);
  });
  drawResponsive("expenditures-chart", function (w) {
    renderYearBarChart("expenditures-chart", "expenditures-table", reserveExpenditures, w);
  });

  function drawResponsive(containerId, draw) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var lastWidth = 0;
    function redraw() {
      var w = Math.round(el.clientWidth);
      if (!w || Math.abs(w - lastWidth) < 8) return;
      lastWidth = w;
      draw(w);
    }
    redraw();
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(redraw, 150);
    });
  }

  // Wires up the HOA Total / Per Homeowner toggle above the dues Sankey,
  // then draws it in whichever mode is currently active.
  function setupDuesSankey() {
    var totalBtn = document.getElementById("dues-toggle-total");
    var unitBtn = document.getElementById("dues-toggle-unit");
    var mode = "total";

    function draw() {
      if (mode === "unit") {
        var perUnitData = duesBreakdown.map(function (d) {
          return Object.assign({}, d, { value: d.value / UNIT_COUNT });
        });
        renderSankey(
          "dues-sankey", "dues-sankey-caption", "dues-legend", "dues-table",
          perUnitData, "$", 400, "Per homeowner, 2025", 2
        );
      } else {
        renderSankey(
          "dues-sankey", "dues-sankey-caption", "dues-legend", "dues-table",
          duesBreakdown, "$", 45600, "Association-wide, 2025", 0
        );
      }
    }

    if (totalBtn && unitBtn) {
      totalBtn.addEventListener("click", function () {
        mode = "total";
        totalBtn.classList.add("is-active");
        unitBtn.classList.remove("is-active");
        draw();
      });
      unitBtn.addEventListener("click", function () {
        mode = "unit";
        unitBtn.classList.add("is-active");
        totalBtn.classList.remove("is-active");
        draw();
      });
    }

    draw();
  }

  // A single-source flow diagram: one bar (total dues) fans out into a
  // ribbon per category. Deliberately carries no text of its own -- the
  // ribbons only need to stay visually distinct, which holds up fine
  // scaled to any width, so the diagram can be fully responsive. Labels,
  // amounts and percentages live in the HTML legend below instead, which
  // is what actually needs to stay legible on a narrow phone.
  function renderSankey(containerId, captionId, legendId, tableId, data, prefix, total, sourceLabel, decimals) {
    var el = document.getElementById(containerId);
    var caption = document.getElementById(captionId);
    var legend = document.getElementById(legendId);
    var table = document.getElementById(tableId);
    if (!el) return;

    total = total || data.reduce(function (sum, d) { return sum + d.value; }, 0);

    if (caption) {
      caption.textContent = sourceLabel + " — " + formatMoney(total, prefix, decimals) + " total";
    }

    var width = 560;
    var height = 220;
    var padTop = 14;
    var padBottom = 14;
    var H = height - padTop - padBottom;

    var srcX = 14;
    var nodeW = 14;
    var destX = 520;
    var midX = (srcX + nodeW + destX) / 2;

    var gap = 6;
    var usableH = H - gap * (data.length - 1);

    // Destination node positions (stacked with gaps), and matching
    // contiguous source-side slice (the source bar has no gaps).
    var destTop = padTop;
    var srcCum = 0;
    var colorIndex = 0;
    var nodes = data.map(function (d) {
      var destH = (d.value / total) * usableH;
      var srcH = (d.value / total) * H;
      var color = d.neutral ? "var(--line)" : SERIES[colorIndex++ % SERIES.length];
      var node = {
        d: d,
        color: color,
        destY0: destTop,
        destY1: destTop + destH,
        srcY0: padTop + srcCum,
        srcY1: padTop + srcCum + srcH,
      };
      destTop += destH + gap;
      srcCum += srcH;
      return node;
    });

    var ribbons = nodes
      .map(function (n) {
        var d =
          "M" + (srcX + nodeW) + "," + n.srcY0.toFixed(1) +
          " C" + midX.toFixed(1) + "," + n.srcY0.toFixed(1) +
          " " + midX.toFixed(1) + "," + n.destY0.toFixed(1) +
          " " + destX + "," + n.destY0.toFixed(1) +
          " L" + destX + "," + n.destY1.toFixed(1) +
          " C" + midX.toFixed(1) + "," + n.destY1.toFixed(1) +
          " " + midX.toFixed(1) + "," + n.srcY1.toFixed(1) +
          " " + (srcX + nodeW) + "," + n.srcY1.toFixed(1) +
          " Z";
        var pct = ((n.d.value / total) * 100).toFixed(1);
        var title = n.d.label + ": " + formatMoney(n.d.value, prefix, decimals) + " (" + pct + "%)";
        var dash = n.d.neutral ? ' stroke-dasharray="5 3" stroke="var(--ink-soft)" stroke-width="1"' : "";
        return (
          '<path class="sankey-ribbon" d="' + d + '" fill="' + n.color + '"' + dash + "><title>" +
          escapeHtml(title) + "</title></path>"
        );
      })
      .join("");

    var destNodes = nodes
      .map(function (n) {
        return (
          '<rect class="sankey-dest-node" x="' + destX + '" y="' + n.destY0.toFixed(1) +
          '" width="' + nodeW + '" height="' + Math.max(n.destY1 - n.destY0, 1).toFixed(1) +
          '" fill="' + n.color + '"></rect>'
        );
      })
      .join("");

    var sourceNode =
      '<rect class="sankey-source-node" x="' + srcX + '" y="' + padTop +
      '" width="' + nodeW + '" height="' + H + '"></rect>';

    el.innerHTML =
      '<svg class="sankey" viewBox="0 0 ' + width + " " + height +
      '" role="img" aria-label="Flow diagram of 2025 HOA dues spending by category; full figures are in the legend and table below.">' +
      ribbons + sourceNode + destNodes + "</svg>";

    if (legend) {
      legend.innerHTML = "";
      nodes.forEach(function (n) {
        var pct = ((n.d.value / total) * 100).toFixed(1);
        var li = document.createElement("li");
        var swatch = document.createElement("span");
        swatch.className = "swatch";
        swatch.style.background = n.color;
        var labelSpan = document.createElement("span");
        labelSpan.className = "legend-label";
        labelSpan.textContent = n.d.label;
        var valueSpan = document.createElement("span");
        valueSpan.className = "legend-value";
        valueSpan.textContent = formatMoney(n.d.value, prefix, decimals) + " · " + pct + "%";
        li.appendChild(swatch);
        li.appendChild(labelSpan);
        li.appendChild(valueSpan);
        legend.appendChild(li);
      });
    }

    if (table) {
      var rows = data
        .map(function (d) {
          var pct = ((d.value / total) * 100).toFixed(1);
          return (
            "<tr><td>" + escapeHtml(d.label) + "</td><td>" +
            formatMoney(d.value, prefix, decimals) + "</td><td>" + pct + "%</td></tr>"
          );
        })
        .join("");
      table.innerHTML =
        "<thead><tr><th>Category</th><th>Amount</th><th>Share</th></tr></thead><tbody>" +
        rows + "</tbody>";
    }
  }

  function renderStackedBar(barId, legendId, tableId, data, prefix) {
    var bar = document.getElementById(barId);
    var legend = document.getElementById(legendId);
    var table = document.getElementById(tableId);
    if (!bar || !legend) return;

    var total = data.reduce(function (sum, d) {
      return sum + d.value;
    }, 0);

    bar.innerHTML = "";
    legend.innerHTML = "";
    var tableRows = "";

    data.forEach(function (d, i) {
      var pct = (d.value / total) * 100;
      var color = SERIES[i % SERIES.length];

      var seg = document.createElement("div");
      seg.className = "bar-segment";
      seg.style.flexBasis = pct + "%";
      seg.style.background = color;
      seg.title = d.label + ": " + formatMoney(d.value, prefix) + " (" + pct.toFixed(1) + "%)";
      if (pct >= 9) {
        var label = document.createElement("span");
        label.className = "segment-label";
        label.textContent = pct.toFixed(0) + "%";
        seg.appendChild(label);
      }
      bar.appendChild(seg);

      var li = document.createElement("li");
      var swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = color;
      var labelSpan = document.createElement("span");
      labelSpan.className = "legend-label";
      labelSpan.textContent = d.label;
      var valueSpan = document.createElement("span");
      valueSpan.className = "legend-value";
      valueSpan.textContent = formatMoney(d.value, prefix) + " · " + pct.toFixed(1) + "%";
      li.appendChild(swatch);
      li.appendChild(labelSpan);
      li.appendChild(valueSpan);
      legend.appendChild(li);

      tableRows +=
        "<tr><td>" + escapeHtml(d.label) + "</td><td>" +
        formatMoney(d.value, prefix) + "</td><td>" + pct.toFixed(1) + "%</td></tr>";
    });

    if (table) {
      table.innerHTML =
        "<thead><tr><th>Category</th><th>Amount</th><th>Share</th></tr></thead><tbody>" +
        tableRows + "</tbody>";
    }
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderLineChart(containerId, points, width) {
    var el = document.getElementById(containerId);
    if (!el) return;

    width = width || 640;
    var height = 260;
    var padLeft = 44;
    var padRight = 16;
    var padTop = 16;
    var padBottom = 32;
    var plotW = width - padLeft - padRight;
    var plotH = height - padTop - padBottom;

    var maxPct = 110; // fixed ceiling so the 100% reference line has headroom
    var minPct = 0;

    function x(i) {
      return padLeft + (i / (points.length - 1)) * plotW;
    }
    function y(pct) {
      return padTop + plotH - ((pct - minPct) / (maxPct - minPct)) * plotH;
    }

    var linePath = points
      .map(function (p, i) {
        return (i === 0 ? "M" : "L") + x(i).toFixed(1) + "," + y(p.pct).toFixed(1);
      })
      .join(" ");

    var areaPath =
      linePath +
      " L" + x(points.length - 1).toFixed(1) + "," + y(0).toFixed(1) +
      " L" + x(0).toFixed(1) + "," + y(0).toFixed(1) + " Z";

    var gridLines = [0, 25, 50, 75, 100]
      .map(function (v) {
        return (
          '<line class="grid-line" x1="' + padLeft + '" x2="' + (width - padRight) +
          '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"></line>' +
          '<text x="' + (padLeft - 8) + '" y="' + y(v).toFixed(1) + '" text-anchor="end" dominant-baseline="middle" font-size="11">' + v + "%</text>"
        );
      })
      .join("");

    var refLine =
      '<line class="ref-line" x1="' + padLeft + '" x2="' + (width - padRight) +
      '" y1="' + y(100).toFixed(1) + '" y2="' + y(100).toFixed(1) + '"></line>' +
      '<text x="' + padLeft + '" y="' + (y(100) - 6).toFixed(1) + '" text-anchor="start" font-size="11" font-weight="600">Fully funded</text>';

    var xLabels = points
      .map(function (p, i) {
        return (
          '<text x="' + x(i).toFixed(1) + '" y="' + (height - padBottom + 18) +
          '" text-anchor="middle" font-size="11">' + p.year + "</text>"
        );
      })
      .join("");

    var dots = points
      .map(function (p, i) {
        var isLast = i === points.length - 1;
        var r = isLast ? 5 : 4;
        var title = p.year + ": " + p.pct.toFixed(1) + "% funded";
        return (
          '<circle class="end-dot" cx="' + x(i).toFixed(1) + '" cy="' + y(p.pct).toFixed(1) +
          '" r="' + r + '"><title>' + title + "</title></circle>"
        );
      })
      .join("");

    var lastPoint = points[points.length - 1];
    var endLabel =
      '<text x="' + x(points.length - 1).toFixed(1) + '" y="' + (y(lastPoint.pct) - 12).toFixed(1) +
      '" text-anchor="end" font-size="12" font-weight="700" fill="var(--ink)">' +
      lastPoint.pct.toFixed(0) + "%</text>";

    el.innerHTML =
      '<svg class="line-chart" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="Percent of reserve funding target met, 2025 through 2030, rising from about 51% to about 94%.">' +
      gridLines +
      refLine +
      '<path class="area-fill" d="' + areaPath + '"></path>' +
      '<path class="trend-line" d="' + linePath + '"></path>' +
      dots +
      endLabel +
      xLabels +
      "</svg>";
  }

  // A column-per-year bar chart for a magnitude that's mostly small with
  // occasional spikes (reserve expenditures). Direct-labels only the
  // notable (tallest) bars per the "label the extreme, not every point"
  // rule -- the rest are covered by the table view and a hover title.
  function renderYearBarChart(containerId, tableId, points, width) {
    var el = document.getElementById(containerId);
    var table = document.getElementById(tableId);
    if (!el) return;

    width = width || 640;
    var height = 260;
    var padLeft = 50;
    var padRight = 16;
    var padTop = 36;
    var padBottom = 32;
    var plotW = width - padLeft - padRight;
    var plotH = height - padTop - padBottom;

    var maxVal = Math.max.apply(null, points.map(function (p) { return p.value; }));
    var niceMax = Math.ceil((maxVal * 1.15) / 10000) * 10000 || 10000;

    var slot = plotW / points.length;
    var barW = Math.min(24, slot * 0.6);

    function y(v) {
      return padTop + plotH - (v / niceMax) * plotH;
    }

    var ticks = [];
    for (var t = 0; t <= niceMax; t += niceMax / 4) ticks.push(t);

    var gridLines = ticks
      .map(function (v) {
        return (
          '<line class="grid-line" x1="' + padLeft + '" x2="' + (width - padRight) +
          '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"></line>' +
          '<text x="' + (padLeft - 8) + '" y="' + y(v).toFixed(1) + '" text-anchor="end" dominant-baseline="middle" font-size="11">' +
          formatCompactMoney(v) + "</text>"
        );
      })
      .join("");

    var bars = points
      .map(function (p, i) {
        var cx = padLeft + slot * i + slot / 2;
        var barX = cx - barW / 2;
        var barY = y(p.value);
        var barH = Math.max(padTop + plotH - barY, p.value > 0 ? 2 : 0);
        var cls = "year-bar" + (p.notable ? " is-notable" : "");
        var title = p.year + ": " + formatMoney(p.value, "$");
        var label = p.notable
          ? '<text class="bar-value-label" x="' + cx.toFixed(1) + '" y="' + (barY - 8).toFixed(1) +
            '" text-anchor="middle" font-size="11">' + formatMoney(p.value, "$") + "</text>"
          : "";
        return (
          '<rect class="' + cls + '" x="' + barX.toFixed(1) + '" y="' + barY.toFixed(1) +
          '" width="' + barW.toFixed(1) + '" height="' + barH.toFixed(1) + '" rx="3"><title>' +
          escapeHtml(title) + "</title></rect>" + label
        );
      })
      .join("");

    // At narrow widths there isn't room for a 4-digit label under every
    // bar. Always keep the first, last, and any notable/labeled bars;
    // fill in additional evenly-spaced labels only where they don't
    // collide with those (rather than a plain "every Nth" step, which
    // can still land a regular label right next to a notable one).
    var minLabelSlot = 26;
    var cxOf = function (i) { return padLeft + slot * i + slot / 2; };
    var shown = {};
    var shownX = [];
    points.forEach(function (p, i) {
      if (i === 0 || i === points.length - 1 || p.notable) {
        shown[i] = true;
        shownX.push(cxOf(i));
      }
    });
    points.forEach(function (p, i) {
      if (shown[i]) return;
      var cx = cxOf(i);
      var collides = shownX.some(function (x) { return Math.abs(x - cx) < minLabelSlot; });
      if (!collides) {
        shown[i] = true;
        shownX.push(cx);
      }
    });

    var xLabels = points
      .map(function (p, i) {
        if (!shown[i]) return "";
        return (
          '<text x="' + cxOf(i).toFixed(1) + '" y="' + (height - padBottom + 18) +
          '" text-anchor="middle" font-size="10.5">' + p.year + "</text>"
        );
      })
      .join("");

    var baseline =
      '<line class="baseline" x1="' + padLeft + '" x2="' + (width - padRight) +
      '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '"></line>';

    el.innerHTML =
      '<svg class="year-bar-chart" viewBox="0 0 ' + width + " " + height +
      '" role="img" aria-label="Anticipated reserve expenditures by year, 2025 through 2039; full figures are in the table below.">' +
      gridLines + baseline + bars + xLabels + "</svg>";

    if (table) {
      var rows = points
        .map(function (p) {
          return "<tr><td>" + p.year + "</td><td>" + formatMoney(p.value, "$") + "</td></tr>";
        })
        .join("");
      table.innerHTML =
        "<thead><tr><th>Year</th><th>Anticipated Expenditure</th></tr></thead><tbody>" +
        rows + "</tbody>";
    }
  }

  function formatCompactMoney(n) {
    if (n === 0) return "$0";
    return "$" + (n / 1000).toLocaleString("en-US") + "K";
  }

  function formatMoney(n, prefix, decimals) {
    var opts = decimals
      ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
      : { maximumFractionDigits: 0 };
    return (prefix || "") + n.toLocaleString("en-US", opts);
  }
});
