import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

export const cellItem = [
    {
        name: "time",
        header: "Time",
    },
    {
        name: "sourcePress",
        header: "Source Press.",
    },
    {
        name: "suctionPress",
        header: "Suction Press.",
    },
    {
        name: "dischargePress",
        header: "Discharge Press.",
    },
    {
        name: "speed",
        header: "Speed",
    },
    {
        name: "manifoldPress",
        header: "Manifold Press.",
    },
    {
        name: "oilPress",
        header: "Oil Press.",
    },
    {
        name: "oilDiff",
        header: "Oil Diff.",
    },
    {
        name: "runningHours",
        header: "Running Hours",
    },
    {
        name: "voltage",
        header: "Voltage",
    },
    {
        name: "waterTemp",
        header: "Water Temp",
    },
    {
        name: "dischargeTemp",
        header: "Discharge Temp",
        subheader: [
            {
                name: "befCooler",
                sub: "Bef. Cooler",
            },
            {
                name: "aftCooler",
                sub: "Aft. Cooler",
            },
        ],
    },
    {
        name: "staticPress",
        header: "Static Press. Reading",
    },
    {
        name: "diffPress",
        header: "Diff. Press. Reading",
    },
    {
        name: "flowRate",
        header: "Flowrate",
        subheader: [{ name: "mscfd", sub: "MSCFD" }],
    },
];

export const TimeInput = ({
    onChange,
    min = 0,
    max = 23,
    placeholder = "Enter time",
    value,
}) => {
    return (
        <input
            value={value}
            required
            name="time"
            type="time"
            onChange={onChange}
            min={min}
            max={max}
            placeholder={placeholder}
            className="border rounded p-2"
        />
    );
};

export const DateInput = ({ onChange, placeholder = "Enter Date", value }) => {
    return (
        <input
            required
            value={value}
            name="date"
            type="date"
            onChange={onChange}
            placeholder={placeholder}
            className="border rounded p-2"
        />
    );
};

export const generateExcel = (fileName, formData, checkedItems) => {
    const workbook = new ExcelJS.Workbook();
    const filteredData = formData.filter((item) => {
        const date = new Date(item.date);
        const formattedDate = getDDMMYYDate(date);
        return checkedItems.includes(formattedDate);
    });

    const dataByDate = filteredData.reduce((acc, curr) => {
        const date = curr.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
    }, {});

    Object.entries(dataByDate)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .forEach(([date, data]) => {
            const formattedDate = getDDMMYYDate(new Date(date));
            const sheetName = `Day ${formattedDate.split("/")[0]}`;
            const worksheet = workbook.addWorksheet(sheetName);

            const averages = getAvg(data, [data]);
            worksheet.addRow(["Date:", formattedDate]).font = {
                bold: true,
                size: 14,
            };
            worksheet.addRow([]);

            let headerRow1 = [];
            let headerRow2 = [];
            let mergeInfo = [];
            let colIndex = 1;

            cellItem.forEach((item) => {
                if (item.subheader) {
                    headerRow1.push(item.header);
                    if (colIndex < cellItem.length) headerRow1.push("");
                    mergeInfo.push({
                        start: colIndex,
                        end: colIndex + item.subheader.length - 1,
                    });

                    item.subheader.forEach((sub) => {
                        headerRow2.push(sub.sub);
                    });

                    colIndex += item.subheader.length - 1;
                } else {
                    headerRow1.push(item.header);
                    headerRow2.push("");
                    mergeInfo.push({ start: colIndex, end: colIndex });
                    colIndex += 1;
                }
            });

            const row1 = worksheet.addRow(headerRow1);
            const row2 = worksheet.addRow(headerRow2);

            mergeInfo.forEach((merge) => {
                if (merge.start !== merge.end) {
                    worksheet.mergeCells(3, merge.start, 3, merge.end);
                }
            });

            mergeInfo.forEach((merge, index) => {
                if (headerRow2[index] === "") {
                    worksheet.mergeCells(3, merge.start, 4, merge.end);
                }
            });

            row1.font = { bold: true, size: 12 };
            row2.font = { bold: true };

            worksheet.getRow(3).alignment = {
                horizontal: "center",
                vertical: "middle",
            };
            worksheet.getRow(4).alignment = {
                horizontal: "center",
                vertical: "middle",
            };

            data.forEach((value, index) => {
                worksheet.addRow([
                    value.time || `${index + 1}:00`,
                    value.sourcePress || 0.0,
                    value.suctionPress || 0.0,
                    value.dischargePress || 0.0,
                    value.speed || 0.0,
                    value.manifoldPress || 0.0,
                    value.oilPress || 0.0,
                    value.oilDiff || 0.0,
                    value.runningHours || 0.0,
                    value.voltage || 0.0,
                    value.waterTemp || 0.0,
                    value.befCooler || 0.0,
                    value.aftCooler || 0.0,
                    value.staticPress || 0.0,
                    value.diffPress || 0.0,
                    value.mscfd || 0.0,
                ]);
            });

            if (averages) {
                worksheet.addRow(["Average", ...Object.values(averages)]).font =
                    {
                        bold: true,
                    };
            }

            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell) => {
                    cell.alignment = {
                        horizontal: "center",
                        vertical: "middle",
                    };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });

                if (rowNumber === 3 || rowNumber === 4) {
                    row.eachCell((cell) => {
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "D3D3D3" },
                        };
                        cell.font = { bold: true };
                    });
                }
            });
        });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `${fileName}`);
    });
};

