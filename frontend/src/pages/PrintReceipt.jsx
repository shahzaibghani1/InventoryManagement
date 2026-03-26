import React from "react";

export function printReceiptUsingBlob(sale) {
  if (!sale) return;

  // build the rows from sale items
  const rowsHtml = (sale.saleItems || [])
    .map(
      (it, idx) => `
    <tr>
      <td style="padding:4px 0; width:50%;">${idx + 1}. ${escapeHtml(
        it.productName
      )}</td>
      <td style="padding:4px 0; text-align:center; width:10%">${
        it.saleQuantity
      }</td>
      <td style="padding:4px 0; text-align:center; width:15%">${
        it.unitPrice
      }</td>
      <td style="padding:4px 0; text-align:right; width:25%">${it.price}</td>
    </tr>`
    )
    .join("");

  // full HTML document (inline CSS + @page for 80mm width)
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt</title>
  <style>
    @page { size: 80mm auto; margin: 5mm; }
    html,body { margin:0; padding:0; font-family: monospace; color:#000; }
    body { font-size: 11px; padding: 4mm; box-sizing: border-box; width:80mm; }
    .center { text-align:center; }
    .right { text-align:right; }
    .bold { font-weight:700; }
    hr { border: none; border-top: 1px dashed #000; margin:6px 0; }
    table { width:100%; border-collapse: collapse; }
    th, td { font-size: 11px; vertical-align: top; }
    .small { font-size: 10px; }
    /* safe fallback if printer ignores some properties */
    .title { font-size: 18px; font-weight:700; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="center">
    <div class="title">${escapeHtml(sale.shopName ?? "My Shop")}</div>
    <div class="small">${escapeHtml(sale.shopAddress ?? "")}</div>
    <div class="small">${escapeHtml(sale.shopPhone ?? "")}</div>
  </div>

  <hr />

  <div style="font-size:11px; margin-bottom:6px;">
    <div style="display:flex; justify-content:space-between;">
      <div>Sale ID: ${escapeHtml(sale.saleId ?? "")}</div>
      <div>${formatDate(sale.saleDate)}</div>
    </div>
    <div style="display:flex; justify-content:space-between;">
      <div>Customer: ${escapeHtml(sale.name ?? "")}</div>
      <div>${formatTime(sale.saleDate)}</div>
    </div>
    <div>Phone: ${escapeHtml(sale.phoneNo ?? "")}</div>
  </div>

  <table aria-label="items">
    <thead>
      <tr>
        <th style="text-align:left; padding-bottom:6px;">Item</th>
        <th style="text-align:center; padding-bottom:6px;">Qty</th>
        <th style="text-align:center; padding-bottom:6px;">Rate</th>
        <th style="text-align:right; padding-bottom:6px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <hr />

  <div style="display:flex; justify-content:space-between; margin-top:6px; font-weight:700;">
    <div>Grand Total</div>
    <div>${escapeHtml(String(sale.salePrice ?? 0))} PKR</div>
  </div>

  <div class="center small" style="margin-top:10px;">
    Thank you for shopping!
  </div>
</body>
</html>`;

  // create blob
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  // open a blank window (must be from user gesture to avoid popup block)
  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    // popup blocked
    URL.revokeObjectURL(url);
    alert(
      "Popup blocked. Please allow popups for this site to print the receipt."
    );
    return;
  }

  // write the HTML into the new window's document
  printWindow.document.open();
  // Use the blob url as base for resolving resources (if necessary)
  printWindow.document.write(html);
  printWindow.document.close();

  // Try to print when the window signals it's loaded. Also set fallback timeout.
  const tryPrint = () => {
    try {
      printWindow.focus();
      // print dialog
      if (printWindow.print) {
        printWindow.print();
      } else {
        alert("Print not available in this browser window.");
      }
    } catch (err) {
      console.warn("Print error:", err);
    } finally {
      // attempt to close and cleanup
      setTimeout(() => {
        try {
          printWindow.close();
        } catch (e) {}
        URL.revokeObjectURL(url);
      }, 500);
    }
  };

  // if content loaded event fires, call print, otherwise fallback
  printWindow.onload = () => tryPrint();
  // fallback in case onload doesn't fire for blob HTML
  setTimeout(() => {
    if (!printWindow.closed) tryPrint();
  }, 700);
}

/* ---------- helpers ---------- */
function escapeHtml(text) {
  if (text === undefined || text === null) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString();
}
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString();
}
