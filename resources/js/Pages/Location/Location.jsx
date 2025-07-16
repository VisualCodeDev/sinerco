import TableComponent from "@/Components/TableComponent";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";

const Location = ({ data }) => {
    const [areas, setAreas] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [filteredLocation, setLocations] = useState([]);
    useEffect(() => {
        if (!data) return;

        const uniqueAreas = [
            ...new Map(data.map((item) => [item.area.id, item.area])).values(),
        ];
        setAreas(uniqueAreas);

        const filteredLocation = data?.filter(
            (item) =>
                item?.area?.id === (selectedAreas?.id || uniqueAreas[0]?.id)
        );
        setLocations(filteredLocation);
        console.log(selectedAreas);
    }, [data, selectedAreas]);

    console.log
    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row w-full h-full p-4 gap-4 min-h-[90vh]">
                {/* Area List Desktop*/}
                <div className="md:w-1/3 w-full bg-white shadow-md rounded-lg p-4 space-y-2 lg:md:block hidden">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                        Area
                    </h2>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {areas?.map((item) => (
                            <button
                                key={item?.id}
                                onClick={() => setSelectedAreas(item)}
                                className={`w-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 ${
                                    selectedAreas?.id === item?.id
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                                }`}
                            >
                                {item?.area}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Area List Mobile*/}
                <div className="md:w-1/3 w-full bg-white shadow-md rounded-lg p-4 space-y-2 lg:md:hidden block">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                        Area
                    </h2>
                    <div className="space-y-2 max-h-[10vh] relative">
                        <div onClick={() => setExpanded(!expanded)}>
                            {selectedAreas?.area || areas[0]?.area}
                        </div>
                        <div
                            className={`absolute top-5 left-0 max-h-[20vh] overflow-y-auto ${expanded ? 'block' : 'hidden'}`}
                        >
                            {areas?.map((item) => (
                                <button
                                    key={item?.id}
                                    onClick={() => {
                                        setSelectedAreas(item);
                                        setExpanded(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 ${
                                        selectedAreas?.id === item?.id
                                            ? "bg-blue-100"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    {item?.area}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Location List */}
                <div className="md:w-2/3 w-full bg-white shadow-md rounded-lg p-4 space-y-2">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                        Locations
                    </h2>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {filteredLocation?.length > 0 ? (
                            filteredLocation.map((item) => (
                                <div
                                    key={item?.id}
                                    className="px-4 py-2 rounded-md bg-blue-50 text-blue-800 font-medium shadow-sm"
                                >
                                    {item?.location}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">
                                No locations available.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Location;
