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

  // 2025 actual operating spending, grouped into resident-readable
  // categories. Source: Board's 2025 actuals (from the 2026 budget
  // analysis). Total $44,305 against $45,600 in assessment income.
  var duesBreakdown = [
    { label: "Landscaping, grounds & snow", value: 16618 },
    { label: "Reserve contribution", value: 10207 },
    { label: "Management (2025, being phased out)", value: 7800 },
    { label: "Legal & professional", value: 3215 },
    { label: "Insurance", value: 2525 },
    { label: "Administrative & other", value: 2221 },
    { label: "Utilities", value: 1719 },
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

  renderStackedBar("dues-bar", "dues-legend", "dues-table", duesBreakdown, "$");
  renderStackedBar("reserve-bar", "reserve-legend", "reserve-table", reserveAllocation, "$");
  renderLineChart("pct-funded-chart", pctFunded);

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

  function renderLineChart(containerId, points) {
    var el = document.getElementById(containerId);
    if (!el) return;

    var width = 640;
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

  function formatMoney(n, prefix) {
    return (prefix || "") + Math.round(n).toLocaleString("en-US");
  }
});
