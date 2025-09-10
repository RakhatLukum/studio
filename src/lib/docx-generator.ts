import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export const generateDocx = (markdownContent: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: markdownToDocx(markdownContent),
    }],
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, "tailored-resume.docx");
  });
};

const markdownToDocx = (markdown: string): Paragraph[] => {
  const children: Paragraph[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    if (line.startsWith('## ')) {
      children.push(new Paragraph({
        text: line.substring(3),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      }));
    } else if (line.startsWith('# ')) {
      children.push(new Paragraph({
        text: line.substring(2),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } },
      }));
    } else if (line.startsWith('- ')) {
      children.push(new Paragraph({
        text: line.substring(2),
        bullet: {
          level: 0
        },
      }));
    } else if (line.trim() === '') {
      children.push(new Paragraph({ text: '' }));
    } else {
      children.push(new Paragraph({ text: line }));
    }
  }

  return children;
};
