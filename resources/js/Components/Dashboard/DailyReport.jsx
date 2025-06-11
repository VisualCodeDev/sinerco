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
import { FaPen } from "react-icons/fa";
import Modal from "../Modal";
import DailyReportForm from "./DailyReportForm";
import list from "../utils/DailyReport/columns";

const DailyReport = (props) => {
    const { formData, unitData } = props;
    const { user } = useAuth();
    const currDate = new Date();
    const [selectedDate, setSelectedDate] = useState(
        getDDMMYYDate(currDate, "YYYY-MM-DD")
    );
    const [isClicked, setClick] = useState(false);
    const [isEditModal, setEditModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [dataAll, setData] = useState(formData);

    const [currData, setCurrData] = useState(null);
    const averages = useMemo(() => getAvg(currData), [currData]);
    const prevDateList = getDateLists(currDate);
    const handleSelectDate = (e) => {
        const newSelectedDate = e.target.value;
        setSelectedDate(newSelectedDate);
    };
    const sortedObjectByTime = (obj) => {
        const sortedItemByTime = Object.entries(dataAll)
            .filter(([, value]) => value.date === selectedDate)
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
            if (selectedDate) {
                const sortedData = sortedObjectByTime(dataAll);
                setCurrData(sortedData);
            }
        }
    }, [selectedDate]);
    useEffect(() => {
        if (dataAll) {
            const sortedData = sortedObjectByTime(dataAll);
            setCurrData(sortedData);
        }
    }, [dataAll]);

    const handleEdit = (key) => {
        const data = dataAll[key];
        setEditModal(true);
        setSelectedData(data);
    };
    return (
        <div className="bg-white flex flex-col p-10 overflow-scroll h-full w-full">
            {unitData && (
                <>
                    <div className="text-center w-full flex flex-col gap-2">
                        <p className="text-2xl font-bold">
                            {unitData.unit?.unit}
                        </p>
                        <p className="text-sm">{unitData.area}</p>
                        <p className="text-sm">{unitData.location}</p>
                    </div>
                </>
            )}
            <div className="flex gap-3 sticky top-0 left-0 pb-2 w-full z-10">
                <div className="flex gap-2 items-center">
                    <p>Date:</p>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleSelectDate(e)}
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
                <button onClick={() => setClick(true)}>Export</button>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="min-w-[900px] w-full table-auto border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            {formItems?.map((item, index) => (
                                <th
                                    key={index}
                                    className="px-4 py-2 text-sm font-semibold border border-gray-300 text-left"
                                    rowSpan={!item.subheader ? 2 : undefined}
                                    colSpan={item.subheader?.length}
                                >
                                    {item.header}
                                </th>
                            ))}
                            {user?.role === "super_admin" && (
                                <th
                                    rowSpan={2}
                                    className="px-4 py-2 text-sm font-semibold border border-gray-300 text-left"
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
                                        className="px-4 py-2 text-sm font-semibold border border-gray-300 text-left"
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
                                    className="odd:bg-white even:bg-gray-50"
                                >
                                    <td className="px-4 py-2 border">
                                        {value.time}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.sourcePress}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.suctionPress}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.dischargePress}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.speed}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.manifoldPress}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.oilPress}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.oilDiff}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.runningHours}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.voltage}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.waterTemp}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.befCooler}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.aftCooler}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.staticPress}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.diffPress}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {value.mscfd}
                                    </td>
                                    {user?.role === "super_admin" && (
                                        <td
                                            className="flex justify-center items-center px-4 py-2 border cursor-pointer"
                                            onClick={() => handleEdit(key)}
                                        >
                                            <FaPen />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        {averages && (
                            <tr className="bg-slate-100 sticky bottom-0 left-0 z-10">
                                <th className="px-4 py-2 border">Average</th>
                                {Object.keys(averages).map((field, index) =>
                                    [
                                        "time",
                                        "created_at",
                                        "updated_at",
                                        "date",
                                        "approval1",
                                        "approval2",
                                        "id",
                                    ].includes(field) ? null : (
                                        <th
                                            key={index}
                                            className="px-4 py-2 border"
                                        >
                                            {averages[field]}
                                        </th>
                                    )
                                )}
                                {user?.role === "super_admin" && (
                                    <th className="px-4 py-2 text-sm font-semibold border border-gray-300 text-left"></th>
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

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]  ">
            <Card>
                <Card.Header>Export to Excel</Card.Header>
                <Card.Body>
                    <div>Select Date to Export:</div>
                    <div className="flex gap-1 items-center">
                        <input
                            type="checkbox"
                            value="all"
                            checked={isAllChecked}
                            onChange={handleSelectAll}
                        />
                        <span>Select All</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                        {list.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1"
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
                    </div>
                    <button
                        onClick={
                            () =>
                                generateExcel("Report.xlsx", data, checkedItems)
                            // exportToExcel("Report.xlsx", data, checkedItems)
                        }
                    >
                        Export to Excel
                    </button>
                </Card.Body>
                <Card.Footer>
                    <button
                        onClick={() => setClick(false)}
                        className="font-bold w-full h-full"
                    >
                        Tutup
                    </button>
                </Card.Footer>
            </Card>
        </div>
    );
};

const EditModal = (props) => {
    const { setEditModal, isEditModal, data, formData, unitData, setData } =
        props;
    const [formDataState, setFormDataState] = useState(formData);
    const handleChange = ([field], value) => {
        setFormDataState({ ...formDataState, [field]: value });
    };
    const formList = list({
        handleChange: handleChange,
        formData: formDataState,
        reportSettings: unitData?.daily_report_setting,
    });
    const handleSubmit = () => {
        if (formDataState) {
            const updatedItems = data.map((item) =>
                item.id === formDataState.id
                    ? { ...item, ...formDataState }
                    : item
            );
            setData(updatedItems);
        }
    };
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
                    className="bg-primary text-white font-bold w-full h-full"
                    onClick={handleSubmit}
                >
                    Simpan
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default DailyReport;
