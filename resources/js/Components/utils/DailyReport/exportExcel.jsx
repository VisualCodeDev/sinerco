import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { chr } from "../dashboard-util";
import { ExcelStyle } from "./style";

export default async function ExportXlsm(fileName, data, range, unitData) {
    try {
        const workbook = new ExcelJS.Workbook();
        const fields = data.fields || [];
        const fieldUnits = unitData?.daily_report_setting.unitSetting || {};
        const numberFormat = "#,##0.00"; // ribuan (.) dan desimal (,)
        const fieldHeaderColumnMap = {};
        const fieldColumnMap = {};

        // Loop tiap tanggal
        for (const date of range) {
            const [year, month, day] = date.split("-");
            const formattedDate = `${day}/${month}/${year}`;
            const newSheet = workbook.addWorksheet(`Day ${day}`);
            let i = 0;

            // Buat header berdasarkan field
            fields.forEach((field) => {
                if (field.subfields && Number(field.subfields.length) > 0) {
                    const col = chr(Number(field.column) + i);
                    const stopCol = chr(
                        Number(field.column) +
                            i +
                            Number(field.subfields.length) -
                            1
                    );
                    console.log(col, stopCol);

                    fieldHeaderColumnMap[field.field_name] = `${col}2`;
                    fieldColumnMap[field.field_slug] = col;

                    newSheet.mergeCells(`${col}2:${stopCol}2`);
                    const mainCell = newSheet.getCell(`${col}2`);
                    mainCell.value = field.field_name;
                    mainCell.border = ExcelStyle.borderAll;
                    mainCell.alignment = {
                        horizontal: "center",
                        vertical: "middle",
                        wrapText: true,
                    };
                    mainCell.font = { bold: true };

                    // Subfields
                    field.subfields.forEach((sub, index) => {
                        const subCol = chr(Number(field.column) + index + i);
                        fieldHeaderColumnMap[sub.name] = `${subCol}3`;
                        fieldColumnMap[sub.slug] = subCol;

                        const subCell = newSheet.getCell(`${subCol}3`);
                        subCell.value = sub.name;
                        subCell.border = ExcelStyle.borderAll;
                        subCell.alignment = {
                            horizontal: "center",
                            vertical: "middle",
                            wrapText: true,
                        };
                        subCell.font = { bold: true };

                        const unitCell = newSheet.getCell(`${subCol}4`);
                        unitCell.value = fieldUnits[sub.slug] || "";
                        unitCell.border = ExcelStyle.borderAll;
                        unitCell.alignment = {
                            horizontal: "center",
                            vertical: "middle",
                            wrapText: true,
                        };
                        unitCell.font = { bold: true };
                    });

                    i += Number(field.subfields.length) - 1;
                } else {
                    const col = chr(Number(field.column) + i);
                    fieldHeaderColumnMap[field.field_name] = `${col}2`;
                    fieldColumnMap[field.field_slug] = col;

                    console.log(col, stopCol);

                    newSheet.mergeCells(`${col}2:${col}3`);
                    const fieldCell = newSheet.getCell(`${col}2`);
                    fieldCell.value = field.field_name;
                    fieldCell.border = ExcelStyle.borderAll;
                    fieldCell.alignment = {
                        horizontal: "center",
                        vertical: "middle",
                        wrapText: true,
                    };
                    fieldCell.font = { bold: true };

                    const unitCell = newSheet.getCell(`${col}4`);
                    unitCell.value = fieldUnits[field.field_slug] || "";
                    unitCell.border = ExcelStyle.borderAll;
                    unitCell.alignment = {
                        horizontal: "center",
                        vertical: "middle",
                        wrapText: true,
                    };
                    unitCell.font = { bold: true };
                }
            });

            const remarksStart = Object.keys(fieldHeaderColumnMap).length + 7;

            // Kolom waktu
            const timeCell = newSheet.getCell("A2");
            newSheet.mergeCells("A2:A4");
            timeCell.value = "Time";
            timeCell.border = ExcelStyle.borderAll;
            timeCell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            };
            timeCell.font = { bold: true };

            // Kolom Remarks
            const remarkCell = newSheet.getCell(
                `${chr(Object.keys(fieldHeaderColumnMap).length + 1)}2`
            );
            newSheet.mergeCells(
                `${chr(
                    Number(Object.keys(fieldHeaderColumnMap).length + 1)
                )}2:${chr(Object.keys(fieldHeaderColumnMap).length + 5)}4`
            );

            remarkCell.value = "Remarks";
            remarkCell.border = ExcelStyle.borderAll;
            remarkCell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            };
            remarkCell.font = { bold: true };

            // Isi jam di kolom A dan nilai default 0
            let hour = 1;
            for (let r = 5; r < 29; r++) {
                [1, remarksStart].map((cell) => {
                    const timeRowCell = newSheet.getRow(r).getCell(cell);
                    timeRowCell.border = ExcelStyle.borderAll;
                    timeRowCell.alignment = {
                        horizontal: "center",
                        vertical: "middle",
                        wrapText: true,
                    };
                    const time = `${String(hour).padStart(2, "0")}:00`;
                    if (!timeRowCell.value && timeRowCell.value !== 0)
                        timeRowCell.value = time;
                });
                hour++;
                for (
                    let c = 2;
                    c <= Object.keys(fieldHeaderColumnMap).length + 1;
                    c++
                ) {
                    const cell = newSheet.getRow(r).getCell(c);
                    cell.border = ExcelStyle.borderAll;
                    cell.alignment = {
                        horizontal: "center",
                        vertical: "middle",
                        wrapText: true,
                    };
                    // REMARKS COLOMN
                    if (c === Object.keys(fieldHeaderColumnMap).length + 1) {
                        newSheet.mergeCells(
                            `${chr(
                                Object.keys(fieldHeaderColumnMap).length + 1
                            )}${r}:${chr(
                                Object.keys(fieldHeaderColumnMap).length + 5
                            )}${r}`
                        );
                        continue;
                    }

                    if (!cell.value && cell.value !== 0) cell.value = 0;
                    // Format angka Indonesia
                    cell.numFmt = numberFormat;
                }
            }

            // Isi data
            const requestedData = [];
            const filtered = data.reports.filter((d) => d.date === date);
            Object.entries(filtered).forEach(([_, items]) => {
                const request = items?.request;
                if (items.request) {
                    const formattedRequest = {
                        time: items.time,
                        start: request.start_time || "",
                        end: request.end_time || "",
                        requestType: request.request_type.toUpperCase() || "",
                        remarks: request.remarks,
                    };
                    requestedData.push(formattedRequest);
                }
                Object.entries(items).forEach(([k, v]) => {
                    const formatted = fieldColumnMap[k];
                    const hour = Number(items.time.split(":")[0]);
                    if (formatted) {
                        const targetCell = newSheet.getCell(
                            `${formatted}${hour + 4}`
                        );
                        targetCell.value = Number(v) || 0;
                        targetCell.border = ExcelStyle.borderAll;
                        targetCell.alignment = {
                            horizontal: "center",
                            vertical: "middle",
                            wrapText: true,
                        };
                        // Format angka Indonesia
                        targetCell.numFmt = numberFormat;
                    }
                });
            });

            // Avg, Min, dan Max
            const avgRow = newSheet.getRow(29);
            const minRow = newSheet.getRow(30);
            const maxRow = newSheet.getRow(31);

            avgRow.getCell(1).value = "Average";
            minRow.getCell(1).value = "Min";
            maxRow.getCell(1).value = "Max";

            avgRow.getCell(1).font = { bold: true };
            minRow.getCell(1).font = { bold: true };
            maxRow.getCell(1).font = { bold: true };

            avgRow.getCell(1).border = ExcelStyle.borderAll;
            minRow.getCell(1).border = ExcelStyle.borderAll;
            maxRow.getCell(1).border = ExcelStyle.borderAll;

            Object.entries(fieldColumnMap).forEach(([_, col]) => {
                avgRow.getCell(col).value = {
                    formula: `IFERROR(ROUND(AVERAGE(${col}5:${col}28),2),"")`,
                    // formula: `AVERAGE(${col}5:${col}28)`,
                };
                minRow.getCell(col).value = {
                    formula: `IF(COUNT(${col}5:${col}28)>0,ROUND(MIN(${col}5:${col}28),2),"")`,
                    // formula: `MIN(${col}5:${col}28)`,
                };
                maxRow.getCell(col).value = {
                    formula: `IF(COUNT(${col}5:${col}28)>0,ROUND(MAX(${col}5:${col}28),2),"")`,
                    // formula: `MAX(${col}5:${col}28)`,
                };

                avgRow.getCell(col).font = { bold: true };
                minRow.getCell(col).font = { bold: true };
                maxRow.getCell(col).font = { bold: true };

                avgRow.getCell(col).border = ExcelStyle.borderAll;
                minRow.getCell(col).border = ExcelStyle.borderAll;
                maxRow.getCell(col).border = ExcelStyle.borderAll;

                avgRow.getCell(col).alignment = {
                    horizontal: "center",
                    vertical: "middle",
                    wrapText: true,
                };
                minRow.getCell(col).alignment = {
                    horizontal: "center",
                    vertical: "middle",
                    wrapText: true,
                };
                maxRow.getCell(col).alignment = {
                    horizontal: "center",
                    vertical: "middle",
                    wrapText: true,
                };

                // Format angka Indonesia
                avgRow.getCell(col).numFmt = numberFormat;
                minRow.getCell(col).numFmt = numberFormat;
                maxRow.getCell(col).numFmt = numberFormat;
            });

            // Tanggal & lokasi
            newSheet.getCell("K1").value = formattedDate;
            newSheet.getCell("O1").value = unitData?.location || "";

            newSheet.eachRow((r) => r.commit());

            // TABEL REMARKS
            const remarksHeader = [
                {
                    label: "SD / STDBY",
                    value: "requestType",
                },
                {
                    label: "Start",
                    value: "start",
                },
                {
                    label: "End",
                    value: "end",
                },
                {
                    label: "Standby",
                },
                {
                    label: "Down",
                },
                {
                    label: "REMARKS",
                    value: "remarks",
                },
            ];
            const headerStartCol = chr(remarksStart + 1);

            const headerCell = newSheet.getCell(`${headerStartCol}3`);
            headerCell.value = "REMARKS TIME";
            headerCell.font = { bold: true };
            headerCell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            };
            headerCell.border = ExcelStyle.borderAll;
            newSheet.mergeCells(
                `${headerStartCol}3:${chr(
                    remarksStart + remarksHeader.length - 1
                )}3`
            );

            const cellItems = [];
            remarksHeader.forEach((remark, index) => {
                const remarkCol = chr(remarksStart + 1 + index);
                const remarkCell = newSheet.getCell(`${remarkCol}4`);
                remarkCell.value = remark?.label;

                if (remark.label === "REMARKS") {
                    newSheet.getCell(`${remarkCol}3`).value = remark.label;
                    newSheet.mergeCells(`${remarkCol}3:${remarkCol}4`);
                }

                remarkCell.border = ExcelStyle.borderAll;
                remarkCell.font = { bold: true };
                remarkCell.alignment = {
                    horizontal: "center",
                    vertical: "middle",
                    wrapText: true,
                };
                const currCell = remarksStart + 1 + index;
                cellItems.push(chr(currCell));
                for (let r = 5; r < 29; r++) {
                    const cell = newSheet.getRow(r).getCell(currCell);

                    requestedData.forEach((req) => {
                        if (req.time === newSheet.getRow(r).getCell(1).value) {
                            cell.value = req[remark.value] || "";
                        }
                    });
                    cell.border = ExcelStyle.borderAll;
                    cell.alignment = {
                        horizontal: "center",
                        vertical: "middle",
                        wrapText: true,
                    };
                    if (remark.label === "REMARKS") {
                        cell.font = {
                            color: { argb: "FF0000FF" },
                        };
                    }
                }
            });

            const dataRemarksCol = Number(
                Object.keys(fieldHeaderColumnMap)?.length + 1
            );

            for (let r = 5; r < 29; r++) {
                const remarksDataForPrevTable = newSheet
                    .getRow(r)
                    .getCell(dataRemarksCol);

                remarksDataForPrevTable.value = {
                    formula: `IF(${cellItems[1]}${r}="",IF(${cellItems[5]}${r}="","",${cellItems[5]}${r}),CONCATENATE(TEXT(${cellItems[1]}${r},"[hh]:mm"),IF(${cellItems[2]}${r}="",""," - "&TEXT(${cellItems[2]}${r},"[hh]:mm")))&IF(${cellItems[0]}${r}="",""," "&${cellItems[0]}${r}&"/")&" "&${cellItems[5]}${r})`,
                };

                remarksDataForPrevTable.font = {
                    color: { argb: "FF0000FF" },
                };
            }
        }

        // Simpan file
        workbook.eachSheet((sheet) => {
            sheet.eachRow((row) => {
                row.eachCell((cell) => {
                    if (!cell.font) cell.font = {};
                    cell.font.name = "Arial";
                    cell.font.size = 10;
                });
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            fileName
        );
    } catch (err) {
        console.error("❌ Gagal ambil data:", err);
        throw err;
    }
}
