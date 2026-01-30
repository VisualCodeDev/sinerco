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

const DynamicLineChart = () => {
    const [fields, setFields] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allUnits, setAllUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(1); // default
    const [selectedField, setSelectedField] = useState("flowrate"); // default

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

    const fillMissingDates = (aggregatedData, monthStr) => {
        const fullDates = generateFullDatesInMonth(monthStr);

        // buat map: date => value
        const dataMap = {};
        aggregatedData.forEach((item) => {
            dataMap[item.date] = item.value;
        });

        return fullDates.map((dateStr) => {
            const day = dateStr.split("-")[2];
            return {
                date: day,
                value: dataMap[dateStr] ?? 0,
            };
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

    const aggregatePerDay = (data, selectedField) => {
        const map = {};

        data.forEach((item) => {
            if (!map[item.date]) map[item.date] = [];
            map[item.date].push(Number(item[selectedField] || 0));
        });

        return Object.keys(map)
            .map((date) => {
                const values = map[date];
                const avg = values.reduce((a, b) => a + b, 0) / values.length; // <--- pakai values.length
                const day = date.split("-")[2];
                return { date, day, value: avg };
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const fillMissingHours = (reportData, selectedField) => {
        const fullHours = generateFullHours();

        const dataMap = {};
        reportData.forEach((item) => {
            const time = item.time;
            dataMap[time] = Number(item[selectedField] || 0);
        });

        return fullHours.map((hour) => ({
            time: hour,
            value: dataMap[hour] ?? 0,
        }));
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
        setFields(formattedFields);
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
              aggregatePerDay(filterByDateOrMonth(reportData), selectedField),
              selectedMonth,
          )
        : fillMissingHours(filterByDateOrMonth(reportData), selectedField);

    if (loading) {
        return <LoadingSpinner />;
    }

    console.log(fields);
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
                <div className="flex flex-col">
                    <label className="mb-1 font-bold">Choose Field:</label>
                    <select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        className="p-2 border rounded border-gray-300"
                    >
                        {fields &&
                            fields.map((item) => (
                                <option value={item.slug}>{item?.name}</option>
                            ))}
                    </select>
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
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8884d8"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DynamicLineChart;