export const exportToExcel = (
    fileName = "Report.xlsx",
    formData,
    checkedItems
) => {
    const workbook = XLSX.utils.book_new();

    const filteredData = formData.filter((item) => {
        const date = new Date(item.date);
        const formattedDate = getDDMMYYDate(date);
        return checkedItems.includes(formattedDate);
    });

    const dataByDate = filteredData.reduce((acc, curr) => {
        const date = curr.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
    }, {});

    Object.entries(dataByDate).forEach(([date, data]) => {
        const averages = getAvg(data, [data]);
        const formattedDate = getDDMMYYDate(new Date(date));
        const tableHTML = generateTableHTML(
            formattedDate,
            cellItem,
            data,
            averages
        );

        const ws = XLSX.utils.table_to_sheet(
            new DOMParser().parseFromString(tableHTML, "text/html").body
                .firstChild
        );

        XLSX.utils.book_append_sheet(
            workbook,
            ws,
            "Day " + formattedDate.split("/")[0]
        );
    });

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(data, fileName);
};

export const generateTableHTML = (date, cellItem, currData, averages) => {
    let tableHTML = `
        <table class="table-container table">
            <thead>
                <tr>
                    <th>Date:</th>
                    <th class="date" id="date">${date}</th>
                </tr>
                <tr>
                    ${
                        cellItem &&
                        cellItem
                            .map(
                                (item) =>
                                    `<th ${
                                        !item.subheader ? 'rowspan="2"' : ""
                                    } colspan="${item.subheader?.length || 1}">
                                    ${item.header}
                                </th>`
                            )
                            .join("")
                    }
                </tr>
                <tr>
                    ${
                        cellItem &&
                        cellItem
                            .map((item) =>
                                item.subheader
                                    ? item.subheader
                                          .map((sub) => `<th>${sub.sub}</th>`)
                                          .join("")
                                    : ""
                            )
                            .join("")
                    }
                </tr>
            </thead>
            <tbody>
                ${currData
                    ?.map(
                        (value, index) => `
            <tr>
                <td class="table-content">${value.time || index + 1` : 00`}</td>
                <td class="table-content">${value.sourcePress || 0.0}</td>
                <td class="table-content">${value.suctionPress || 0.0}</td>
                <td class="table-content">${value.dischargePress || 0.0}</td>
                <td class="table-content">${value.speed || 0.0}</td>
                <td class="table-content">${value.manifoldPress || 0.0}</td>
                <td class="table-content">${value.oilPress || 0.0}</td>
                <td class="table-content">${value.oilDiff || 0.0}</td>
                <td class="table-content">${value.runningHours || 0.0}</td>
                <td class="table-content">${value.voltage || 0.0}</td>
                <td class="table-content">${value.waterTemp || 0.0}</td>
                <td class="table-content">${value.befCooler || 0.0}</td>
                <td class="table-content">${value.aftCooler || 0.0}</td>
                <td class="table-content">${value.staticPress || 0.0}</td>
                <td class="table-content">${value.diffPress || 0.0}</td>
                <td class="table-content">${value.mscfd || 0.0}</td>
            </tr>
        `
                    )
                    ?.join("")}

                ${
                    averages
                        ? `
                    <tr>
                        <th class="table-content">Average</th>
                        ${Object.keys(averages)
                            .filter(
                                (field) =>
                                    ![
                                        "time",
                                        "created_at",
                                        "updated_at",
                                        "date",
                                        "approval1",
                                        "approval2",
                                        "id",
                                    ].includes(field)
                            )
                            .map(
                                (field) =>
                                    `<th class="table-content">${averages[field]}</th>`
                            )
                            .join("")}
                    </tr>
                `
                        : ""
                }
            </tbody>
        </table>
    `;
    return tableHTML;
};

export const getDDMMYYDate = (date, format = null) => {
    let formattedDate;
    if (!format) {
        formattedDate = new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        }).format(date);
    }
    if (format === "YYYY-MM-DD") {
        formattedDate = date.toISOString().split("T")[0];
    }
    return formattedDate;
};

export const getDateLists = (currDate) => {
    const dateList = [];
    const currentYear = currDate.getFullYear();
    const currentMonth = currDate.getMonth();
    const currentDay = currDate.getDate();
    for (let day = 1; day <= currentDay; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const formattedDate = getDDMMYYDate(date);
        dateList.push(formattedDate);
    }
    return dateList;
};

export const getAvg = (data) => {
    if (!data || data.length === 0) return null;

    const fields = Object.keys(data[0]);

    // List of fields to exclude from averaging
    const excludeFields = [
        "time",
        "created_at",
        "updated_at",
        "date",
        "approval1",
        "approval2",
        "id",
    ];

    const fieldsToAvg = fields.filter(
        (field) => !excludeFields.includes(field)
    );

    const averages = fieldsToAvg.reduce((acc, field) => {
        const sum = data.reduce(
            (sumAcc, item) => sumAcc + (item[field] || 0),
            0
        );
        acc[field] = (sum / data.length).toFixed(2) || 0;
        return acc;
    }, {});

    return averages;
};
