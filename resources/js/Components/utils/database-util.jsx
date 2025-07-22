import axios from "axios";
import { useEffect, useState } from "react";

export const fetch = (routeName) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        const fetchData = async () => {
            try {
                const response = await axios.get(route(routeName));
                if (!ignore) {
                    setData(response.data);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            ignore = true;
        };
    }, []);
    return { data, loading, error };
};
