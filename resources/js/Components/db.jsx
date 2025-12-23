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
        console.log(data)
    } catch (error) {
        console.error("Gagal ambil data:", error);
    }

    return data;
};
