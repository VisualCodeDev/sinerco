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
                    .filter(([key, value]) => {
                        // const date = new Date(value.date);
                        // const formattedDate = getDDMMYYDate(date);
                        // return formattedDate === selectedDate;
                        return value.date === selectedDate;
                    })
                    .map(([key, value]) => value);

                setCurrData(selectedDateItems);
            }
        }
    }, [selectedDate]);

    return (
        <div className="flex flex-col gap-3 relative overflow-scroll h-full">
            <div className="flex gap-3 sticky top-0 left-0 bg-white pb-2 w-full z-10">
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
            <table className="table-container table">
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
            </table>
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
