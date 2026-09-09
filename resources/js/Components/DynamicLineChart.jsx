import { useState, useEffect, useMemo } from "react";
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
import {
    getAllUnits,
    getAreaReports,
    getAreas,
    getFields,
    getUnitReports,
} from "./db";
import LoadingSpinner from "./Loading";
import MultiSelectDropdown from "./MultiSelectDropdown";
import SelectSuggestion from "./SelectSuggestion";

const CURVE_FIELD = { name: "Curve", slug: "curve_24h" };
// performance_24h dihitung & disimpan di report.data bersamaan dengan curve/curve_24h
// (lihat DailyReportController::setReport), tapi tidak terdaftar di daily_fields -- tambahkan manual juga.
// Sama seperti Curve: cuma surface versi _24h-nya sebagai satu field "Performance".
const PERFORMANCE_FIELD = { name: "Performance", slug: "performance_24h" };

// Warna dipakai bergantian untuk tiap garis (field, atau unit x field kalau mode Area)
const LINE_COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ff7300",
    "#0088FE",
    "#FF8042",
    "#00C49F",
    "#FFBB28",
    "#a4de6c",
    "#d84dff",
    "#ff4d6d",
];

// Format Date -> "YYYY-MM-DD"
const toDateStr = (date) => date.toISOString().split("T")[0];

