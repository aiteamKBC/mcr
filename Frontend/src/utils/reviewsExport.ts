// MCR file header: Frontend\src\utils\reviewsExport.ts
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.

import type { McrReview } from '../types/mcr';
import { meetingListDateTimeLabels } from './meetingDisplay';

type ExcelCellValue = string | number;

type ExportColumn = {
  header: string;
  value: (review: McrReview) => ExcelCellValue;
};

type ExportCell = {
  type: 'inlineStr' | 'n';
  value: ExcelCellValue;
};

type ZipFileEntry = {
  name: string;
  data: Uint8Array;
  crc32: number;
  offset: number;
  dosTime: number;
  dosDate: number;
};

const encoder = new TextEncoder();

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Review ID', value: (review) => Number(review.id) || String(review.id) },
  {
    header: 'Date',
    value: (review) => meetingListDateTimeLabels(review).date,
  },
  {
    header: 'Time',
    value: (review) => meetingListDateTimeLabels(review).time,
  },
  { header: 'Learner', value: (review) => entityName(review.learner as unknown) },
  { header: 'Coach', value: (review) => entityName(review.coach as unknown) },
  { header: 'Programme', value: (review) => entityName(review.programme as unknown) },
  { header: 'Group', value: (review) => entityName(review.group as unknown) },
  { header: 'Duration (min)', value: (review) => review.totalDurationMin },
  { header: 'RAG', value: (review) => String(review.ragStatus) },
  { header: 'Rating', value: (review) => String(review.qualitativeRating) },
  { header: 'Safeguarding flagged', value: (review) => (review.safeguardingFlagged ? 'Yes' : 'No') },
  { header: 'Satisfaction', value: (review) => Number(review.satisfactionScore.toFixed(1)) },
];

function entityName(value: string | { name?: string } | unknown): string {
  if (value && typeof value === 'object' && 'name' in (value as object)) {
    return String((value as { name?: string }).name ?? '');
  }
  return String(value ?? '');
}

