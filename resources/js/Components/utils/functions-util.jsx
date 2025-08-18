import dayjs from "dayjs";
import { formItems, requestStatus, requestType } from "./dashboard-util";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";

export const getRequestTypeName = (value) => {
    if (!value) return "";

    const found = requestType.find((item) => item.value === value);
    return found ? found.name : "RUNNING";
};

export const getRequestStatus = (value) => {
    if (!value) return "";

    const found = requestStatus.find((item) => item.value === value);
    return found ? found : value;
};

export const DateTimeInput = ({ value, name, handleChange }) => {
    return (
        <div className="flex items-center flex-wrap w-full">
            <input
                className="text-sm md:text-base"
                type="date"
                name={name?.date}
                value={value?.date}
                onChange={(e) => handleChange([e.target.name], e.target.value)}
            />
            <input
                className="text-sm md:text-base"
                type="time"
                name={name?.time}
                value={value?.time}
                onChange={(e) => handleChange([e.target.name], e.target.value)}
            />
        </div>
    );
};

export const TimeInput = ({
    formData,
    item,
    onChange,
    role,
    name = "time",
    min = 0,
    max = 23,
    placeholder = "Enter time",
    value,
    disabled = false,
    interval = 1,
    duration = 35,
}) => {
    const [now, setNow] = useState(null);
    const [time, setTime] = useState(0);
    const [minute, setMinute] = useState(0);

    useEffect(() => {
        const fetchTime = async () => {
            const { minute, hour, now } = await getCurrDateTime();
            setNow(now);
            setTime(hour);
            setMinute(minute);
        };

        fetchTime();
    }, []);
    const options = [];
    let permittedTime = time % interval === 0 ? time : time + (time % interval);
    if (minute > 35) {
        permittedTime = permittedTime + interval;
        if (permittedTime > 24) permittedTime = 0;
    }
    const filledFormTime =
        (Array.isArray(formData) &&
            formData
                ?.filter((data) => item?.date === data?.date)
                .map((data) => parseInt(data?.time.split(":")[0]))) ||
        [];

    // hanya untuk operator
    if (role === "operator") {
        for (let i = 0; i <= 24; i += parseInt(interval)) {
            const isNow = i === time;
            const isPermitted = isNow && minute <= duration;
            const alreadyFilled = filledFormTime.includes(i);

            if (isPermitted && !alreadyFilled) {
                console.log(i);
                options.push(
                    <option
                        key={i}
                        value={`${i.toString().padStart(2, "0")}:00`}
                    >
                        {i.toString().padStart(2, "0")}:00
                    </option>
                );
            }
        }
    } else if (role === "super_admin" || role === "technician") {
        for (let i = 1; i <= 24; i++) {
            if (!filledFormTime.includes(i)) {
                options.push(
                    <option
                        key={i}
                        value={`${i.toString().padStart(2, "0")}:00`}
                    >
                        {i.toString().padStart(2, "0")}:00
                    </option>
                );
            }
        }
    }

    return (
        <>
            <select
                className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                value={value}
                onChange={onChange}
                name={name}
                disabled={disabled}
            >
                {options}
            </select>
            <span className="text-sm text-slate-400">
                Available from {permittedTime}:00 to {permittedTime}:{duration}
            </span>
        </>
    );
};

export const DateInput = ({
    onChange,
    placeholder = "Enter Date",
    value,
    disabled = false,
}) => {
    return (
        <input
            required
            value={value}
            name="date"
            type="date"
            onChange={onChange}
            placeholder={placeholder}
            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
            disabled={disabled}
        />
    );
};

