// export.js — Export Dubluri / Ce am / Lipsă în TXT, Excel, PDF, Word.
// Folosește globale din app.js: SECTIONS, STICKER_NAMES, data, getState,
// isOwned, spareCount, collectDupes, collectMissing, showToast.
// Pozele se includ doar la export-ul de Dubluri (Excel + PDF).

// ---------- helpers ----------
function exp_dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function exp_download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exp_escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

// jsPDF font-urile standard nu au diacritice românești (ț, ș) — le simplificăm
// la ASCII doar pentru PDF ca să nu apară glife greșite.
function exp_asciiFold(s) {
  return String(s).normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

async function exp_imageDataUrl(code) {
  try {
    const resp = await fetch(`./images/${code}.jpg`, { cache: "force-cache" });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    if (!blob.type.startsWith("image/")) return null;
    return await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ---------- dataset builder ----------
// kind: "dupes" | "owned" | "missing"
// -> { title, fileBase, rows: [{country, code, name, count?}], hasCount }
function exp_buildRows(kind) {
  const rows = [];
  if (kind === "dupes") {
    const { bySection } = collectDupes();
    for (const { section, items } of bySection)
      for (const it of items)
        rows.push({ country: section.name, code: it.code, name: STICKER_NAMES[it.code] || "", count: it.count });
    return { title: "Dubluri", fileBase: "dubluri", rows, hasCount: true };
  }
  if (kind === "missing") {
    const { bySection } = collectMissing();
    for (const { section, codes } of bySection)
      for (const c of codes)
        rows.push({ country: section.name, code: c, name: STICKER_NAMES[c] || "" });
    return { title: "Lipsă", fileBase: "lipsa", rows, hasCount: false };
  }
  // owned
  for (const s of SECTIONS) {
    for (let i = s.start; i <= s.end; i++) {
      const c = s.code + i;
      if (isOwned(getState(data, c)))
        rows.push({ country: s.name, code: c, name: STICKER_NAMES[c] || "" });
    }
  }
  return { title: "Ce am", fileBase: "ce-am", rows, hasCount: false };
}

// ---------- TXT ----------
function exportTxt(kind) {
  const { title, fileBase, rows, hasCount } = exp_buildRows(kind);
  const lines = [`${title} (${rows.length})`, ""];
  let cur = null;
  for (const r of rows) {
    if (r.country !== cur) { cur = r.country; lines.push(`== ${cur} ==`); }
    let line = r.code + (r.name ? ` - ${r.name}` : "");
    if (hasCount && r.count > 1) line += ` ×${r.count}`;
    lines.push(line);
  }
  exp_download(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }), `${fileBase}-${exp_dateStamp()}.txt`);
  showToast("TXT descărcat");
}

// ---------- Word (HTML .doc) ----------
function exportWord(kind) {
  const { title, fileBase, rows, hasCount } = exp_buildRows(kind);
  let html =
    "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
    "xmlns:w='urn:schemas-microsoft-com:office:word' " +
    "xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'>" +
    `<title>${title}</title></head><body>`;
  html += `<h2>${title} (${rows.length})</h2>`;
  html += "<table border='1' cellspacing='0' cellpadding='4'><tr>" +
    "<th>Țară</th><th>Cod</th><th>Nume</th>" + (hasCount ? "<th>Dubluri</th>" : "") + "</tr>";
  for (const r of rows) {
    html += "<tr>" +
      `<td>${exp_escapeHtml(r.country)}</td>` +
      `<td>${r.code}</td>` +
      `<td>${exp_escapeHtml(r.name)}</td>` +
      (hasCount ? `<td>${r.count}</td>` : "") +
      "</tr>";
  }
  html += "</table></body></html>";
  exp_download(new Blob(["﻿" + html], { type: "application/msword" }), `${fileBase}-${exp_dateStamp()}.doc`);
  showToast("Word descărcat");
}

// ---------- Excel (ExcelJS) ----------
async function exportExcel(kind, withPhotos) {
  const { title, fileBase, rows, hasCount } = exp_buildRows(kind);
  showToast(withPhotos ? "Generez Excel cu poze…" : "Generez Excel…");

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(title);
  const cols = [
    { header: "Țară", key: "country", width: 18 },
    { header: "Cod", key: "code", width: 10 },
    { header: "Nume", key: "name", width: 28 },
  ];
  if (hasCount) cols.push({ header: "Dubluri", key: "count", width: 10 });
  if (withPhotos) cols.push({ header: "Poză", key: "photo", width: 10 });
  ws.columns = cols;
  ws.getRow(1).font = { bold: true };
  const photoCol = cols.length; // 1-based index of last column

  for (const r of rows) {
    const rowData = { country: r.country, code: r.code, name: r.name };
    if (hasCount) rowData.count = r.count;
    const row = ws.addRow(rowData);
    if (withPhotos) {
      const dataUrl = await exp_imageDataUrl(r.code);
      if (dataUrl) {
        const ext = dataUrl.includes("image/png") ? "png" : "jpeg";
        const imgId = wb.addImage({ base64: dataUrl, extension: ext });
        row.height = 56;
        ws.addImage(imgId, {
          tl: { col: photoCol - 1, row: row.number - 1 },
          ext: { width: 40, height: 56 },
        });
      }
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  exp_download(
    new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${fileBase}-${exp_dateStamp()}.xlsx`
  );
  showToast("Excel descărcat");
}

// ---------- PDF (jsPDF + autotable) ----------
async function exportPdf(kind, withPhotos) {
  const { title, fileBase, rows, hasCount } = exp_buildRows(kind);
  showToast(withPhotos ? "Generez PDF cu poze…" : "Generez PDF…");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(exp_asciiFold(`${title} (${rows.length})`), 14, 16);

  const head = [["Tara", "Cod", "Nume"]];
  if (hasCount) head[0].push("Dubluri");
  if (withPhotos) head[0].push("Poza");
  const photoCol = head[0].length - 1;

  // prefetch images by row index
  const images = {};
  if (withPhotos) {
    for (let i = 0; i < rows.length; i++) {
      const d = await exp_imageDataUrl(rows[i].code);
      if (d) images[i] = d;
    }
  }

  const body = rows.map((r) => {
    const cells = [exp_asciiFold(r.country), r.code, exp_asciiFold(r.name)];
    if (hasCount) cells.push(String(r.count));
    if (withPhotos) cells.push("");
    return cells;
  });

  doc.autoTable({
    head,
    body,
    startY: 22,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [10, 61, 98] },
    didParseCell: (d) => {
      if (withPhotos && d.section === "body" && d.column.index === photoCol) {
        d.cell.styles.minCellHeight = 16;
      }
    },
    didDrawCell: (d) => {
      if (withPhotos && d.section === "body" && d.column.index === photoCol) {
        const img = images[d.row.index];
        if (img) {
          const fmt = img.includes("image/png") ? "PNG" : "JPEG";
          try { doc.addImage(img, fmt, d.cell.x + 1, d.cell.y + 1, 10, 14); } catch {}
        }
      }
    },
  });

  doc.save(`${fileBase}-${exp_dateStamp()}.pdf`);
  showToast("PDF descărcat");
}

// ---------- UI ----------
function renderExportBar(container, kind) {
  const withPhotos = kind === "dupes"; // poze doar la dubluri
  const wrap = document.createElement("div");
  wrap.className = "export-bar";
  wrap.innerHTML = `
    <span class="export-label">Export:</span>
    <button class="btn-export" data-fmt="txt">TXT</button>
    <button class="btn-export" data-fmt="excel">Excel</button>
    <button class="btn-export" data-fmt="pdf">PDF</button>
    <button class="btn-export" data-fmt="word">Word</button>
  `;
  wrap.querySelector('[data-fmt="txt"]').onclick = () => exportTxt(kind);
  wrap.querySelector('[data-fmt="excel"]').onclick = () => exportExcel(kind, withPhotos);
  wrap.querySelector('[data-fmt="pdf"]').onclick = () => exportPdf(kind, withPhotos);
  wrap.querySelector('[data-fmt="word"]').onclick = () => exportWord(kind);
  container.appendChild(wrap);
}
