import PageLayout from "@/Layouts/PageLayout";
import React from "react";
import InputValidationSetting from "./InputValidationSetting";
import UnitInputIntervalSetting from "./UnitInputIntervalSetting";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

const UnitSetting = () => {
    return (
        <PageLayout>
            <TabGroup>
                <TabList>
                    <Tab className="hover:underline aria-selected:bg-primary py-2 px-4 aria-selected:text-white rounded-t-2xl">
                        Input Validation
                    </Tab>
                    <Tab className="hover:underline aria-selected:bg-primary py-2 px-4 aria-selected:text-white rounded-t-2xl">
                        Input Interval
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
