import PageLayout from "@/Layouts/PageLayout";
import React from "react";
import InputValidationSetting from "./InputValidationSetting";
import UnitInputIntervalSetting from "./UnitInputIntervalSetting";
import { FaClipboardCheck, FaStopwatch } from "react-icons/fa";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

const UnitSetting = () => {
    return (
        <PageLayout>
            <TabGroup>
                <TabList>
                    <Tab className=" aria-selected:bg-primary py-4 px-6 aria-selected:text-white rounded-t-md text-gray-500 font-semibold ">
                        <div className="flex justify-center items-center gap-2">
                            <FaClipboardCheck />
                            <p>Input Validation</p>
                        </div>
                    </Tab>
                    <Tab className=" aria-selected:bg-primary py-4 px-6 aria-selected:text-white rounded-t-md text-gray-500 font-semibold ">
                        <div className="flex justify-center items-center gap-2">
                            <FaStopwatch />
                            <p>Input Interval</p>
                        </div>
                    </Tab>
                </TabList>
                <TabPanels className={"p-6 bg-white border shadow-md"}>
                    <TabPanel>
                        <InputValidationSetting />
                    </TabPanel>
                    <TabPanel>
                        <UnitInputIntervalSetting />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </PageLayout>
    );
};

export default UnitSetting;