export const generateExcel = (fileName, formData, checkedItems) => {
    const workbook = new ExcelJS.Workbook();
    const filteredData = formData.filter((item) => {
        const date = new Date(item.date);
        const formattedDate = getDDMMYYDate(date, "YYYY-MM-DD");
        return checkedItems.includes(formattedDate);
    });
    console.log(filteredData);
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

            formItems.forEach((item) => {
                if (item.subheader) {
                    headerRow1.push(item.header);
                    if (colIndex < formItems.length) headerRow1.push("");
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
            formItems,
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

export const generateTableHTML = (date, formItems, currData, averages) => {
    let tableHTML = `
        <table class="table-container table">
            <thead>
                <tr>
                    <th>Date:</th>
                    <th class="date" id="date">${date}</th>
                </tr>
                <tr>
                    ${
                        formItems &&
                        formItems
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
                        formItems &&
                        formItems
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

const excludeFields = [
    "time",
    "created_at",
    "updated_at",
    "date",
    "id",
    "requestId",
    "request",
];

const getValidFields = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const fields = Object.keys(data[0]);
    return fields.filter((field) => !excludeFields.includes(field));
};

export const getAvg = (data) => {
    if (
        !Array.isArray(data) ||
        data.length === 0 ||
        typeof data[0] !== "object"
    )
        return null;

    const fieldsToAvg = getValidFields(data);

    const averages = fieldsToAvg.reduce((acc, field) => {
        const sum = data.reduce((sumAcc, item) => {
            const value = parseFloat(item[field]);
            return sumAcc + (isNaN(value) ? 0 : value);
        }, 0);
        acc[field] = (sum / data.length).toFixed(2);
        return acc;
    }, {});

    return averages;
};

export const getTotal = (data) => {
    if (
        !Array.isArray(data) ||
        data.length === 0 ||
        typeof data[0] !== "object"
    )
        return null;

    const fieldsToTotal = getValidFields(data);

    const totals = fieldsToTotal.reduce((acc, field) => {
        const sum = data.reduce((sumAcc, item) => {
            const value = parseFloat(item[field]);
            return sumAcc + (isNaN(value) ? 0 : value);
        }, 0);
        acc[field] = sum.toFixed(2);
        return acc;
    }, {});

    return totals;
};

export const getMinMax = (data) => {
    if (
        !Array.isArray(data) ||
        data.length === 0 ||
        typeof data[0] !== "object"
    )
        return null;

    const fieldsToCheck = getValidFields(data);

    const result = fieldsToCheck.reduce((acc, field) => {
        const values = data
            .map((item) => parseFloat(item[field]))
            .filter((v) => !isNaN(v));
        acc[field] = {
            min: Math.min(...values).toFixed(2),
            max: Math.max(...values).toFixed(2),
        };
        return acc;
    }, {});

    return result;
};

export const getFormattedDate = (value, format = "DD MMM YYYY") => {
    if (!value) return;
    return dayjs(value).format(format);
};
export const getCurrDateTime = async () => {
    try {
        const res = await fetch("/get/server-time");
        const { server_time } = await res.json();
        const now = dayjs(server_time);
        const rawTime = now.add(7, "hour");
        const date = rawTime.format("YYYY-MM-DD");
        const time = rawTime.format("HH:mm");
        const hour = parseInt(rawTime.hour());
        const minute = parseInt(rawTime.minute());

        return { date, time, now: rawTime, hour, minute };
    } catch (error) {
        console.error("Gagal ambil waktu server:", error);

        const now = dayjs();
        return {
            date: now.format("YYYY-MM-DD"),
            time: now.format("HH:mm"),
            now,
        };
    }
};

export const toCapitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const splitCamelCase = (str) => {
    const result = str
        .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
        .replace(/_/g, " ") // snake_case → snake case
        .replace(/^./, (c) => c.toUpperCase()); // kapitalisasi huruf pertama

    return result;
};

function ExcelImport() {
    const [users, setUsers] = useState([]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: "binary" });

            // Ambil sheet pertama
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convert ke JSON
            const data = XLSX.utils.sheet_to_json(sheet);

            // Contoh hasil [{ email: "", password: "", role: "" }, ...]
            console.log("Parsed data:", data);
            setUsers(data);
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
            />
            <h3>Imported Users:</h3>
            <ul>
                {users.map((user, idx) => (
                    <li key={idx}>
                        {user.email} | {user.password} | {user.role}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ExcelImport;
