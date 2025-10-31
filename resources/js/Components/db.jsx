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
