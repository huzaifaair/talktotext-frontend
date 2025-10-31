// lib/exporter.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { normalizeMarkdown } from "./markdownUtils";

type NoteShape = any;

function sanitizeFilename(name = "meeting-notes") {
  return name.replace(/[<>:"/\\|?*]+/g, "-").slice(0, 120);
}

// ---------------- DOCX EXPORT ----------------
export async function exportNoteAsDocx(note: NoteShape) {
  const title = note.title || "Meeting Notes";
  const content = normalizeMarkdown(note.abstract_summary || note.final_notes || "");

  const lines = content.split(/\r?\n/);
  const children: Paragraph[] = [];

  children.push(new Paragraph({ text: title, heading: HeadingLevel.TITLE }));
  children.push(new Paragraph({ text: note.created_at ? new Date(note.created_at).toLocaleString() : "" }));
  children.push(new Paragraph({ text: "" }));

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^## /.test(trimmed)) {
      children.push(new Paragraph({ text: trimmed.replace(/^## /, "").trim(), heading: HeadingLevel.HEADING_1 }));
    } else if (/^- /.test(trimmed)) {
      children.push(new Paragraph({ children: [new TextRun({ text: "• " + trimmed.replace(/^- /, "").trim() })] }));
    } else if (/^\d+\./.test(trimmed)) {
      children.push(new Paragraph({ text: trimmed }));
    } else {
      children.push(new Paragraph({ text: trimmed }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFilename(title)}.docx`);
}

// ---------------- PDF EXPORT ----------------
export async function exportNoteAsPDF(note: NoteShape) {
  const title = note.title || "Meeting Notes";
  const content = normalizeMarkdown(note.abstract_summary || note.final_notes || "");
  const formatted = content
    .replace(/^## (.+)$/gm, "<h2 style='margin-top:16px;'>$1</h2>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n{2,}/g, "<br/><br/>");

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #111; width: 800px; padding: 28px;">
    <h1 style="font-size: 22px;">${title}</h1>
    <div style="color:#555; margin-bottom:8px;">${note.created_at ? new Date(note.created_at).toLocaleString() : ""}</div>
    <div style="font-size:14px; line-height:1.6;">${formatted}</div>
  </div>
  `;

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = (pdf as any).getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    pdf.save(`${sanitizeFilename(title)}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
}
