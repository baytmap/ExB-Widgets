import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DejaVuFont } from "../fonts/dejavu-font";

export const exportToExcel = (data: any[]) => {
  if (!data || data.length === 0) return;

  const formattedData = data.map((item, index) => ({
    "#": index + 1,
    "Abone No": item.abone_no,
    Adı: item.adi,
    Soyadı: item.soyadi,
    "Dış Kapı No": item.dis_kapi_no,
    "İç Kapı No": item.ic_kapi_no,
    "Cadde/Sokak": item.sokak,
    Mahalle: item.mahalle,
    İlçe: item.ilce,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Abone");

  XLSX.writeFile(workbook, "Abone_Listesi.xlsx");
};

export const exportToPDF1 = async (data: any[]) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
  });

  doc.addFileToVFS("DejaVuSans.ttf", DejaVuFont);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.setFont("DejaVu");

  const tableColumn = [
    "#",
    "Abone No",
    "Adı",
    "Soyadı",
    "Dış Kapı No",
    "İç Kapı No",
    "Cadde/Sokak",
    "Mahalle",
    "İlçe",
  ];

  const tableRows = data.map((item, index) => [
    index + 1,
    normalizeTurkish(item.abone_no),
    normalizeTurkish(item.adi),
    normalizeTurkish(item.soyadi),
    normalizeTurkish(item.dis_kapi_no),
    normalizeTurkish(item.ic_kapi_no),
    normalizeTurkish(item.sokak),
    normalizeTurkish(item.mahalle),
    normalizeTurkish(item.ilce),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    styles: {
      font: "DejaVu",
      fontStyle: "normal",
      fontSize: 10,
    },
    headStyles: {
      font: "DejaVu",
      fontStyle: "normal",
    },
  });

  doc.save("Abone_Listesi.pdf");
};

export const exportToPDF2 = async (data: any[], ic_kapi_no: any) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();

  doc.addFileToVFS("DejaVuSans.ttf", DejaVuFont);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.setFont("DejaVu");

  const tableColumn = [
    "#",
    "Abone No",
    "Okuma Tarihi",
    "İç Kapı No",
    "Sayac Durumu",
    "Dönem",
    "Tüketim (m³)",
    "Tutar (TL)",
  ];

  const tableRows = data.map((item, index) => [
    index + 1,
    normalizeTurkish(item.abone_no),
    normalizeTurkish(item.okuma_tarihi),
    normalizeTurkish(ic_kapi_no),
    normalizeTurkish(item.sayac_durum),
    normalizeTurkish(item.donem),
    normalizeTurkish(item.tuk_m3),
    normalizeTurkish(item.toplam_tutar),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    styles: {
      font: "DejaVu",
      fontStyle: "normal",
      fontSize: 10,
    },
    headStyles: {
      font: "DejaVu",
      fontStyle: "normal",
    },
  });

  doc.save("Abone_Döküm_Listesi.pdf");
};

export function normalizeTurkish(value: any): string {
  if (value === null || value === undefined) return "";

  const text = String(value);

  const map: Record<string, string> = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    İ: "I",
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };

  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => map[c]);
}
