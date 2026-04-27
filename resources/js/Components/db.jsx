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
    } catch (error) {
        console.error("Gagal ambil data:", error);
    }

    return data;
};

export const getUnitReports = async (unit_position_id) => {
    try {
        const response = await fetch(
            route("unit.position.report.get", { unit_position_id }),
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Gagal ambil data:", error);
        return null;
    }
};

export const updateClientData = async (client_id, dataArr) => {
    if (Array.isArray(client_id)) return;

    try {
        const resp = await fetch(route("client.update"), {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content"),
            },
            body: JSON.stringify({
                client_id,
                updateData: dataArr,
            }),
        });

        const data = await resp.json();
        return data;
    } catch (err) {
        return err;
    }
};
export const fetchWithAuth = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            credentials: "include", // penting buat cookie Laravel
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content"),
                ...(options.headers || {}),
            },
            ...options,
        });

        if (response.status === 419 || response.status === 401) {
            router.visit("/login");
            return;
        }

        return response;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
