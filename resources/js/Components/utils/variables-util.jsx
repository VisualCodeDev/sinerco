export const formItems = [
    {
        name: "time",
        header: "Time",
    },
    {
        name: "sourcePress",
        default: {
            decimalSetting: "1",
        },
        header: "Source Press.",
    },
    {
        name: "suctionPress",
        default: {
            decimalSetting: "1",
            minSetting: -9,
            maxSetting: 60,
        },
        header: "Suction Press.",
    },
    {
        name: "dischargePress",
        default: {
            decimalSetting: "1",
            minSetting: 0,
            maxSetting: 400,
        },
        header: "Discharge Press.",
    },
    {
        name: "speed",
        default: {
            decimalSetting: "0",
            minSetting: 1500,
            maxSetting: 2200,
        },
        header: "Speed",
    },
    {
        name: "manifoldPress",
        default: {
            decimalSetting: "1",
            minSetting: -6,
            maxSetting: -2,
        },
        header: "Manifold Press.",
    },
    {
        name: "oilPress",
        default: {
            decimalSetting: "1",
            minSetting: 30,
            maxSetting: 70,
        },
        header: "Oil Press.",
    },
    {
        name: "oilDiff",
        default: {
            decimalSetting: "1",
        },
        header: "Oil Diff.",
    },
    {
        name: "runningHours",
        default: {
            decimalSetting: "0",
        },
        header: "Running Hours",
    },
    {
        name: "voltage",
        default: {
            decimalSetting: "1",
            minSetting: 27,
            maxSetting: 28,
        },
        header: "Voltage",
    },
    {
        name: "waterTemp",
        default: {
            decimalSetting: "1",
            minSetting: -194,
        },
        header: "Water Temp",
    },
    {
        name: "dischargeTemp",

        header: "Discharge Temp",
        subheader: [
            {
                name: "befCooler",
                sub: "Bef. Cooler",
                default: {
                    minSetting: 350,
                    decimalSetting: "1",
                },
            },
            {
                name: "aftCooler",
                sub: "Aft. Cooler",
                default: {
                    minSetting: 120,
                    decimalSetting: "1",
                },
            },
        ],
    },
    {
        name: "staticPress",
        default: {
            decimalSetting: "1",
        },
        header: "Static Press. Reading",
    },
    {
        name: "diffPress",
        default: {
            decimalSetting: "1",
        },
        header: "Diff. Press. Reading",
    },
    {
        name: "flowRate",
        default: {
            decimalSetting: "6",
        },
        header: "Flowrate",
        subheader: [{ name: "mscfd", sub: "MSCFD" }],
    },
];

export const unitStatus = [
    {
        name: "Online",
        value: "online",
    },
    {
        name: "Shut Down",
        value: "sd",
    },
    {
        name: "Stand By",
        value: "stdby",
    },
];

export const requestType = [
    {
        name: "Stand By",
        value: "stdby",
    },
    {
        name: "Shut Down",
        value: "sd",
    },
];

export const requestStatus = [
    {
        name: "Pending",
        value: "Pending",
        color: "#d9534f",
    },
    {
        name: "On Going",
        value: "Ongoing",
        color: "#f0ad4e",
    },
    { name: "End", value: "End", color: "#5cb85c" },
];

export const editRequestItems = [
    {
        name: "Start Date Time",
        value: { date: "startDate", time: "startTime" },
        type: "dateTime",
        isInput: true,
    },
    {
        name: "Request",
        value: "requestType",
        type: "text",
        isInput: false,
    },

    {
        name: "End Date Time",
        value: { date: "endDate", time: "endTime" },
        type: "dateTime",
        isInput: true,
    },

    {
        name: "Status",
        value: "status",
        type: "option",
        options: requestStatus,
        isInput: true,
    },
    {
        name: "Remarks",
        value: "remarks",
        type: "text",
        isInput: true,
    },
];
