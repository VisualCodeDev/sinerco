import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { getAllUnits, getFields, getUnitReports } from "./db";
import { splitCamelCase } from "./utils/dashboard-util";
import LoadingSpinner from "./Loading";
import MultiSelectDropdown from "./MultiSelectDropdown";

const CURVE_FIELD = { name: "Curve", slug: "curve_24h" };

const LINE_COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ff7300",
    "#0088FE",
    "#FF8042",
    "#00C49F",
    "#FFBB28",
    "#a4de6c",
];

const DynamicLineChart = () => {
    const [fields, setFields] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allUnits, setAllUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(1); // default
    const [selectedFields, setSelectedFields] = useState(["flowrate"]); // default

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];

    const [selectedDate, setSelectedDate] = useState(formattedToday); // default
    const [selectedMonth, setSelectedMonth] = useState("");

    const generateFullDatesInMonth = (monthStr) => {
        // monthStr = "2025-12"
        const [year, month] = monthStr.split("-").map(Number);
        const date = new Date(year, month - 1, 1);
        const dates = [];

        while (date.getMonth() === month - 1) {
            const day = date.getDate().toString().padStart(2, "0");
            dates.push(`${year}-${month.toString().padStart(2, "0")}-${day}`);
            date.setDate(date.getDate() + 1);
        }
        return dates;
    };

    const fillMissingDates = (aggregatedData, monthStr, selectedFields) => {
        const fullDates = generateFullDatesInMonth(monthStr);

        // buat map: date => { field: value, ... }
        const dataMap = {};
        aggregatedData.forEach((item) => {
            dataMap[item.date] = item;
        });

        return fullDates.map((dateStr) => {
            const day = dateStr.split("-")[2];
            const item = dataMap[dateStr];
            const values = selectedFields.reduce((acc, field) => {
                acc[field] = item?.[field] ?? 0;
                return acc;
            }, {});
            return { date: day, ...values };
        });
    };

    const filterByDateOrMonth = (data) => {
        return data.filter((item) => {
            if (item?.date) {
                if (selectedDate) {
                    return item.date === selectedDate;
                } else if (selectedMonth) {
                    return item.date.startsWith(selectedMonth);
                }
            }
            return true;
        });
    };

    const generateFullHours = () => {
        const hours = [];
        for (let i = 1; i <= 24; i++) {
            hours.push(i.toString().padStart(2, "0") + ":00");
        }
        return hours;
    };

    const aggregatePerDay = (data, selectedFields) => {
        const map = {};

        data.forEach((item) => {
            if (!map[item.date]) map[item.date] = [];
            map[item.date].push(item);
        });

        return Object.keys(map)
            .map((date) => {
                const items = map[date];
                const day = date.split("-")[2];
                const values = selectedFields.reduce((acc, field) => {
                    const nums = items.map((item) => Number(item[field] || 0));
                    acc[field] =
                        nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
                    return acc;
                }, {});
                return { date, day, ...values };
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const fillMissingHours = (reportData, selectedFields) => {
        const fullHours = generateFullHours();

        const dataMap = {};
        reportData.forEach((item) => {
            dataMap[item.time] = item;
        });

        return fullHours.map((hour) => {
            const item = dataMap[hour];
            const values = selectedFields.reduce((acc, field) => {
                acc[field] = item ? Number(item[field] || 0) : 0;
                return acc;
            }, {});
            return { time: hour, ...values };
        });
    };

    const getAllUnitData = async () => {
        setLoading(true);
        const allUnits = await getAllUnits();
        setAllUnits(allUnits);
        setLoading(false);
    };

    const getSelectedUnitReports = async (unit_position_id) => {
        setLoading(true);
        const dataUnit = await getUnitReports(unit_position_id);
        const parsed = dataUnit.data.map((item) =>
            typeof item === "string" ? JSON.parse(item) : item,
        );
        setReportData(parsed);
        setLoading(false);
    };

    const getFieldsData = async () => {
        setLoading(true);
        const respFields = await getFields();
        const formattedFields = respFields.flatMap((field) => {
            if (field.subfields && field.subfields.length > 0) {
                // kalau ada subfields, ambil dari subfields
                return field.subfields.map((sub) => ({
                    name: sub.name,
                    slug: sub.slug,
                }));
            } else {
                // kalau ga ada subfields, ambil field itu sendiri
                return {
                    name: field.name,
                    slug: field.slug,
                };
            }
        });
        setFields([...formattedFields, CURVE_FIELD]);
        setLoading(false);
    };

    useEffect(() => {
        getFieldsData();
        getAllUnitData();
    }, []);

    useEffect(() => {
        getSelectedUnitReports(selectedUnit);
    }, [selectedUnit]);

    const chartData = selectedMonth
        ? fillMissingDates(
              aggregatePerDay(filterByDateOrMonth(reportData), selectedFields),
              selectedMonth,
              selectedFields,
          )
        : fillMissingHours(filterByDateOrMonth(reportData), selectedFields);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-5 font-sans">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-5 mb-5">
                {/* Choose Date */}
                <div className="flex flex-col">
                    <label className="mb-1 font-bold">Choose Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedMonth("");
                        }}
                        className="p-2 border rounded border-gray-300"
                    />
                </div>

                {/* Choose Month */}
                <div className="flex flex-col">
                    <label className="mb-1 font-bold">Choose Month:</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setSelectedDate("");
                        }}
                        className="p-2 border rounded border-gray-300"
                    />
                </div>

                {/* Choose Unit */}
                <div className="flex flex-col">
                    <label className="mb-1 font-bold">Choose Unit:</label>
                    <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="p-2 border rounded border-gray-300"
                    >
                        {allUnits &&
                            allUnits.map((item) => (
                                <option
                                    key={item.unit_position_id}
                                    value={item.unit_position_id}
                                >
                                    {item.unit}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Choose Field */}
                <div className="flex flex-col min-w-[220px]">
                    <label className="mb-1 font-bold">Choose Fields:</label>
                    <MultiSelectDropdown
                        options={fields.map((item) => ({
                            value: item.slug,
                            label: item.name,
                        }))}
                        selected={selectedFields}
                        setSelected={setSelectedFields}
                    />
                </div>
            </div>

            {/* Line Chart */}
            <div className="w-full h-[400px] overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={selectedMonth ? "date" : "time"} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedFields.map((slug, index) => (
                            <Line
                                key={slug}
                                type="monotone"
                                dataKey={slug}
                                name={
                                    fields.find((f) => f.slug === slug)
                                        ?.name || slug
                                }
                                stroke={
                                    LINE_COLORS[index % LINE_COLORS.length]
                                }
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DynamicLineChart;