// Bikin daftar tanggal (YYYY-MM-DD) dari start s/d end, inklusif kedua ujung
const generateDateRange = (startStr, endStr) => {
    if (!startStr || !endStr) return [];
    const dates = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start) || isNaN(end) || start > end) return [];

    const current = new Date(start);
    while (current <= end) {
        dates.push(toDateStr(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
};

const generateFullHours = () => {
    const hours = [];
    for (let i = 1; i <= 24; i++) {
        hours.push(i.toString().padStart(2, "0") + ":00");
    }
    return hours;
};

const DynamicLineChart = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);

    const [allUnits, setAllUnits] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState("");
    const [selectedUnit, setSelectedUnit] = useState("");

    const today = new Date();
    const formattedToday = toDateStr(today);
    const [rangeStart, setRangeStart] = useState(formattedToday);
    const [rangeEnd, setRangeEnd] = useState(formattedToday);
    // Kalau bulan dipilih, ini yang dipakai (prioritas di atas range date)
    const [selectedMonth, setSelectedMonth] = useState("");

    const [selectedFields, setSelectedFields] = useState(["flowrate"]);

    // Hasil fetch: kalau mode unit cuma 1 entri, kalau mode area bisa banyak (1 per unit di area itu)
    const [seriesSources, setSeriesSources] = useState([]); // [{ unitPositionId, unitLabel, reportData, satuan }]

    // Area diisi -> tampilkan gabungan unit di area itu. Kalau tidak, pakai unit yang dipilih.
    const filterMode = selectedArea ? "area" : "unit";
    // Bulan dipilih -> pakai bulan itu (1 chart bulanan). Kalau tidak, pakai range date.
    const isMonthMode = Boolean(selectedMonth);

    const getFieldsData = async () => {
        setLoading(true);
        const respFields = await getFields();
        const formattedFields = respFields.flatMap((field) => {
            if (field.subfields && field.subfields.length > 0) {
                return field.subfields.map((sub) => ({
                    name: sub.name,
                    slug: sub.slug,
                }));
            } else {
                return {
                    name: field.name,
                    slug: field.slug,
                };
            }
        });
        setFields([...formattedFields, CURVE_FIELD, PERFORMANCE_FIELD]);
        setLoading(false);
    };

    const getAllUnitData = async () => {
        const units = await getAllUnits();
        setAllUnits(units || []);
    };

    const getAreaData = async () => {
        const areaResp = await getAreas();
        setAreas(areaResp || []);
    };

    useEffect(() => {
        getFieldsData();
        getAllUnitData();
        getAreaData();
    }, []);

    // Bangun parameter query tanggal: bulan diprioritaskan, kalau tidak pakai range date
    const dateParams = useMemo(() => {
        if (isMonthMode) {
            return { month: selectedMonth };
        }
        if (rangeStart && rangeEnd) {
            return { start: rangeStart, end: rangeEnd };
        }
        return null;
    }, [isMonthMode, selectedMonth, rangeStart, rangeEnd]);

    // Ambil data laporan sesuai mode filter + tanggal yang aktif
    useEffect(() => {
        const fetchSeries = async () => {
            if (!dateParams) return;

            if (filterMode === "unit") {
                if (!selectedUnit) {
                    setSeriesSources([]);
                    return;
                }
                setLoading(true);
                const resp = await getUnitReports(selectedUnit, dateParams);
                const parsed = (resp?.data || []).map((item) =>
                    typeof item === "string" ? JSON.parse(item) : item,
                );
                const unitLabel =
                    allUnits.find(
                        (u) =>
                            String(u.unit_position_id) ===
                            String(selectedUnit),
                    )?.unit || "Unit";
                setSeriesSources([
                    {
                        unitPositionId: selectedUnit,
                        unitLabel,
                        reportData: parsed,
                        satuan: resp?.satuan || {},
                    },
                ]);
                setLoading(false);
                return;
            }

            // filterMode === "area" -- 1 request untuk semua unit di area itu sekaligus,
            // bukan 1 request per unit (lihat DataUnitController::getAreaReports)
            setLoading(true);
            const resp = await getAreaReports(selectedArea, dateParams);
            const results = (resp?.units || []).map((unit) => ({
                unitPositionId: unit.unit_position_id,
                unitLabel: unit.unit,
                reportData: (unit.data || []).map((item) =>
                    typeof item === "string" ? JSON.parse(item) : item,
                ),
                satuan: unit.satuan || {},
            }));
            setSeriesSources(results);
            setLoading(false);
        };

        fetchSeries();
    }, [filterMode, selectedUnit, selectedArea, dateParams]);

    // Kalau range-nya cuma 1 hari (dan bukan mode bulan), tampilkan per jam. Selain itu per hari.
    const isHourlyBucket = !isMonthMode && rangeStart === rangeEnd;

    const dayBucketRange = useMemo(() => {
        if (isMonthMode && selectedMonth) {
            const [year, month] = selectedMonth.split("-").map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0);
            return generateDateRange(toDateStr(start), toDateStr(end));
        }
        if (!isHourlyBucket) {
            return generateDateRange(rangeStart, rangeEnd);
        }
        return [];
    }, [isMonthMode, selectedMonth, isHourlyBucket, rangeStart, rangeEnd]);

    // Ubah reportData 1 unit jadi baris-baris chart per bucket waktu, dengan prefix nama seri
    const buildSeriesRows = (reportData, seriesLabelFn) => {
        if (isHourlyBucket) {
            const fullHours = generateFullHours();
            const dataMap = {};
            reportData.forEach((item) => {
                dataMap[item.time] = item;
            });

            return fullHours.map((hour) => {
                const item = dataMap[hour];
                const values = {};
                selectedFields.forEach((slug) => {
                    values[seriesLabelFn(slug)] = item
                        ? Number(item[slug] || 0)
                        : 0;
                });
                return { bucket: hour, ...values };
            });
        }

        // Per hari: agregasi rata-rata kalau ada beberapa laporan di tanggal yang sama
        const byDate = {};
        reportData.forEach((item) => {
            if (!byDate[item.date]) byDate[item.date] = [];
            byDate[item.date].push(item);
        });

        return dayBucketRange.map((dateStr) => {
            const items = byDate[dateStr] || [];
            const values = {};
            selectedFields.forEach((slug) => {
                const nums = items.map((item) => Number(item[slug] || 0));
                values[seriesLabelFn(slug)] =
                    nums.length > 0
                        ? nums.reduce((a, b) => a + b, 0) / nums.length
                        : 0;
            });
            return { bucket: dateStr.slice(5), ...values };
        });
    };

    // Gabungkan seri dari semua sumber (1 unit, atau banyak unit kalau mode Area) jadi satu dataset chart
    const { chartData, lineDefs } = useMemo(() => {
        if (seriesSources.length === 0) {
            return { chartData: [], lineDefs: [] };
        }

        const isMultiSource = seriesSources.length > 1;
        const defs = [];
        let merged = null;

        seriesSources.forEach((source) => {
            const labelFn = (slug) => {
                const fieldName =
                    fields.find((f) => f.slug === slug)?.name || slug;
                return isMultiSource
                    ? `${source.unitLabel} - ${fieldName}`
                    : fieldName;
            };

            selectedFields.forEach((slug) => {
                const fieldName =
                    fields.find((f) => f.slug === slug)?.name || slug;
                const key = isMultiSource
                    ? `${source.unitLabel} - ${fieldName}`
                    : fieldName;
                defs.push({
                    key,
                    unitLabel: source.unitLabel,
                    fieldName,
                    satuan: source.satuan?.[slug] || "",
                    color: LINE_COLORS[defs.length % LINE_COLORS.length],
                });
            });

            const rows = buildSeriesRows(source.reportData, labelFn);

            if (!merged) {
                merged = rows;
            } else {
                merged = merged.map((row, idx) => ({
                    ...row,
                    ...rows[idx],
                }));
            }
        });

        return { chartData: merged || [], lineDefs: defs };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesSources, selectedFields, fields, isHourlyBucket, dayBucketRange]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-5 font-sans">
            {/* Filter Controls: range date, area, unit, field, month */}
            <div className="flex flex-wrap gap-5 mb-5">
                <div className="flex flex-col">
                    <label className="mb-1 font-bold">From:</label>
                    <input
                        type="date"
                        value={rangeStart}
                        disabled={isMonthMode}
                        onChange={(e) => setRangeStart(e.target.value)}
                        className="p-2 border rounded border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 font-bold">To:</label>
                    <input
                        type="date"
                        value={rangeEnd}
                        disabled={isMonthMode}
                        onChange={(e) => setRangeEnd(e.target.value)}
                        className="p-2 border rounded border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                </div>

                <div className="flex flex-col min-w-[180px]">
                    <label className="mb-1 font-bold">Area:</label>
                    <SelectSuggestion
                        name="area"
                        placeholder="-- No Area --"
                        options={areas.map((item) => ({
                            value: item.id,
                            label: item.area,
                        }))}
                        value={selectedArea}
                        onChange={setSelectedArea}
                    />
                </div>

                <div className="flex flex-col min-w-[180px]">
                    <label className="mb-1 font-bold">Unit:</label>
                    {filterMode === "area" ? (
                        <input
                            disabled
                            placeholder="Using Area filter"
                            className="p-2 border rounded border-gray-300 bg-gray-100 text-gray-400"
                        />
                    ) : (
                        <SelectSuggestion
                            name="unit"
                            placeholder="-- Select Unit --"
                            options={allUnits.map((item) => ({
                                value: item.unit_position_id,
                                label: item.unit,
                            }))}
                            value={selectedUnit}
                            onChange={setSelectedUnit}
                        />
                    )}
                </div>

                <div className="flex flex-col min-w-[220px]">
                    <label className="mb-1 font-bold">Fields:</label>
                    <MultiSelectDropdown
                        options={fields.map((item) => ({
                            value: item.slug,
                            label: item.name,
                        }))}
                        selected={selectedFields}
                        setSelected={setSelectedFields}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 font-bold">Month:</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 border rounded border-gray-300"
                    />
                </div>
            </div>

            {/* Line Chart */}
            <div className="w-full h-[400px] overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bucket" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {lineDefs.map((line) => (
                            <Line
                                key={line.key}
                                type="monotone"
                                dataKey={line.key}
                                name={
                                    line.satuan
                                        ? `${line.key} (${line.satuan})`
                                        : line.key
                                }
                                stroke={line.color}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Satuan bisa beda tiap unit/client -- ditampilkan di sini, bukan di 1 sumbu Y bersama */}
            {lineDefs.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {lineDefs.map((line) => (
                        <span
                            key={line.key}
                            className="flex items-center gap-1"
                        >
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: line.color }}
                            />
                            {line.key}
                            {line.satuan ? ` (${line.satuan})` : ""}
                        </span>
                    ))}
                </div>
            )}

            {seriesSources.length === 0 && !loading && (
                <p className="text-center text-gray-400 mt-4">
                    {filterMode === "unit"
                        ? "Select a unit to see the chart."
                        : "Select an area to see the chart."}
                </p>
            )}
        </div>
    );
};

export default DynamicLineChart;
