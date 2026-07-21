import html2pdf from 'html2pdf.js';
import { getData } from './store.js';
import { trackExport } from './analytics.js';

function getPdfOpt(filename) {
  return {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, letterRendering: true, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  };
}

function ensureVisible(el) {
  const tab = el.closest('.tab-content');
  if (tab && !tab.classList.contains('active')) {
    const wasHidden = tab.style.display;
    tab.style.display = 'block';
    tab.style.position = 'absolute';
    tab.style.left = '-9999px';
    tab.style.width = '800px';
    return () => {
      tab.style.display = wasHidden || '';
      tab.style.position = '';
      tab.style.left = '';
      tab.style.width = '';
    };
  }
  return null;
}

export function downloadCVPdf() {
  const el = document.querySelector('#cvPreview .cv-content');
  const d = getData();
  if (!el || !d.fullName) { alert('Please fill in your details first.'); return; }
  const name = d.fullName.replace(/\s+/g, '_');
  trackExport('cv_pdf');
  const restore = ensureVisible(el);
  html2pdf().set(getPdfOpt(`${name}_CV.pdf`)).from(el).save()
    .catch(() => alert('Failed to generate PDF. Please try again.'))
    .finally(() => { if (restore) restore(); });
}

export function downloadCoverLetterPDF() {
  const el = document.querySelector('#clPreview .cl-content');
  const d = getData();
  if (!el || !d.fullName) { alert('Please fill in your details first.'); return; }
  const name = d.fullName.replace(/\s+/g, '_');
  trackExport('cl_pdf');
  const restore = ensureVisible(el);
  html2pdf().set(getPdfOpt(`${name}_Cover_Letter.pdf`)).from(el).save()
    .catch(() => alert('Failed to generate PDF. Please try again.'))
    .finally(() => { if (restore) restore(); });
}

export function printCV() {
  const el = document.querySelector('#cvPreview .cv-content');
  const d = getData();
  if (!el || !d.fullName) { alert('Please fill in your details first.'); return; }
  trackExport('cv_print');
  const restore = ensureVisible(el);
  html2pdf().set(getPdfOpt(`CV_${Date.now()}.pdf`)).from(el).toPdf().get('pdf').then(pdf => {
    window.open(pdf.output('bloburl'), '_blank');
  }).catch(() => alert('Failed to generate PDF. Please try again.'))
    .finally(() => { if (restore) restore(); });
}

export function printCoverLetter() {
  const el = document.querySelector('#clPreview .cl-content');
  const d = getData();
  if (!el || !d.fullName) { alert('Please fill in your details first.'); return; }
  trackExport('cl_print');
  const restore = ensureVisible(el);
  html2pdf().set(getPdfOpt(`Cover_Letter_${Date.now()}.pdf`)).from(el).toPdf().get('pdf').then(pdf => {
    window.open(pdf.output('bloburl'), '_blank');
  }).catch(() => alert('Failed to generate PDF. Please try again.'))
    .finally(() => { if (restore) restore(); });
}

function getWordStyles(accentColor) {
  const accent = accentColor || '#6c5ce7';
  return `
    <style>
      body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #333; line-height: 1.5; margin: 1in; }
      h1 { font-size: 18pt; margin-bottom: 2pt; color: #333; }
      h2 { font-size: 13pt; text-transform: uppercase; letter-spacing: 1px; color: ${accent}; border-bottom: 1px solid #ddd; padding-bottom: 4pt; margin-top: 14pt; margin-bottom: 8pt; }
      h3 { font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; color: ${accent}; margin-top: 10pt; margin-bottom: 6pt; }
      p { margin: 4pt 0; color: #333; }
      .cv-content { background: #fff; color: #333; padding: 0; }
      .cv-header { margin-bottom: 16px; }
      .cv-header h1 { font-size: 18pt; margin-bottom: 2pt; color: #333; }
      .cv-title { color: #666; font-size: 11pt; margin-bottom: 4pt; }
      .cv-contact span { margin-right: 12pt; color: #555; font-size: 10pt; }
      .cv-section { margin-bottom: 10pt; }
      .cv-section h2 { font-size: 13pt; text-transform: uppercase; letter-spacing: 1px; color: ${accent}; border-bottom: 1px solid #ddd; padding-bottom: 4pt; margin-top: 14pt; margin-bottom: 8pt; }
      .cv-item { margin-bottom: 8pt; }
      .cv-item-title { font-weight: bold; color: #333; }
      .cv-item-subtitle { color: ${accent}; }
      .cv-item-date { color: #999; font-size: 10pt; }
      .cv-item-desc { margin-top: 2pt; color: #555; }
      .cv-skills-list span { display: inline-block; margin: 2pt 4pt 2pt 0; padding: 2pt 8pt; background: #eee; border-radius: 10pt; color: #555; font-size: 9pt; }
      .cv-header-photo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
      .cv-item-group { margin-bottom: 10pt; }
      .cv-item-group h3 { font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; color: ${accent}; border-bottom: 1px solid #ddd; padding-bottom: 3pt; margin-bottom: 6pt; }
      .cv-referee-info { font-size: 10pt; color: #555; }
      .cl-content { background: #fff; color: #333; padding: 0; }
      .cl-sender { font-weight: 700; }
      .cl-template-modern .cl-sender { font-size: 1.4rem; color: ${accent}; }
      .cl-template-professional .cl-sender { font-size: 1.6rem; color: #2c3e50; }
      .cl-template-minimal .cl-sender { font-size: 1.2rem; color: #222; }
      .cl-sender-email { color: #666; font-size: 0.85rem; }
      .cl-date { margin: 16px 0; color: #999; font-size: 0.85rem; }
      .cl-greeting { margin: 14px 0; color: #333; }
      .cl-body p { margin-bottom: 12px; color: #333; }
      .cl-recipient p { color: #333; }
      .cl-closing { margin-top: 24px; color: #333; }
    </style>
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

function downloadWordDoc(htmlContent, filename) {
  const accentColor = getData().accentColor || '#6c5ce7';
  const wordDoc = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      ${getWordStyles(accentColor)}
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
  const blob = new Blob(['\ufeff', wordDoc], { type: 'application/msword' });
  downloadBlob(blob, filename);
}

export function downloadCVDocx() {
  const content = document.querySelector('#cvPreview .cv-content');
  const d = getData();
  if (!content || !d.fullName) { alert('Please fill in your details first.'); return; }
  trackExport('cv_docx');
  downloadWordDoc(content.innerHTML, `${d.fullName.replace(/\s+/g, '_')}_CV.doc`);
}

export function downloadCoverLetterDocx() {
  const content = document.querySelector('#clPreview .cl-content');
  const d = getData();
  if (!content || !d.fullName) { alert('Please fill in your details first.'); return; }
  trackExport('cl_docx');
  downloadWordDoc(content.innerHTML, `${d.fullName.replace(/\s+/g, '_')}_Cover_Letter.doc`);
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