function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function excelColumnName(index: number): string {
  let value = '';
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    value = String.fromCharCode(65 + remainder) + value;
    current = Math.floor((current - 1) / 26);
  }
  return value;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { dosTime: number; dosDate: number } {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    (((year - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { dosTime, dosDate };
}

function uint16LE(value: number): Uint8Array {
  return Uint8Array.of(value & 0xff, (value >>> 8) & 0xff);
}

function uint32LE(value: number): Uint8Array {
  return Uint8Array.of(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function encodeXml(xml: string): Uint8Array {
  return encoder.encode(xml);
}

function createZip(files: Array<{ name: string; content: string }>): Blob {
  const zipParts: Uint8Array[] = [];
  const centralDirectoryParts: Uint8Array[] = [];
  const entries: ZipFileEntry[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = encodeXml(file.content);
    const now = new Date();
    const { dosTime, dosDate } = dosDateTime(now);
    const entry: ZipFileEntry = {
      name: file.name,
      data,
      crc32: crc32(data),
      offset,
      dosTime,
      dosDate,
    };

    const localHeader = new Uint8Array([
      ...uint32LE(0x04034b50),
      ...uint16LE(20),
      ...uint16LE(0),
      ...uint16LE(0),
      ...uint16LE(entry.dosTime),
      ...uint16LE(entry.dosDate),
      ...uint32LE(entry.crc32),
      ...uint32LE(entry.data.length),
      ...uint32LE(entry.data.length),
      ...uint16LE(nameBytes.length),
      ...uint16LE(0),
      ...nameBytes,
    ]);

    zipParts.push(localHeader, entry.data);
    offset += localHeader.length + entry.data.length;
    entries.push(entry);
  }

  const centralDirectoryOffset = offset;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const centralHeader = new Uint8Array([
      ...uint32LE(0x02014b50),
      ...uint16LE(20),
      ...uint16LE(20),
      ...uint16LE(0),
      ...uint16LE(0),
      ...uint16LE(entry.dosTime),
      ...uint16LE(entry.dosDate),
      ...uint32LE(entry.crc32),
      ...uint32LE(entry.data.length),
      ...uint32LE(entry.data.length),
      ...uint16LE(nameBytes.length),
      ...uint16LE(0),
      ...uint16LE(0),
      ...uint16LE(0),
      ...uint16LE(0),
      ...uint32LE(0),
      ...uint32LE(entry.offset),
      ...nameBytes,
    ]);
    centralDirectoryParts.push(centralHeader);
    offset += centralHeader.length;
  }

  const centralDirectorySize = offset - centralDirectoryOffset;
  const endOfCentralDirectory = new Uint8Array([
    ...uint32LE(0x06054b50),
    ...uint16LE(0),
    ...uint16LE(0),
    ...uint16LE(entries.length),
    ...uint16LE(entries.length),
    ...uint32LE(centralDirectorySize),
    ...uint32LE(centralDirectoryOffset),
    ...uint16LE(0),
  ]);

  return new Blob([...zipParts, ...centralDirectoryParts, endOfCentralDirectory], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function buildRows(reviews: McrReview[]): ExportCell[][] {
  return [
    EXPORT_COLUMNS.map((column) => ({ type: 'inlineStr', value: column.header } as ExportCell)),
    ...reviews.map((review) =>
      EXPORT_COLUMNS.map((column) => {
        const value = column.value(review);
        return typeof value === 'number' && Number.isFinite(value)
          ? ({ type: 'n', value } as ExportCell)
          : ({ type: 'inlineStr', value: String(value ?? '') } as ExportCell);
      })
    ),
  ];
}

function buildColumnWidths(rows: ExportCell[][]): number[] {
  const widths = EXPORT_COLUMNS.map((column) => column.header.length);

  rows.slice(1).forEach((row) => {
    row.forEach((cell, index) => {
      const contentLength = String(cell.value ?? '').length;
      widths[index] = Math.max(widths[index], contentLength);
    });
  });

  return widths.map((length) => Math.max(length + 2, 8));
}

function cellXml(cell: ExportCell, rowIndex: number, columnIndex: number, isHeader: boolean): string {
  const ref = `${excelColumnName(columnIndex)}${rowIndex + 1}`;
  const styleAttr = isHeader ? ' s="1"' : '';

  if (cell.type === 'n') {
    return `<c r="${ref}"${styleAttr}><v>${cell.value}</v></c>`;
  }

  return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t xml:space="preserve">${escapeXml(String(cell.value ?? ''))}</t></is></c>`;
}

function buildWorksheetXml(rows: ExportCell[][]): string {
  const columnWidths = buildColumnWidths(rows);
  const lastColumn = excelColumnName(EXPORT_COLUMNS.length - 1);
  const lastRow = rows.length;

  const colsXml = columnWidths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" bestFit="1" customWidth="1"/>`
    )
    .join('');

  const rowsXml = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, columnIndex) => cellXml(cell, rowIndex, columnIndex, rowIndex === 0))
        .join('');
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
  <autoFilter ref="A1:${lastColumn}${lastRow}"/>
</worksheet>`;
}

function buildWorkbookFiles(rows: ExportCell[][]): Array<{ name: string; content: string }> {
  const createdAt = new Date().toISOString();
  return [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      name: 'docProps/app.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="1" baseType="lpstr">
      <vt:lpstr>MCR Reviews</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company>OpenAI</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0300</AppVersion>
</Properties>`,
    },
    {
      name: 'docProps/core.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>MCR</dc:creator>
  <cp:lastModifiedBy>MCR</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
  <dc:title>MCR Reviews Export</dc:title>
</cp:coreProperties>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews>
    <workbookView activeTab="0"/>
  </bookViews>
  <sheets>
    <sheet name="MCR Reviews" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    },
    {
      name: 'xl/styles.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font>
      <sz val="11"/>
      <color theme="1"/>
      <name val="Aptos"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="11"/>
      <color rgb="FF1E1B4B"/>
      <name val="Aptos"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`,
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      content: buildWorksheetXml(rows),
    },
  ];
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReviewsListToExcel(reviews: McrReview[], filenameBase = 'mcr-reviews-export'): void {
  const rows = buildRows(reviews);
  const files = buildWorkbookFiles(rows);
  const workbookBlob = createZip(files);
  triggerDownload(workbookBlob, `${filenameBase}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
