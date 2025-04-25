import Card from "@/Components/Card";
import PageLayout from "@/Layouts/PageLayout";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Welcome({ data }) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(flash.status || []);
    const [isModal, setModal] = useState(false);
    const [selectedItem, setItem] = useState(false);
    const handleSelect = (itemData) => {
        setModal(true);
        setItem(itemData);
    };

    useEffect(() => {
        setStatus(flash.status);
    }, [flash.status]);

    console.log(status)

    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => {
                setStatus([]);
            }, 1000);
            flash.status = "";
            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <PageLayout>
            <div className="">
                <a href="/dashboard">Dashboard</a>
            </div>
            <div>
                <a href="/request">Request</a>
            </div>

            <Card>
                <Card.Header>Request List</Card.Header>
                <Card.Body className="relative">
                    <div className="flex text-center">
                        {status && (
                            <div
                                className={`${
                                    status == "success"
                                        ? "bg-green-300"
                                        : status == "failed" && "bg-red-300"
                                } absolute top-0 left-1/2 -translate-x-1/2 px-5 py-2`}
                            >
                                {status === "success" ? (
                                    <div className="text-black">
                                        Request has been Updated
                                    </div>
                                ) : (
                                    status === "failed" && (
                                        <div className="text-white">
                                            Request Failed
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                        <table className="w-1/2">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Date</th>
                                    <th>Request</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data != ''
                                    ? data.map((item, index) => (
                                          <tr key={index}>
                                              <td>{index + 1}</td>
                                              <td>{item.date}</td>
                                              <td>
                                                  {item?.requestType === "stdby"
                                                      ? "STAND BY"
                                                      : item?.requestType ===
                                                            "sd" && "SHUT DOWN"}
                                              </td>
                                              <td>
                                                  {item.timeStart || item.time}
                                              </td>
                                              <td>{item.timeEnd || "-"}</td>
                                              <td>{item.status}</td>
                                              <td>
                                                  <button
                                                      className="bg-gray-100 px-3 py-1 border-2"
                                                      onClick={() =>
                                                          handleSelect(item)
                                                      }
                                                  >
                                                      Edit Item
                                                  </button>
                                              </td>
                                          </tr>
                                      ))
                                    : "No Request"}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>
            {isModal && <Modal data={selectedItem} setModal={setModal} />}
        </PageLayout>
    );
}

const Modal = ({ data, setModal }) => {
    const {
        data: formData,
        setData,
        post,
    } = useForm({
        id: data?.requestId || "",
        timeEnd: data?.timeEnd || "",
        status: data?.status || "",
    });

    const handleChange = ([field], value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };
    const handleSave = async () => {
        // await axios.post("/request/update", formData);
        post("/request/update", formData);
        setModal(false);
    };

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Card>
                <Card.Header>Edit Request</Card.Header>
                <Card.Body>
                    <div className="grid grid-cols-2 gap-5 w-[600px]">
                        <div>
                            <p>Date</p>
                        </div>
                        <div>
                            <p>{data.date}</p>
                        </div>

                        <div>
                            <p>Request</p>
                        </div>
                        <div>
                            <p>
                                {data?.requestType === "stdby"
                                    ? "STAND BY"
                                    : data?.requestType === "sd" && "SHUT DOWN"}
                            </p>
                        </div>

                        <div>
                            <p>Time Start</p>
                        </div>
                        <div>
                            <p>{data.timeStart}</p>
                        </div>

                        <div className="flex items-center">
                            <p>Time End</p>
                        </div>
                        <div>
                            <input
                                type="time"
                                value={formData?.timeEnd || ""}
                                onChange={(e) =>
                                    handleChange(["timeEnd"], e.target.value)
                                }
                            />
                        </div>

                        <div className="flex items-center">
                            <p>Status</p>
                        </div>
                        <div>
                            <select
                                value={formData?.status || data.status || ""}
                                onChange={(e) =>
                                    handleChange(["status"], e.target.value)
                                }
                            >
                                <option value={"Pending"}>Pending</option>
                                <option value={"Ongoing"}>On going</option>
                                <option value={"Done"}>Done</option>
                            </select>
                        </div>
                    </div>
                </Card.Body>
                <Card.Footer>
                    <div className="flex justify-between">
                        <button onClick={() => setModal(false)}>Cancel</button>
                        <button onClick={() => handleSave()}>Save</button>
                    </div>
                </Card.Footer>
            </Card>
        </div>
    );
};
