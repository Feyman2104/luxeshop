import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

const DOCX_SRC = 'C:/Users/Dell/Downloads/Rubrica-SOA-LLENA.docx';
const DOCX_OUT = 'C:/Users/Dell/Downloads/Rubrica-SOA-FINAL.docx';

const SCREENSHOTS = [
  { file: 'docs/img/login.png',         label: 'Pantalla de Inicio de Sesión (Login)' },
  { file: 'docs/img/register.png',      label: 'Pantalla de Registro de Usuario' },
  { file: 'docs/img/forgot.png',        label: 'Pantalla de Recuperación de Contraseña' },
  { file: 'docs/img/reset.png',         label: 'Pantalla de Restablecimiento de Contraseña' },
  { file: 'docs/img/dashboard-new.png', label: 'Dashboard — Registro de Sesiones en Tiempo Real' },
];

const EMU_W = 5400000; // ~6cm width in EMUs (914400 EMU = 1 inch)
const EMU_H = 3450000; // proportional to 1400×900 viewport

function drawingXml(rId, label, idx) {
  const id = idx + 100;
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${EMU_W}" cy="${EMU_H}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${id}" name="Imagen${id}" descr="${label}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="Imagen${id}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${EMU_W}" cy="${EMU_H}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

function captionXml(label) {
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:t>${label}</w:t></w:r></w:p>`;
}

function spacerXml() {
  return `<w:p><w:r><w:t> </w:t></w:r></w:p>`;
}

async function main() {
  const docxBuf = fs.readFileSync(DOCX_SRC);
  const zip = await JSZip.loadAsync(docxBuf);

  // Read current document.xml
  let docXml = await zip.file('word/document.xml').async('string');

  // Read current relationships
  let relsXml = await zip.file('word/_rels/document.xml.rels').async('string');

  // Find next rId
  const existingIds = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map(m => parseInt(m[1]));
  let nextId = Math.max(...existingIds, 0) + 1;

  // Add images and build XML to append
  let appendXml = '';
  appendXml += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>CAPTURAS DE PANTALLA DE LA APLICACI&#211;N</w:t></w:r></w:p>`;
  appendXml += spacerXml();

  for (let i = 0; i < SCREENSHOTS.length; i++) {
    const { file, label } = SCREENSHOTS[i];
    const imgBuf = fs.readFileSync(file);
    const mediaName = `img_screenshot_${i}.png`;
    zip.file(`word/media/${mediaName}`, imgBuf);

    const rId = `rId${nextId}`;
    nextId++;

    // Add relationship
    const newRel = `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaName}"/>`;
    relsXml = relsXml.replace('</Relationships>', newRel + '</Relationships>');

    appendXml += captionXml(label);
    appendXml += drawingXml(rId, label, i);
    appendXml += spacerXml();
  }

  // Insert before </w:body>
  docXml = docXml.replace('</w:body>', appendXml + '</w:body>');

  // Save updated files back
  zip.file('word/document.xml', docXml);
  zip.file('word/_rels/document.xml.rels', relsXml);

  const outBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(DOCX_OUT, outBuf);
  console.log(`✓ Saved: ${DOCX_OUT} (${(outBuf.length / 1024).toFixed(0)} KB)`);
}

main().catch(console.error);
