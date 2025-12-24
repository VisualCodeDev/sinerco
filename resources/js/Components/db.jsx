export const getFields = async () => {
    let data;
    try {
        const response = await fetch(route("input.field.get"));

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        data = await response.json();
    } catch (error) {
        console.error("Gagal ambil data:", error);
    }

    return data;
};

export const getSetting = async () => {
    let data;
    try {
        const response = await fetch(route("setting.get"));

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        data = await response.json();
    } catch (error) {
        console.error("Gagal ambil data:", error);
    }

    return data;
};

export const getUnitBA = async () => {
    let data;
    try {
        const response = await fetch(route("ba.unit.get"));
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Gagal ambil data:", error);
    }

    return data;
};

export const getAllUnits = async () => {
    let data;
    try {
        const response = await fetch(route("unit.get"));
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Gagal ambil data:", error);
    }

    return data;
};

export const getUnitReports = async (unit_position_id) => {
    try {
        const response = await fetch(
            route("unit.position.report.get", { unit_position_id })
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error("Gagal ambil data:", error);
        return null;
    }
};
