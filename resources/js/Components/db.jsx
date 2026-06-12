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

export const getAllReports = async () => {
    try {
        const response = await fetch(route("unit.get"));

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        data = data
            .map((unit) => {
                const lastReport = [...(unit.reports || [])].sort(
                    (a, b) =>
                        new Date(`${b.date}T${b.time}`) -
                        new Date(`${a.date}T${a.time}`),
                )[0];

                let lastReportTime = "No report";
                let color = "red";
                let sortDate = 0;

                if (lastReport) {
                    const reportDate = new Date(
                        `${lastReport.date}T${lastReport.time}`,
                    );

                    sortDate = reportDate.getTime();

                    lastReportTime = reportDate.toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                    const now = new Date();
                    const diffHours = (now - reportDate) / (1000 * 60 * 60);

                    if (diffHours < 2) {
                        color = "normal";
                    }
                }

                return {
                    unit: unit.unit,
                    area: unit.area,
                    location: unit.location,
                    last_report_time: lastReportTime,
                    color,
                    sortDate,
                };
            })
            .sort((a, b) => b.sortDate - a.sortDate)
            .map(({ sortDate, ...rest }) => rest);

        return data;
    } catch (error) {
        console.error("Gagal ambil data:", error);
        return null;
    }
};

export const getAllRequests = async () => {
    try {
        const response = await fetch(route("request.history"));

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error while retrieving requests:", error);
        return null;
    }
};

export const getUnitField = async (id) => {
    try {
        const response = await fetch(
            route("unit.fields.get", { unit_id: id }),
            {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                },
            },
        );
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error while retrieving requests:", error);
        return null;
    }
};
