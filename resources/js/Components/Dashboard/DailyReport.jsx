import { useEffect, useMemo, useRef, useState } from "react";
import {
    cellItem,
    exportToExcel,
    generateExcel,
    getAvg,
    getDateLists,
    getDDMMYYDate,
} from "../utils/dashboard-util";
import Card from "../Card";

const DailyReport = ({ formData }) => {
    const currDate = new Date();
    const [selectedDate, setSelectedDate] = useState(
        getDDMMYYDate(currDate, "YYYY-MM-DD")
    );
    const [isClicked, setClick] = useState(false);
    const [currData, setCurrData] = useState(null);
    const averages = useMemo(() => getAvg(currData), [currData]);
    const prevDateList = getDateLists(currDate);
    const handleSelectDate = (e) => {
        const newSelectedDate = e.target.value;
        setSelectedDate(newSelectedDate);
    };

    useEffect(() => {
        if (formData) {
            if (selectedDate) {
                const selectedDateItems = Object.entries(formData)
                    .filter(([key, value]) => value.date === selectedDate)
                    .map(([_, value]) => value)
                    .sort((a, b) => {
                        const toMinutes = (timeStr) => {
                            const [hour, minute] = timeStr
                                .split(":")
                                .map(Number);
                            return hour * 60 + minute;
                        };
                        return toMinutes(a.time) - toMinutes(b.time);
                    });

                setCurrData(selectedDateItems);
            }
        }
    }, [selectedDate]);

    return (
        <div className="bg-white flex flex-col p-10 overflow-scroll h-full w-full">
            <div className="flex gap-3 sticky top-0 left-0 pb-2 w-full z-10">
                <div className="flex gap-2 items-center">
                    <th>Date:</th>
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
            {/* <table className="table-container table">
                <thead>
                    <tr>
                        {cellItem &&
                            cellItem.map((item, index) => (
                                <th
                                    key={index}
                                    className="table-content"
                                    rowSpan={!item.subheader ? 2 : undefined}
                                    colSpan={item.subheader?.length}
                                >
                                    {item.header}
                                </th>
                            ))}
                    </tr>
                    <tr>
                        {cellItem &&
                            cellItem.map((item) =>
                                item.subheader?.map((sub, index) => (
                                    <th key={index} className="table-content">
                                        {sub.sub}
                                    </th>
                                ))
                            )}
                    </tr>
                </thead>
                <tbody>
                    {currData &&
                        Object.entries(currData).map(([key, value]) => (
                            <>
                                <tr key={key}>
                                    <td className="table-content">
                                        {value.time}
                                    </td>
                                    <td className="table-content">
                                        {value.sourcePress}
                                    </td>
                                    <td className="table-content">
                                        {value.suctionPress}
                                    </td>
                                    <td className="table-content">
                                        {value.dischargePress}
                                    </td>
                                    <td className="table-content">
                                        {value.speed}
                                    </td>
                                    <td className="table-content">
                                        {value.manifoldPress}
                                    </td>
                                    <td className="table-content">
                                        {value.oilPress}
                                    </td>
                                    <td className="table-content">
                                        {value.oilDiff}
                                    </td>
                                    <td className="table-content">
                                        {value.runningHours}
                                    </td>
                                    <td className="table-content">
                                        {value.voltage}
                                    </td>
                                    <td className="table-content">
                                        {value.waterTemp}
                                    </td>
                                    <td className="table-content">
                                        {value.befCooler}
                                    </td>
                                    <td className="table-content">
                                        {value.aftCooler}
                                    </td>
                                    <td className="table-content">
                                        {value.staticPress}
                                    </td>
                                    <td className="table-content">
                                        {value.diffPress}
                                    </td>
                                    <td className="table-content">
                                        {value.mscfd}
                                    </td>
                                </tr>
                            </>
                        ))}
                    {averages && (
                        <tr className="bg-slate-100 sticky bottom-0 left-0">
                            <th className="table-content">Average</th>
                            {Object.keys(averages).map((field, index) => (
                                <>
                                    {field === "time" ||
                                    field === "created_at" ||
                                    field === "updated_at" ||
                                    field === "date" ||
                                    field === "approval1" ||
                                    field === "approval2" ||
                                    field === "id" ? null : (
                                        <th
                                            className="table-content"
                                            key={index}
                                        >
                                            {averages[field]}
                                        </th>
                                    )}
                                </>
                            ))}
                        </tr>
                    )}
                </tbody>
            </table> */}
            <div className="overflow-x-auto w-full">
                <table className="min-w-[900px] w-full table-auto border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            {cellItem?.map((item, index) => (
                                <th
                                    key={index}
                                    className="px-4 py-2 text-sm font-semibold border border-gray-300 text-left"
                                    rowSpan={!item.subheader ? 2 : undefined}
                                    colSpan={item.subheader?.length}
                                >
                                    {item.header}
                                </th>
                            ))}
                        </tr>
                        <tr>
                            {cellItem?.map((item) =>
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
                    data={formData}
                    averages={averages}
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

export default DailyReport;
