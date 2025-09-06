import { useEffect, useMemo, useRef, useState } from "react";
import {
    formItems,
    exportToExcel,
    generateExcel,
    getAvg,
    getDateLists,
    getDDMMYYDate,
    getFormattedDate,
    DateInput,
    TimeInput,
} from "../utils/dashboard-util";
import Card from "../Card";
import { useAuth } from "../Auth/auth";
import { FaPen, FaFileExport } from "react-icons/fa";
import Modal from "../Modal";
import DailyReportForm from "./DailyReportForm";
import list from "../utils/DailyReport/columns";
import axios from "axios";
import LoadingSpinner from "../Loading";

const DailyReport = (props) => {
    const { formData, unitData, user, setSelectedDate, selectedDate } = props;
    const currDate = new Date();

    const [isClicked, setClick] = useState(false);
    const [isEditModal, setEditModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [dataAll, setData] = useState(formData);

    const [currData, setCurrData] = useState(null);
    const averages = useMemo(() => getAvg(currData), [currData]);
    const prevDateList = getDateLists(currDate);

    const sortedObjectByTime = (obj) => {
        const sortedItemByTime = Object.entries(dataAll)
            .map(([, value]) => value)
            .sort((a, b) => {
                const hourA = parseInt(a.time.split(":")[0]);
                const hourB = parseInt(b.time.split(":")[0]);
                return hourA - hourB;
            });
        return sortedItemByTime;
    };

    useEffect(() => {
        if (dataAll) {
            const sortedData = sortedObjectByTime(dataAll);
            setCurrData(sortedData);
        }
    }, [dataAll]);
    const handleEdit = (id) => {
        const data = dataAll.find((item) => item?.id === id);
        setEditModal(true);
        setSelectedData(data);
    };

    useEffect(() => {
        setCurrData(formData);
    }, [formData]);

    return (
        <div className="bg-white flex flex-col py-10 px-6 md:p-10 overflow-scroll h-full w-full">
            <div className="flex gap-4 md:gap-6 sticky top-0 left-0 pb-2 w-full z-10 mb-4">
                <div className="flex gap-2 items-center">
                    <p className="font-semibold text-lg">Date:</p>
                    <input
                        className="rounded-full py-1 px-3"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    {/* <select
                        onChange={(e) => handleSelectDate(e)}
                        value={selectedDate}
                    >
                        {prevDateList.map((items, index) => (
                            <option key={index} value={items}>
                                {items}
                            </option>
                        ))}
                    </select> */}
                </div>
                <div className="flex items-center justify-center md:gap-2 bg-secondary/90 hover:bg-secondary text-white px-4 rounded-full transition ease-in-out delay-75 hover:scale-95">
                    <FaFileExport />
                    <button onClick={() => setClick(true)}>
                        {" "}
                        <p className="md:block hidden">Export</p>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="min-w-[900px] w-full table-auto border-collapse">
                    <thead className="bg-primary text-white text-center">
                        <tr>
                            {formItems?.map((item, index) => (
                                <th
                                    key={index}
                                    className="px-4 py-2 text-sm font-semibold border border-black text-center"
                                    rowSpan={!item.subheader ? 2 : undefined}
                                    colSpan={item.subheader?.length}
                                >
                                    {item.header}
                                </th>
                            ))}
                            {user?.role === "super_admin" && (
                                <th
                                    rowSpan={2}
                                    className="px-4 py-2 text-sm font-semibold border border-black text-left text-center"
                                >
                                    Edit
                                </th>
                            )}
                        </tr>
                        <tr>
                            {formItems?.map((item) =>
                                item.subheader?.map((sub, index) => (
                                    <th
                                        key={index}
                                        className="px-4 py-2 text-sm font-semibold border border-black text-left"
                                    >
                                        {sub.sub}
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {currData &&
                            Object.entries(currData).map(([key, value]) => (
                                <tr
                                    key={key}
                                    className="odd:bg-white even:bg-gray-50 hover:bg-slate-50 cursor-pointer transition duration-75"
                                    onClick={() => handleEdit(value.id)}
                                >
                                    {formItems
                                        ?.filter(
                                            (item) => item?.name != "remarks"
                                        )
                                        .map((item) =>
                                            item?.subheader?.length > 0 ? (
                                                item.subheader.map((sub) => (
                                                    <td className="px-4 py-2 border text-center">
                                                        {value?.[sub?.name]}
                                                    </td>
                                                ))
                                            ) : (
                                                <td className="px-4 py-2 border text-center">
                                                    {value?.[item?.name]}
                                                </td>
                                            )
                                        )}
                                    <td className="px-4 py-2 border text-center">
                                        {value?.request && value?.request?.remarks}
                                    </td>
                                    {user?.role === "super_admin" && (
                                        <>
                                            <td
                                                className="flex justify-center items-center px-4 py-2 cursor-pointer"
                                                onClick={() =>
                                                    handleEdit(value.id)
                                                }
                                            >
                                                <FaPen />
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        {averages && (
                            <tr className="bg-slate-100 sticky bottom-0 left-0 z-10 w-full">
                                <th className="px-4 py-2 border">Average</th>
                                {Object.keys(averages).map((field, index) =>
                                    [
                                        "time",
                                        "created_at",
                                        "updated_at",
                                        "date",
                                        "request_id",
                                        "request",
                                        "id",
                                    ].includes(field) ? null : (
                                        <th
                                            key={index}
                                            className="px-4 py-2 border"
                                        >
                                            {averages[field] || ""}
                                        </th>
                                    )
                                )}
                                <th className="px-4 py-2 text-sm font-semibold border text-left"></th>
                                {user?.role === "super_admin" && (
                                    <th className="px-4 py-2 text-sm font-semibold border text-left"></th>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isClicked && (
                <ExportModal
                    list={prevDateList}
                    setClick={setClick}
                    // data={currData}
                    data={dataAll}
                    averages={averages}
                />
            )}
            {isEditModal && (
                <EditModal
                    role={user.role}
                    setClick={setEditModal}
                    setEditModal={setEditModal}
                    isEditModal={isEditModal}
                    formData={selectedData}
                    setData={setData}
                    unitData={unitData}
                    data={dataAll}
                />
            )}
        </div>
    );
};

const ExportModal = (props) => {
    const { setClick, list, data } = props;
    const [isAllChecked, setIsAllChecked] = useState(false);
    const [checkedItems, setCheckedItems] = useState([]);
    const [selectedDate, setSelectedDate] = useState({
        start: "",
        end: "",
    });

    useEffect(() => {
        if (checkedItems.length === list.length) {
            setIsAllChecked(true);
        } else {
            setIsAllChecked(false);
        }
    }, [checkedItems, list.length]);

    const handleSelectAll = () => {
        setIsAllChecked(!isAllChecked);
        if (!isAllChecked) {
            setCheckedItems(list);
        } else {
            setCheckedItems([]);
        }
    };

    const handleCheckboxChange = (item) => {
        if (checkedItems.includes(item)) {
            setCheckedItems(checkedItems.filter((i) => i !== item));
        } else {
            setCheckedItems([...checkedItems, item]);
        }
    };

    const handleSelectDate = (field, item) => {
        setSelectedDate({ ...selectedDate, [field]: item });
    };

    const getDateRange = (start, end) => {
        const dateArray = [];
        let currentDate = new Date(start);
        const endDate = new Date(end);

        while (currentDate <= endDate) {
            dateArray.push(currentDate.toISOString().split("T")[0]); // format YYYY-MM-DD
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dateArray;
    };

    const handleGenerate = () => {
        const range = getDateRange(selectedDate.start, selectedDate.end);
        generateExcel("Report.xlsx", data, range);
    };

    return (
        <div className="bg-primary w-[80%] md:w-1/3 rounded-xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]  ">
            <Card>
                <Card.Header>Export to Excel</Card.Header>
                <Card.Body>
                    <div className="font-semibold mb-4 text-center">
                        <p>Select Date to Export:</p>
                    </div>
                    <div className="flex gap-3 items-center justify-center mb-5">
                        <input
                            className="rounded-full py-1 px-3"
                            type="date"
                            value={selectedDate?.start}
                            onChange={(e) =>
                                handleSelectDate(["start"], e.target.value)
                            }
                        />
                        -
                        <input
                            className="rounded-full py-1 px-3"
                            type="date"
                            value={selectedDate?.end}
                            onChange={(e) =>
                                handleSelectDate(["end"], e.target.value)
                            }
                        />
                    </div>
                    {/* <div className="flex gap-1 items-center">
                        <input
                            type="checkbox"
                            value="all"
                            checked={isAllChecked}
                            onChange={handleSelectAll}
                        />
                        <span>Select All</span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2 mb-6">
                        {list.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1 md:text-md text-sm"
                            >
                                <input
                                    type="checkbox"
                                    value={item}
                                    checked={checkedItems.includes(item)}
                                    onChange={() => handleCheckboxChange(item)}
                                />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div> */}
                    <div className="flex items-center place-self-center w-fit gap-2 bg-secondary text-white px-4 py-1 rounded-full transition ease-in-out delay-75 hover:scale-95">
                        <FaFileExport />
                        <button
                            onClick={
                                () => handleGenerate()
                                // exportToExcel("Report.xlsx", data, checkedItems)
                            }
                        >
                            Export to Excel
                        </button>
                    </div>
                </Card.Body>
                <Card.Footer>
                    <button
                        onClick={() => setClick(false)}
                        className="font-semibold w-full h-full text-white"
                    >
                        Tutup
                    </button>
                </Card.Footer>
            </Card>
        </div>
    );
};

const EditModal = (props) => {
    const {
        setEditModal,
        isEditModal,
        data,
        formData,
        unitData,
        setData,
        role,
    } = props;
    const [formDataState, setFormDataState] = useState(formData);
    const [loading, setLoading] = useState(false);
    const handleChange = ([field], value) => {
        setFormDataState({ ...formDataState, [field]: value });
    };
    const formList = list({
        handleChange: handleChange,
        formData: formDataState,
        reportSettings: unitData?.daily_report_setting,
    });
    const handleSubmit = async () => {
        if (formDataState) {
            setLoading(true);
            try {
                const resp = await axios.post(
                    route("report.edit", unitData?.unitAreaLocationId, data)
                );
                const updatedItems = data.map((item) =>
                    item.id === formDataState.id
                        ? { ...item, ...formDataState }
                        : item
                );
                setData(updatedItems);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };
    if (loading) {
        return <LoadingSpinner text="Saving" />;
    }
    return (
        <Modal
            title="Edit Report"
            handleCloseModal={() => setEditModal(false)}
            showModal={isEditModal}
        >
            <Modal.Body>
                <form>
                    <div className="flex flex-col mb-4">
                        <label
                            htmlFor={"date"}
                            className="font-medium text-md mb-1.5"
                        >
                            Date
                        </label>
                        <DateInput
                            disabled
                            id={"date"}
                            className="w-full bg-[#F4F5F9]"
                            name={"date"}
                            value={formDataState?.date || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                    <div className="flex flex-col mb-4">
                        <label
                            htmlFor={"time"}
                            className="font-medium text-md mb-1.5"
                        >
                            Time
                        </label>
                        <TimeInput
                            formData={formData}
                            disabled
                            id={"time"}
                            role={role}
                            name={"time"}
                            value={formDataState?.time || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-8 mb-4 items-end">
                        {formList
                            .filter(
                                (item) =>
                                    item?.name !== "time" &&
                                    item?.name !== "date"
                            )
                            .map((item) => (
                                <div
                                    key={item.header}
                                    style={{
                                        gridColumn: "span " + item.gridCols,
                                    }}
                                >
                                    {typeof item.Cell === "function"
                                        ? item.Cell(
                                              {
                                                  item: formDataState,
                                                  header: item.header,
                                                  name: item.name,
                                                  subheader:
                                                      item?.subheader || [],
                                              } || ""
                                          )
                                        : item.Cell}
                                </div>
                            ))}
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <button
                    className="bg-primary text-white font-semibold w-full h-full"
                    onClick={handleSubmit}
                >
                    Simpan
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default DailyReport;
