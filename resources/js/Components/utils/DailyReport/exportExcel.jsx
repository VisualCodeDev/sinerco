import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default async function ExportXlsm(fileName, data, range, unitData) {
  try {
    const response = await fetch("/templates/TemplateDay.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const templateSheet = workbook.worksheets[0];
    if (!templateSheet) throw new Error("Template sheet tidak ditemukan");

    // Hapus sheet lain selain template
    workbook.worksheets.slice().forEach((sheet) => {
      if (sheet.id !== templateSheet.id) workbook.removeWorksheet(sheet.id);
    });

    // Fungsi copy merge
    const copyMerges = (src, dest) => {
      try {
        const merges =
          src.model?.merges && Array.isArray(src.model.merges)
            ? src.model.merges
            : src.model?.merges
            ? Object.keys(src.model.merges)
            : src.getMergedCells?.() || [];
        merges.forEach((rng) => dest.mergeCells(rng));
      } catch (e) {
        console.warn("⚠️ Gagal copy merges:", e);
      }
    };

    // Loop tiap tanggal
    for (const date of range) {
      const [year, month, day] = date.split("-");
      const formattedDate = `${day}/${month}/${year}`;
      const newSheet = workbook.addWorksheet(`Day ${day}`);

      // Copy seluruh isi template
      templateSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const newRow = newSheet.getRow(rowNumber);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const newCell = newRow.getCell(colNumber);
          newCell.style = { ...cell.style };
          newCell.value =
            cell.type === ExcelJS.ValueType.Formula
              ? { formula: cell.formula, result: cell.result ?? "" }
              : cell.value;
        });
        newRow.height = row.height;
        newRow.commit();
      });

      copyMerges(templateSheet, newSheet);

      // 🖼️ Copy gambar secara proporsional
      try {
        const images = templateSheet.getImages?.() || [];
        images.forEach((img) => {
          const media = workbook.model?.media?.find(
            (m) => m.index === img.imageId
          );
          if (!media?.buffer) return;

          const newImgId = workbook.addImage({
            buffer: media.buffer,
            extension: media.extension || "png",
          });

          // Gunakan posisi tl/br yang sudah ada biar proporsinya sama
          if (img.range?.tl && img.range?.br) {
            newSheet.addImage(newImgId, {
              tl: { ...img.range.tl },
              br: { ...img.range.br },
              editAs: img.range.editAs || "oneCell",
            });
          }
        });
      } catch (err) {
        console.error("⚠️ Gagal copy gambar:", err);
      }

      // Isi data
      const filtered = data.filter((d) => d.date === date);
      filtered.forEach((item) => {
        const row = Number(item?.time?.split(":")[0]) + 15;
        newSheet.getCell(`${item.cell}${row}`).value = item.value ?? 0;
      });

      // Default isi 0 (B16:R39)
      for (let r = 16; r <= 39; r++) {
        for (let c = 2; c <= 18; c++) {
          const cell = newSheet.getRow(r).getCell(c);
          if (!cell.value && cell.value !== 0) cell.value = 0;
        }
      }

      // Tanggal & lokasi
      newSheet.getCell("K12").value = formattedDate;
      newSheet.getCell("O12").value = unitData?.location || "";

      newSheet.eachRow((r) => r.commit());
    }

    workbook.removeWorksheet(templateSheet.id);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.ms-excel.sheet.macroEnabled.12",
      }),
      fileName
    );
  } catch (err) {
    console.error("❌ Gagal ambil data:", err);
    throw err;
  }
}
