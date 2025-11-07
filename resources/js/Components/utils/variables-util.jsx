export const formItems = [
    {
        name: "time",
        header: "Time",
        default: {
            unitSetting: "psig",
        },
    },
    {
        name: "source_press",
        default: {
            decimalSetting: "1",
            unitSetting: "psig",
        },
        header: "Source Press.",
    },
    // {
    //     name: "dischargeHeaderPress",
    //     default: {
    //         decimalSetting: "1",
    //     },
    //     header: "Discharge Header Press.",
    // },
    {
        name: "suction_press",
        default: {
            decimalSetting: "1",
            minSetting: -9,
            maxSetting: 60,
            unitSetting: "psig",
        },
        header: "Suction Press.",
    },
    {
        name: "discharge_press",
        default: {
            decimalSetting: "1",
            minSetting: 0,
            maxSetting: 400,
            unitSetting: "psig",
        },
        header: "Discharge Press.",
    },
    {
        name: "speed",
        default: {
            decimalSetting: "0",
            minSetting: 1500,
            maxSetting: 2200,
            unitSetting: "RPM",
        },
        header: "Speed",
    },
    {
        name: "manifold_press",
        default: {
            decimalSetting: "1",
            minSetting: -6,
            maxSetting: -2,
            unitSetting: "psig",
        },
        header: "Manifold Press.",
    },
    {
        name: "oil_press",
        default: {
            decimalSetting: "1",
            minSetting: 30,
            maxSetting: 70,
            unitSetting: "psig",
        },
        header: "Oil Press.",
    },
    {
        name: "oil_diff",
        default: {
            decimalSetting: "1",
            unitSetting: "psig",
        },
        header: "Oil Diff.",
    },
    {
        name: "running_hours",
        default: {
            decimalSetting: "0",
            unitSetting: "hour",
        },
        header: "Running Hours",
    },
    {
        name: "voltage",
        default: {
            decimalSetting: "1",
            minSetting: 27,
            maxSetting: 28,
            unitSetting: "V",
        },
        header: "Voltage",
    },
    {
        name: "water_temp",
        default: {
            decimalSetting: "1",
            minSetting: -194,
            unitSetting: "°F",
        },
        header: "Water Temp",
    },
    {
        name: "discharge_temp",

        header: "Discharge Temp",
        subheader: [
            {
                name: "bef_cooler",
                sub: "Bef. Cooler",
                default: {
                    minSetting: 350,
                    decimalSetting: "1",
                    unitSetting: "°F",
                },
            },
            {
                name: "aft_cooler",
                sub: "Aft. Cooler",
                default: {
                    minSetting: 120,
                    decimalSetting: "1",
                    unitSetting: "°F",
                },
            },
        ],
    },
    {
        name: "static_press_reading",
        default: {
            decimalSetting: "1",
            unitSetting: "psig",
        },
        header: "Static Press. Reading",
    },
    {
        name: "diff_press_reading",
        default: {
            decimalSetting: "1",
            unitSetting: "in H2O",
        },
        header: "Diff. Press. Reading",
    },
    {
        name: "flowrate",
        default: {
            decimalSetting: "6",
            unitSetting: "MSCFD",
        },
        header: "Flowrate",
        // subheader: [{ name: "mscfd", sub: "MSCFD" }],
    },
    {
        name: "remarks",
        header: "Remarks",
    },
];

export const unitStatus = [
    {
        name: "RUNNING",
        value: "running",
    },
    {
        name: "SHUTDOWN",
        value: "sd",
    },
    {
        name: "STANDBY",
        value: "stdby",
    },
];

export const requestType = [
    {
        name: "STANDBY",
        value: "stdby",
    },
    {
        name: "SHUTDOWN",
        value: "sd",
    },
];

export const requestStatus = [
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
        value: { date: "start_date", time: "start_time" },
        type: "dateTime",
        isInput: true,
    },
    {
        name: "Request",
        value: "request_type",
        type: "text",
        isInput: false,
    },

    {
        name: "End Date Time",
        value: { date: "end_date", time: "end_time" },
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
