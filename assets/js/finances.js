// Renders the charts on the Finances page. Figures and sourcing are
// documented in finances.html next to each chart; this file only draws
// them. All dollar figures below are sourced from the Association's actual
// year-end financial statements (2019-2025) and 2026 year-to-date report,
// prepared by Associated Property Management (APM), plus the 2025 Reserve
// Study -- not budget estimates. See the disclosure note at the bottom of
// the page for corrections made against earlier, less complete figures.
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
  // categories. Source: the Association's actual full-year 2025 Budget
  // Comparison Report (APM). Total spending ($45,872) slightly exceeded
  // 2025 assessment income ($45,600) -- covered by the year's other small
  // income (late fees, a legal-fee reimbursement, interest), not by an
  // unspent surplus, so there's no "retained" category this time.
  var duesBreakdown = [
    { label: "Landscaping, grounds & snow", short: "Landscaping & grounds", value: 17499 },
    { label: "Reserve contribution", short: "Reserve contribution", value: 10207 },
    { label: "Management (2025, being phased out)", short: "Management (2025)", value: 7975 },
    { label: "Legal & professional", short: "Legal & professional", value: 3215 },
    { label: "Insurance", short: "Insurance", value: 2525 },
    { label: "Administrative & other", short: "Admin & other", value: 2731 },
    { label: "Utilities", short: "Utilities", value: 1719 },
  ];

  // 2019-2025 actual full-year spending, rolled into 3 categories so the
  // trend reads cleanly. Source: the Association's year-end Budget
  // Comparison Reports (APM), 2019 through 2025. 2026 is excluded -- it's
  // only a partial year (through June) so far.
  var TREND_CATEGORIES = ["Landscaping & grounds", "Reserve contribution", "Admin, insurance & utilities"];
  var spendingTrend = [
    { year: 2019, items: [{ cat: "Landscaping & grounds", value: 29120 }, { cat: "Reserve contribution", value: 3319 }, { cat: "Admin, insurance & utilities", value: 15536 }], notable: true },
    { year: 2020, items: [{ cat: "Landscaping & grounds", value: 26523 }, { cat: "Reserve contribution", value: 4500 }, { cat: "Admin, insurance & utilities", value: 16326 }] },
    { year: 2021, items: [{ cat: "Landscaping & grounds", value: 23030 }, { cat: "Reserve contribution", value: 4125 }, { cat: "Admin, insurance & utilities", value: 17836 }] },
    { year: 2022, items: [{ cat: "Landscaping & grounds", value: 25508 }, { cat: "Reserve contribution", value: 4500 }, { cat: "Admin, insurance & utilities", value: 16597 }] },
    { year: 2023, items: [{ cat: "Landscaping & grounds", value: 24035 }, { cat: "Reserve contribution", value: 4970 }, { cat: "Admin, insurance & utilities", value: 17924 }] },
    { year: 2024, items: [{ cat: "Landscaping & grounds", value: 16499 }, { cat: "Reserve contribution", value: 19882 }, { cat: "Admin, insurance & utilities", value: 22208 }], notable: true },
    { year: 2025, items: [{ cat: "Landscaping & grounds", value: 17499 }, { cat: "Reserve contribution", value: 10207 }, { cat: "Admin, insurance & utilities", value: 18166 }], notable: true },
  ];

  // Reserve component replacement cost, from the 2025 Reserve Study
  // component inventory -- with the Fountain System ($500) removed; the
  // Association does not own that fountain. (Its removal shifts these
  // percentages by well under half a point; it's excluded on principle,
  // not because the dollar amount matters here.) Category order/colors are
  // shared with the expenditures-by-year chart below, so the same color
  // always means the same reserve component on this page.
  var RESERVE_CATEGORIES = ["Ponds", "Mailbox units", "Paved trail", "Property fencing", "Entry feature & signs", "Reserve study updates"];
  var reserveAllocation = [
    { label: "Ponds", value: 130000 },
    { label: "Mailbox units", value: 21600 },
    { label: "Paved trail", value: 15400 },
    { label: "Property fencing", value: 13100 },
    { label: "Entry feature & signs", value: 6500 },
    { label: "Reserve study updates", value: 660 },
  ];

  // Actual reserve fund balance (cash + CD, fountain aside) at each
  // year-end, 2019-2025, from the Association's actual Balance Sheets
  // (APM), plus a mid-2026 point (as of June 30, the most recent
  // statement available -- not a year-end total, flagged as such in the
  // page copy). Continues as a projection, 2026-2030, using the 2025
  // Reserve Study's own year-end cash-flow figures (Exhibit A) -- a
  // different, more conservative 0.25%-return model than the Board's own
  // workbook used for the percent-funded chart below, so the dollar
  // figures here and that chart's percentages won't reconcile exactly.
  var reserveBalanceActual = [
    { year: 2019, value: 19626 },
    { year: 2020, value: 35430 },
    { year: 2021, value: 39593 },
    { year: 2022, value: 44140 },
    { year: 2023, value: 49110 },
    { year: 2024, value: 68992 },
    { year: 2025, value: 78099 },
    { year: 2026, value: 89238, partial: true },
  ];
  var reserveBalanceProjected = [
    { year: 2026, value: 89238 },
    { year: 2027, value: 93369 },
    { year: 2028, value: 103545 },
    { year: 2029, value: 114119 },
    { year: 2030, value: 125500 },
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

  // Anticipated reserve expenditures BY CATEGORY, 2025-2039, read directly
  // off the 2025 Reserve Study's Exhibit B component-by-component schedule
  // (fountain excluded, per above). This corrects several errors in an
  // earlier version of this chart: 2027 ($530) and 2032 ($615) were both
  // entirely the excluded fountain line and should have been $0; 2033 had
  // no real expenditure ($0, not $633); 2036's $2,076 entry-feature
  // replacement was missing entirely; 2037 was undercounted by $713; 2038
  // had no real expenditure ($0, not $2,203); 2039 was $32,672, not
  // $34,185. Stops at 2039 (the mailbox replacement) rather than running
  // the full 30 years because the 2042 pond replacement (~$214,870) would
  // flatten every other year's bar to near-invisible on the same scale --
  // it's called out separately in the page copy instead.
  var reserveExpenditures = [
    { year: 2025, items: [] },
    { year: 2026, items: [{ cat: "Entry feature & signs", value: 1545 }] },
    { year: 2027, items: [] },
    { year: 2028, items: [{ cat: "Reserve study updates", value: 721 }] },
    { year: 2029, items: [{ cat: "Property fencing", value: 563 }] },
    { year: 2030, items: [] },
    { year: 2031, items: [{ cat: "Reserve study updates", value: 788 }] },
    { year: 2032, items: [] },
    { year: 2033, items: [] },
    { year: 2034, items: [{ cat: "Property fencing", value: 9394 }, { cat: "Reserve study updates", value: 861 }], notable: true },
    { year: 2035, items: [] },
    { year: 2036, items: [{ cat: "Entry feature & signs", value: 2076 }] },
    { year: 2037, items: [{ cat: "Property fencing", value: 713 }, { cat: "Reserve study updates", value: 941 }] },
    { year: 2038, items: [] },
    { year: 2039, items: [{ cat: "Mailbox units", value: 32672 }], notable: true },
  ];

  setupDuesSankey();
  renderStackedBar("reserve-bar", "reserve-legend", "reserve-table", reserveAllocation, "$");
  renderCategoryLegend("expenditures-legend", reserveExpenditures, RESERVE_CATEGORIES, "$");
  renderCategoryLegend("spending-trend-legend", spendingTrend, TREND_CATEGORIES, "$");

  // The line and bar charts below draw their axis/value text at a fixed
  // pixel size *in SVG units*, so if the SVG were a fixed-width viewBox
  // stretched to fit a narrow phone via CSS, that text would shrink right
  // along with it -- fine on desktop, close to unreadable on mobile.
  // Measuring the real container width and redrawing at that exact pixel
  // width keeps every label at its designed size on any screen.
  drawResponsive("reserve-trend-chart", function (w) {
    renderReserveTrendChart("reserve-trend-chart", reserveBalanceActual, reserveBalanceProjected, w);
  });
  drawResponsive("pct-funded-chart", function (w) {
    renderLineChart("pct-funded-chart", pctFunded, w);
  });
  drawResponsive("expenditures-chart", function (w) {
    renderStackedYearBarChart("expenditures-chart", "expenditures-table", reserveExpenditures, RESERVE_CATEGORIES, "$", w);
  });
  drawResponsive("spending-trend-chart", function (w) {
    renderStackedYearBarChart("spending-trend-chart", "spending-trend-table", spendingTrend, TREND_CATEGORIES, "$", w);
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
          perUnitData, "$", null, "Per homeowner, 2025", 2
        );
      } else {
        renderSankey(
          "dues-sankey", "dues-sankey-caption", "dues-legend", "dues-table",
          duesBreakdown, "$", null, "Association-wide, 2025", 0
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

  // Builds a swatch/label/value legend for a stacked year-bar chart
  // (renderStackedYearBarChart below), summarizing each category's total
  // and share across every year shown. A category that never appears in
  // this particular dataset (e.g. "Ponds" isn't due until 2042, past this
  // chart's 2039 cutoff) is left out of its legend rather than shown at
  // $0 · 0.0%.
  function renderCategoryLegend(legendId, points, categories, prefix) {
    var legend = document.getElementById(legendId);
    if (!legend) return;

    var totals = {};
    var grand = 0;
    points.forEach(function (p) {
      p.items.forEach(function (it) {
        totals[it.cat] = (totals[it.cat] || 0) + it.value;
        grand += it.value;
      });
    });

    legend.innerHTML = "";
    categories.forEach(function (cat, i) {
      var val = totals[cat];
      if (!val) return;
      var color = SERIES[i % SERIES.length];
      var pct = grand ? ((val / grand) * 100).toFixed(1) : "0.0";
      var li = document.createElement("li");
      var swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = color;
      var labelSpan = document.createElement("span");
      labelSpan.className = "legend-label";
      labelSpan.textContent = cat;
      var valueSpan = document.createElement("span");
      valueSpan.className = "legend-value";
      valueSpan.textContent = formatMoney(val, prefix) + " · " + pct + "%";
      li.appendChild(swatch);
      li.appendChild(labelSpan);
      li.appendChild(valueSpan);
      legend.appendChild(li);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Actual reserve balance (solid line + area, 2019 through mid-2026),
  // continuing as a dashed projection (2026-2030, per the Reserve Study's
  // own cash-flow model) sharing the same starting point so the two
  // segments join without a gap. Only the first point, the most recent
  // actual point, and the final projected point get a direct $ label,
  // per "label the extreme, not every point" -- every point still carries
  // a hover title.
  function renderReserveTrendChart(containerId, actualPoints, projectedPoints, width) {
    var el = document.getElementById(containerId);
    if (!el) return;

    width = width || 640;
    var height = 260;
    var padLeft = 50;
    var padRight = 16;
    var padTop = 28;
    var padBottom = 32;
    var plotW = width - padLeft - padRight;
    var plotH = height - padTop - padBottom;

    var years = actualPoints
      .map(function (p) { return p.year; })
      .concat(projectedPoints.map(function (p) { return p.year; }));
    var minYear = Math.min.apply(null, years);
    var maxYear = Math.max.apply(null, years);

    var allValues = actualPoints.concat(projectedPoints).map(function (p) { return p.value; });
    var maxVal = Math.max.apply(null, allValues);
    var step = 20000;
    var niceMax = Math.ceil((maxVal * 1.15) / step) * step || step;

    function x(year) {
      return padLeft + ((year - minYear) / (maxYear - minYear)) * plotW;
    }
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

    function pathFor(points) {
      return points
        .map(function (p, i) {
          return (i === 0 ? "M" : "L") + x(p.year).toFixed(1) + "," + y(p.value).toFixed(1);
        })
        .join(" ");
    }

    var actualLine = pathFor(actualPoints);
    var actualArea =
      actualLine +
      " L" + x(actualPoints[actualPoints.length - 1].year).toFixed(1) + "," + y(0).toFixed(1) +
      " L" + x(actualPoints[0].year).toFixed(1) + "," + y(0).toFixed(1) + " Z";
    var projectedLine = pathFor(projectedPoints);

    var allPoints = actualPoints.concat(projectedPoints.slice(1));
    var dots = allPoints
      .map(function (p) {
        var title = p.year + (p.partial ? " (as of June 30)" : "") + ": " + formatMoney(p.value, "$");
        return (
          '<circle class="end-dot" cx="' + x(p.year).toFixed(1) + '" cy="' + y(p.value).toFixed(1) +
          '" r="4"><title>' + escapeHtml(title) + "</title></circle>"
        );
      })
      .join("");

    var labeled = [actualPoints[0], actualPoints[actualPoints.length - 1], projectedPoints[projectedPoints.length - 1]];
    var labels = labeled
      .map(function (p, i) {
        var anchor = i === 0 ? "start" : i === labeled.length - 1 ? "end" : "middle";
        return (
          '<text x="' + x(p.year).toFixed(1) + '" y="' + (y(p.value) - 10).toFixed(1) +
          '" text-anchor="' + anchor + '" font-size="11" font-weight="700" fill="var(--ink)">' +
          formatMoney(p.value, "$") + "</text>"
        );
      })
      .join("");

    // At narrow widths there isn't room for a label under every one of
    // the 12 years shown. Always keep the first, the most recent actual
    // point, and the final projected point; fill in additional
    // evenly-spaced labels only where they don't collide with those.
    var allYearPoints = actualPoints.concat(projectedPoints.slice(1));
    var minLabelSlot = 26;
    var shown = {};
    var shownX = [];
    [0, actualPoints.length - 1, allYearPoints.length - 1].forEach(function (i) {
      shown[i] = true;
      shownX.push(x(allYearPoints[i].year));
    });
    allYearPoints.forEach(function (p, i) {
      if (shown[i]) return;
      var cx = x(p.year);
      var collides = shownX.some(function (sx) { return Math.abs(sx - cx) < minLabelSlot; });
      if (!collides) {
        shown[i] = true;
        shownX.push(cx);
      }
    });

    var xLabels = allYearPoints
      .map(function (p, i) {
        if (!shown[i]) return "";
        return (
          '<text x="' + x(p.year).toFixed(1) + '" y="' + (height - padBottom + 18) +
          '" text-anchor="middle" font-size="11">' + p.year + "</text>"
        );
      })
      .join("");

    el.innerHTML =
      '<svg class="line-chart" viewBox="0 0 ' + width + " " + height +
      '" role="img" aria-label="Reserve fund balance, actual 2019 through mid-2026, projected 2027 through 2030; full figures are in the table below.">' +
      gridLines +
      '<path class="area-fill" d="' + actualArea + '"></path>' +
      '<path class="trend-line" d="' + actualLine + '"></path>' +
      '<path class="trend-line-projected" d="' + projectedLine + '"></path>' +
      dots +
      labels +
      xLabels +
      "</svg>";
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

  // A stacked column-per-year chart: each year's bar is split into
  // segments by category (using the same category order/colors as this
  // page's other charts), for a magnitude that's mostly small with
  // occasional spikes. Only the tallest/most notable bars get a direct
  // total label per the "label the extreme, not every point" rule -- the
  // rest are covered by the table view and a per-segment hover title.
  function renderStackedYearBarChart(containerId, tableId, points, categories, prefix, width) {
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

    function totalOf(p) {
      return p.items.reduce(function (sum, it) { return sum + it.value; }, 0);
    }

    var maxVal = Math.max.apply(null, points.map(totalOf));
    var step = maxVal > 20000 ? 10000 : 1000;
    var niceMax = Math.ceil((maxVal * 1.15) / step) * step || step;

    var slot = plotW / points.length;
    var barW = Math.min(28, slot * 0.6);

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
        var total = totalOf(p);
        var cum = 0;
        var rx = p.items.length <= 1 ? 3 : 0;
        var segs = p.items
          .map(function (it) {
            var catIndex = categories.indexOf(it.cat);
            var color = SERIES[Math.max(catIndex, 0) % SERIES.length];
            var y0 = y(cum);
            var y1 = y(cum + it.value);
            cum += it.value;
            var h = Math.max(y0 - y1, it.value > 0 ? 1 : 0);
            var title = p.year + " — " + it.cat + ": " + formatMoney(it.value, prefix);
            return (
              '<rect class="stack-seg" x="' + barX.toFixed(1) + '" y="' + y1.toFixed(1) +
              '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + rx +
              '" style="fill:' + color + '"><title>' + escapeHtml(title) + "</title></rect>"
            );
          })
          .join("");
        var label = p.notable
          ? '<text class="bar-value-label" x="' + cx.toFixed(1) + '" y="' + (y(total) - 8).toFixed(1) +
            '" text-anchor="middle" font-size="11">' + formatMoney(total, prefix) + "</text>"
          : "";
        return segs + label;
      })
      .join("");

    // At narrow widths there isn't room for a label under every bar.
    // Always keep the first, last, and any notable/labeled bars; fill in
    // additional evenly-spaced labels only where they don't collide with
    // those (rather than a plain "every Nth" step, which can still land a
    // regular label right next to a notable one).
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
      '" role="img" aria-label="Stacked bar chart by year and category; full figures are in the legend and table below.">' +
      gridLines + baseline + bars + xLabels + "</svg>";

    if (table) {
      var used = categories.filter(function (c) {
        return points.some(function (p) {
          return p.items.some(function (it) { return it.cat === c && it.value; });
        });
      });
      var header =
        "<tr><th>Year</th>" +
        used.map(function (c) { return "<th>" + escapeHtml(c) + "</th>"; }).join("") +
        "<th>Total</th></tr>";
      var rows = points
        .map(function (p) {
          var byCat = {};
          p.items.forEach(function (it) { byCat[it.cat] = it.value; });
          var cells = used
            .map(function (c) {
              return "<td>" + (byCat[c] ? formatMoney(byCat[c], prefix) : "—") + "</td>";
            })
            .join("");
          return "<tr><td>" + p.year + "</td>" + cells + "<td>" + formatMoney(totalOf(p), prefix) + "</td></tr>";
        })
        .join("");
      table.innerHTML = "<thead>" + header + "</thead><tbody>" + rows + "</tbody>";
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
