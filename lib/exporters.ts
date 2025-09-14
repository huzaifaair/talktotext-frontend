import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { normalizeMarkdown } from "./markdownUtils";
import { marked } from "marked";

type NoteShape = any;

function sanitizeFilename(name = "meeting-notes") {
  return name.replace(/[<>:"/\\|?*]+/g, "-").slice(0, 120);
}

export async function exportNoteAsDocx(note: NoteShape) {
  const title = note.title || "Meeting Notes";

  const children: Paragraph[] = [];

  children.push(new Paragraph({ text: title, heading: HeadingLevel.TITLE }));
  children.push(new Paragraph({ text: "" }));

  const normalized = normalizeMarkdown(note.abstract_summary || note.final_notes || "");
  const parsed = marked.parse(normalized).toString().split("\n");

  parsed.forEach((line: string) => {
    if (!line.trim()) return;
    if (line.startsWith("##")) {
      children.push(new Paragraph({ text: line.replace(/^##+/, "").trim(), heading: HeadingLevel.HEADING_1 }));
    } else if (line.startsWith("-")) {
      children.push(new Paragraph({ children: [new TextRun({ text: "• " + line.replace(/^-/, "").trim() })] }));
    } else if (/^\d+\./.test(line)) {
      children.push(new Paragraph({ text: line.trim() }));
    } else {
      children.push(new Paragraph({ text: line.trim() }));
    }
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFilename(title)}.docx`);
}

export async function exportNoteAsPDF(note: NoteShape) {
  const title = note.title || "Meeting Notes";
  const normalized = normalizeMarkdown(note.abstract_summary || note.final_notes || "");

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #111; width: 800px; padding: 28px;">
    <h1 style="font-size: 22px; margin-bottom:8px;">${title}</h1>
    <div style="color:#666; margin-bottom:12px;">${note.created_at ? new Date(note.created_at).toLocaleString() : ""}</div>
    <div style="font-size:14px; line-height:1.6;">${normalized.replace(/\n/g, "<br/>")}</div>
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
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = (pdf as any).getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let position = 0;
    let remaining = imgHeight;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    } else {
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      remaining -= pdfHeight;
      position -= pdfHeight;
      while (remaining > 0) {
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        remaining -= pdfHeight;
        position -= pdfHeight;
      }
    }

    pdf.save(`${sanitizeFilename(title)}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
}
