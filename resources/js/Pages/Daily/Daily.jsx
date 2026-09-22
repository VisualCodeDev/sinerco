import { useAuth } from "@/Components/Auth/auth";
import DailyReport from "@/Components/Dashboard/DailyReport";
import DailyReportForm from "@/Components/Dashboard/DailyReportForm";
import UnitTable from "@/Components/Dashboard/UnitTable";
import LoadingSpinner from "@/Components/Loading";
import StatusPill from "@/Components/StatusPill";
import {
    generatePrevHour,
    generateFullDayHours,
    getCurrDateTime,
    getDDMMYYDate,
} from "@/Components/utils/dashboard-util";
import { fetch } from "@/Components/utils/database-util";
import PageLayout from "@/Layouts/PageLayout";
import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsGear } from "react-icons/bs";
import {
    FaRegFileAlt,
    FaRegCalendarAlt,
    FaAngleDown,
    FaAngleUp,
    FaFileContract,
    FaLock,
} from "react-icons/fa";
import UnitInfo from "../Unit/UnitInfo";
import ContractTab from "@/Components/Dashboard/ContractTab";
import { getUnitField } from "@/Components/db";

export default function Dashboard({ unit_position_id }) {
    const { user, loading: userLoding } = useAuth();
    const [currDate, setCurrDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [lastReport, setLastReport] = useState({});
    const [unitData, setUnitData] = useState({});
    const [isUnitRunning, setIsUnitRunning] = useState(true);
    const [clientName, setClientName] = useState();
    const [fields, setFields] = useState([]);
    const { data: allUnits, loading: isLoading, error } = fetch("unit.get");

    const [expanded, setExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState(
        user?.role === "technician" || user?.role === "operator"
            ? "form"
            : "report",
    );

    useEffect(() => {
        setActiveTab(
            user?.role === "technician" || user?.role === "operator"
                ? "form"
                : "report",
        );
    }, [user]);

    const tabs = [
        {
            key: "unit_information",
            label: "Unit Information",
            icon: <BsGear className="mr-2" />,
            condition: user?.role === "technician" ||
                user?.role === "super_admin" ||
                user?.role === "operator",
        },
        {
            key: "report",
            label: "Daily Report",
            icon: <FaRegCalendarAlt className="mr-2" />,
            condition: true,
        },
        {
            key: "form",
            label: "Fill Report",
            icon: <FaRegFileAlt className="mr-2" />,
            condition:
                user?.role === "technician" ||
                user?.role === "super_admin" ||
                user?.role === "operator",
        },
      
        {
            key: "gasComposition",
            label: "Gas Composition",
            icon: <FaRegCalendarAlt className="mr-2" />,
            condition: true,
        },
        {
            key: "contract",
            label: "Contract",
            icon: <FaFileContract className="mr-2" />,
            condition: true,
        },
       
    ];

    const timeToMinutes = (t) => {
        if (!t) return null;
        const [h, m] = t.split(":").map(Number);
        return h * 60 + (m || 0);
    };

    // Tempel `activeRequest` (SD/STDBY yang overlap tanggal ini, dikirim
    // backend TERPISAH dari baris report -- lihat getDataReportBasedOnDate) ke
    // SETIAP baris grid waktu hari ini yang JATUH DI DALAM jendela start-end
    // hari ini -- termasuk baris placeholder (jam yang sama sekali belum
    // pernah diisi laporan). Bukan blanket ke semua baris tanpa lihat jam:
    // kalau request-nya cuma 1 hari (atau ini hari mulai/akhirnya) dengan
    // start/end time yang lebih sempit dari 00:00-24:00 (mis. mulai 18:00
    // berakhir 22:00), jam SEBELUM start atau SESUDAH end hari itu TIDAK
    // boleh ikut ditandai.
    const withActiveRequest = (rows, activeRequest, date) => {
        if (!activeRequest) return rows;

        const isStartDay = activeRequest.start_date === date;
        const isEndDay = activeRequest.end_date === date;
        const dayStart = isStartDay ? activeRequest.start_time || "00:00" : "00:00";
        const dayEnd = isEndDay ? activeRequest.end_time || "24:00" : "24:00";
        const startMin = timeToMinutes(dayStart);
        const endMin = timeToMinutes(dayEnd);

        return rows.map((row) => {
            if (row.request) return row;
            const rowMin = timeToMinutes(row.time);
            if (rowMin === null || rowMin < startMin || rowMin > endMin) {
                return row;
            }
            return { ...row, request: activeRequest };
        });
    };

    const setInitReport = async (reportData, gmt_offset, interval, activeRequest) => {
        // 2 grid berbeda dengan tujuan berbeda:
        // - fullDayGrid: SEMUA waktu sesuai interval sepanjang hari (dipakai buat
        //   FILTER data asli -- laporan yang beneran ada isinya, mis. diisi lebih
        //   awal/backdated ke jam 12:00, harus tetap tampil walau jam
        //   real-time sekarang belum sampai situ).
        // - hoursUpToNow: cuma sampai jam sekarang (dipakai buat nentuin jam MANA
        //   YANG KOSONG perlu di-padding "0" -- jam yang belum lewat sengaja tidak
        //   ikut di-padding supaya tabel tidak penuh baris "0" duluan sebelum
        //   waktunya).
        const fullDayGrid = generateFullDayHours(interval);
        const hoursUpToNow = await generatePrevHour(gmt_offset, interval);

        // Cuma tampilkan waktu yang sesuai grid interval client -- laporan lama
        // yang kebetulan tersimpan di jam lain (misal sisa dari sebelum
        // interval-nya di-set ke 3 jam) sengaja TIDAK ikut ditampilkan, bukan
        // cuma ditambah gridnya di atasnya.
        const filteredReportData = (reportData || []).filter((r) =>
            fullDayGrid.includes(r.time),
        );
        const reportTimes = filteredReportData.map((r) => r.time);
        const missingHours = hoursUpToNow.filter((h) => !reportTimes.includes(h));
        const formattedData = missingHours.map((time) => ({
            time,
            unit_position_id,
            date: selectedDate,
            ...fields.reduce((acc, field) => {
                acc[field.slug] = 0;
                return acc;
            }, {}),
        }));
        const finalReportData = withActiveRequest(
            [...filteredReportData, ...formattedData].sort(
                (a, b) =>
                    parseInt(a.time.split(":")[0], 10) -
                    parseInt(b.time.split(":")[0], 10),
            ),
            activeRequest,
            selectedDate,
        );

        setData(finalReportData);
    };

    const setInitPrevReport = async (reportData, interval, activeRequest) => {
        // Sebelumnya selalu 24 baris per jam tanpa peduli interval client --
        // jadi tanggal lampau/mendatang selalu nampilin 1:00, 2:00, dst walau
        // setting client-nya per 3 jam. Samakan dengan setInitReport (hari ini):
        // cuma tampilkan waktu yang sesuai grid interval, laporan lama di jam
        // lain sengaja tidak ikut ditampilkan.
        const fullDay = generateFullDayHours(interval);
        const filteredReportData = (reportData || []).filter((r) =>
            fullDay.includes(r.time),
        );
        const reportTimes = filteredReportData.map((r) => r.time);

        const missingHours = fullDay.filter((h) => !reportTimes.includes(h));
        const formattedData = missingHours.map((time) => ({
            time,
            unit_position_id,
            date: selectedDate,
            ...fields.reduce((acc, field) => {
                acc[field.slug] = 0;
                return acc;
            }, {}),
        }));
        const finalReportData = withActiveRequest(
            [...filteredReportData, ...formattedData].sort(
                (a, b) =>
                    parseInt(a.time.split(":")[0], 10) -
                    parseInt(b.time.split(":")[0], 10),
            ),
            activeRequest,
            selectedDate,
        );
        setData(finalReportData);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reportData, unit] = await Promise.all([
                axios.get(
                    route("getDataReportBasedOnDate", {
                        unit_position_id: unit_position_id,
                        date: selectedDate,
                    }),
                ),
                axios.get(
                    route("getSelectedUnit", {
                        unit_position_id: unit_position_id,
                    }),
                ),
            ]);

            setUnitData(unit?.data);
            setClientName(unit?.data?.client || "");

            await initCurrDate(
                reportData?.data?.reports,
                unit?.data?.gmt_offset,
                unit?.data?.input_interval,
                reportData?.data?.request,
            );
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const initCurrDate = async (reportData, gmt_offset, interval, activeRequest) => {
        setLoading(true);
        const { date } = await getCurrDateTime(gmt_offset);
        setCurrDate(new Date(date));
        setSelectedDate(date);

        await setInitReport(reportData, gmt_offset, interval, activeRequest);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!currDate) return;
        if (selectedDate === getDDMMYYDate(currDate, "YYYY-MM-DD")) {
            fetchData();
            return;
        }
        const changeReportData = async () => {
            setLoading(true);
            try {
                const reportData = await axios.get(
                    route("getDataReportBasedOnDate", {
                        unit_position_id: unit_position_id,
                        date: selectedDate,
                    }),
                );
                // Tanggal lampau maupun akan datang: tetap tampilkan grid waktu
                // penuh sesuai interval client (bukan 24 baris per jam / tabel
                // kosong total kalau belum ada laporan).
                await setInitPrevReport(
                    reportData?.data?.reports,
                    unitData?.input_interval,
                    reportData?.data?.request,
                );
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        changeReportData();
    }, [selectedDate]);

    useEffect(() => {
        if (data?.length > 0) setLastReport(data[data?.length - 1]);
    }, [data]);

    useEffect(() => {
        if (!unitData?.status) return;
        const status = unitData?.status === "running" ? true : false;

        const getFields = async () => {
            if (!unitData?.unit_id) return;
            try {
                setLoading(true);
                const data = await getUnitField(unitData?.unit_id)
                const visibleFields = data
                    .map((field) => {
                        if (
                            Array.isArray(field.subfields) &&
                            field.subfields.length > 0
                        ) {
                            const visibleSubfields = field.subfields.filter(
                                (sub) =>
                                    unitData.visibilitySetting[sub.slug] ?? true,
                            );
                            if (visibleSubfields.length === 0) return null;
                            return {
                                ...field,
                                subfields: visibleSubfields,
                            };
                        }
                        return (unitData.visibilitySetting[field.slug] ?? true)
                            ? field
                            : null;
                    })
                    .filter(Boolean);

                    setFields(visibleFields);
            } catch (error) {
                console.error(
                    "Gagal mengambil field:",
                    error.response?.data || error,
                );
            }
            setLoading(false);
        };
        getFields();
        setIsUnitRunning(status);
    }, [unitData]);

    return (
        <PageLayout>
            {(userLoding ||
                isLoading ||
                !data ||
                !allUnits ||
                !unitData ||
                !clientName ||
                loading) && <LoadingSpinner />}
            <div className="flex relative z-0">
                <div className="w-full h-full flex flex-col">
                    {/* TABS DASHBOARD */}
                    <div className="flex overflow-x-auto">
                        {tabs.map(
                            ({ key, label, icon, condition }) =>
                                condition && (
                                    <div
                                        key={key}
                                        className={`flex justify-center items-center px-4 py-2 whitespace-nowrap ${
                                            activeTab === key
                                                ? "bg-primary rounded-tr-lg rounded-tl-lg text-white"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {icon}
                                        <button
                                            className={`py-2 font-semibold border border-transparent bg-transparent ${
                                                activeTab === key
                                                    ? ""
                                                    : "text-gray-500"
                                            }`}
                                            onClick={() => setActiveTab(key)}
                                        >
                                            {label}
                                        </button>
                                    </div>
                                ),
                        )}
                    </div>

                    {/* TABS CONTENT */}
                    <div className="flex flex-col border-t-2 border-t-primary shadow-xl">
                        {unitData && (
                            <>
                                <div className="text-center w-full flex flex-col items-center md:gap-1 gap-1 md:py-8 py-6 bg-primary text-white">
                                    <div className="text-xl md:text-2xl font-bold bg-primary flex justify-center items-center">
                                        <div
                                            className="cursor-pointer flex items-center gap-2  relative"
                                            onClick={() =>
                                                setExpanded(!expanded)
                                            }
                                        >
                                            {unitData?.info?.name || unitData?.unit}
                                            <div className="text-xs">
                                                <StatusPill
                                                    request_type={
                                                        unitData?.status
                                                    }
                                                />
                                            </div>
                                            {expanded ? (
                                                <FaAngleUp />
                                            ) : (
                                                <FaAngleDown />
                                            )}
                                            <div
                                                className={`absolute z-[100] bg-white text-gray-400 font-semibold text-start text-base w-full min-w-[250px] top-10 left-0 max-h-[20vh] overflow-y-auto ${
                                                    expanded
                                                        ? "block"
                                                        : "hidden"
                                                }`}
                                            >
                                                {allUnits &&
                                                    allUnits?.length > 0 &&
                                                    allUnits?.map((item) => (
                                                        <div
                                                            className="py-2 px-2 flex items-center justify-between text-xs cursor-pointer"
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() =>
                                                                router.visit(
                                                                    route(
                                                                        "daily",
                                                                        item?.unit_position_id,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <p className="text-base">
                                                                {item?.unit}
                                                            </p>
                                                            <StatusPill
                                                                request_type={
                                                                    item?.status
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="">
                                        <p className="md:text-base text-xs font-semibold">
                                            {unitData?.area}
                                        </p>
                                        <p className="md:text-sm text-xs m-0 p-0">
                                            {unitData.location}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "unit_information" && (
                            <UnitInfo
                                setUnitData={setUnitData}
                                unitId={unitData?.unit_id}
                                unitData={unitData}
                            />
                        )}

                        {activeTab === "form" && (
                            <DailyReportForm
                                visibilitySetting={unitData?.visibilitySetting}
                                lastReport={lastReport}
                                fields={fields}
                                isDown={!isUnitRunning}
                                clientData={clientName}
                                interval={unitData?.input_interval}
                                gmt_offset={unitData?.gmt_offset || 7}
                                disableDuration={unitData?.disable_duration}
                                duration={
                                    unitData?.disable_duration
                                        ? 59
                                        : unitData?.input_duration
                                }
                                user={user}
                                unitData={unitData}
                                formData={data}
                            />
                        )}

                        {activeTab === "report" && (
                            <DailyReport
                                visibilitySetting={unitData?.visibilitySetting}
                                fields={fields}
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                                formData={data}
                                unitData={unitData}
                                user={user}
                            />
                        )}

                        {activeTab === "contract" && (
                            <ContractTab unitPositionId={unit_position_id} />
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
