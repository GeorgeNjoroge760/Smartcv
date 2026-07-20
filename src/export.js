import { getData } from './store.js';
import { isPro } from './auth.js';
import { trackExport } from './analytics.js';
import { trackUpgrade } from './analytics.js';

function getPdfOpt(filename) {
  return {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  };
}

function addWatermark(el) {
  if (isPro()) return;
  const wm = document.createElement('div');
  wm.className = 'cv-watermark';
  wm.innerHTML = 'Built with SmartCV AI — smartcv-generator.vercel.app';
  wm.style.cssText = 'text-align:center;padding:8px;font-size:0.65rem;color:#aaa;border-top:1px solid #eee;margin-top:16px;font-style:italic;';
  el.appendChild(wm);
}

function removeWatermark() {
  const wm = document.querySelector('.cv-watermark');
  if (wm) wm.remove();
}

export function downloadCVPdf() {
  const el = document.querySelector('#cvPreview .cv-content');
  const d = getData();
  if (!el || !d.fullName) { alert('Please fill in your details first.'); return; }
  addWatermark(el);
  const name = d.fullName.replace(/\s+/g, '_');
  trackExport('cv_pdf');
  html2pdf().set(getPdfOpt(`${name}_CV.pdf`)).from(el).then(() => {
    removeWatermark();
    if (!isPro()) trackUpgrade('cv_export');
  });
}

export function downloadCoverLetterPDF() {
  const el = document.querySelector('#clPreview .cl-content');
  const d = getData();
  if (!el || !d.fullName) { alert('Please fill in your details first.'); return; }
  addWatermark(el);
  const name = d.fullName.replace(/\s+/g, '_');
  trackExport('cl_pdf');
  html2pdf().set(getPdfOpt(`${name}_Cover_Letter.pdf`)).from(el).then(() => {
    removeWatermark();
    if (!isPro()) trackUpgrade('cl_export');
  });
}

export function printCV() {
  const el = document.querySelector('#cvPreview .cv-content');
  const d = getData();
  if (!el || !d.fullName) { alert('Please fill in your details first.'); return; }
  trackExport('cv_print');
  html2pdf().set(getPdfOpt(`CV_${Date.now()}.pdf`)).from(el).toPdf().get('pdf').then(pdf => {
    window.open(pdf.output('bloburl'), '_blank');
  });
}

export function printCoverLetter() {
  const el = document.querySelector('#clPreview .cl-content');
  const d = getData();
  if (!el || !d.fullName) { alert('Please fill in your details first.'); return; }
  trackExport('cl_print');
  html2pdf().set(getPdfOpt(`Cover_Letter_${Date.now()}.pdf`)).from(el).toPdf().get('pdf').then(pdf => {
    window.open(pdf.output('bloburl'), '_blank');
  });
}

function getDocxStyles() {
  return `
    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #333; line-height: 1.5; margin: 1in; background: #fff; }
    h1 { font-size: 18pt; margin-bottom: 2pt; color: #333; }
    h2 { font-size: 13pt; text-transform: uppercase; letter-spacing: 1px; color: #6c5ce7; border-bottom: 1px solid #ddd; padding-bottom: 4pt; margin-top: 14pt; margin-bottom: 8pt; }
    p { margin: 4pt 0; color: #333; }
    .cv-content { background:#fff; color:#333; }
    .cv-header h1 { font-size:18pt; margin-bottom:2pt; color:#333; }
    .cv-title { color:#666; }
    .cv-contact span { margin-right:12pt; color:#555; }
    .cv-section { margin-bottom:10pt; }
    .cv-section h2 { font-size:13pt; text-transform:uppercase; letter-spacing:1px; color:#6c5ce7; border-bottom:1px solid #ddd; padding-bottom:4pt; margin-top:14pt; margin-bottom:8pt; }
    .cv-item { margin-bottom:8pt; }
    .cv-item-title { font-weight:bold; color:#333; }
    .cv-item-subtitle { color:#6c5ce7; }
    .cv-item-date { color:#999; font-size:10pt; }
    .cv-item-desc { margin-top:2pt; color:#555; }
    .cv-skills-list span { display:inline-block; margin:2pt 4pt 2pt 0; padding:2pt 8pt; background:#eee; border-radius:10pt; color:#555; font-size:9pt; }
    .cv-header-photo { width:80px; height:80px; border-radius:50%; object-fit:cover; }
    .cl-content { background:#fff; color:#333; padding:40px 48px; }
    .cl-sender { font-weight:700; }
    .cl-template-modern .cl-sender { font-size:1.4rem; color:#6c5ce7; }
    .cl-template-professional .cl-sender { font-size:1.6rem; color:#2c3e50; }
    .cl-template-minimal .cl-sender { font-size:1.2rem; color:#222; }
    .cl-sender-email { color:#666; font-size:0.85rem; }
    .cl-date { margin:16px 0; color:#999; font-size:0.85rem; }
    .cl-greeting { margin:14px 0; color:#333; }
    .cl-body p { margin-bottom:12px; color:#333; }
    .cl-recipient p { color:#333; }
    .cl-closing { margin-top:24px; color:#333; }
  `;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadCVDocx() {
  const content = document.querySelector('#cvPreview .cv-content');
  const d = getData();
  if (!content || !d.fullName) { alert('Please fill in your details first.'); return; }
  trackExport('cv_docx');
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${d.fullName} - CV</title><style>${getDocxStyles()}</style></head><body>${content.innerHTML}</body></html>`;
  try {
    const blob = await HTMLtoDOCX(fullHtml);
    downloadBlob(blob, `${d.fullName.replace(/\s+/g, '_')}_CV.docx`);
  } catch (e) {
    alert('DOCX generation failed: ' + e.message);
  }
}

export async function downloadCoverLetterDocx() {
  const content = document.querySelector('#clPreview .cl-content');
  const d = getData();
  if (!content || !d.fullName) { alert('Please fill in your details first.'); return; }
  trackExport('cl_docx');
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${d.fullName} - Cover Letter</title><style>${getDocxStyles()}</style></head><body>${content.innerHTML}</body></html>`;
  try {
    const blob = await HTMLtoDOCX(fullHtml);
    downloadBlob(blob, `${d.fullName.replace(/\s+/g, '_')}_Cover_Letter.docx`);
  } catch (e) {
    alert('DOCX generation failed: ' + e.message);
  }
}

export function exportJSON() {
  const d = getData();
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SmartCV_Data.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(event, onImport) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      onImport(imported);
      alert('Data imported successfully!');
    } catch {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
