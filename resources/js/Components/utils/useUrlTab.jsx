import { useCallback, useState } from "react";

// Sinkronkan tab aktif dengan query string (?tab=xxx) supaya tab bisa
// di-bookmark/dibagikan sebagai link langsung (mis. /database?tab=areas),
// dan tombol back/forward browser tetap masuk akal. Pakai replaceState (bukan
// pushState) supaya tiap klik tab tidak menumpuk entry history baru.
const useUrlTab = (validKeys, defaultKey, paramName = "tab") => {
    const readFromUrl = () => {
        if (typeof window === "undefined") return defaultKey;
        const fromUrl = new URLSearchParams(window.location.search).get(
            paramName,
        );
        return validKeys.includes(fromUrl) ? fromUrl : defaultKey;
    };

    const [activeTab, setActiveTabState] = useState(readFromUrl);

    const setActiveTab = useCallback(
        (key) => {
            setActiveTabState(key);
            const url = new URL(window.location.href);
            url.searchParams.set(paramName, key);
            window.history.replaceState({}, "", url);
        },
        [paramName],
    );

    return [activeTab, setActiveTab];
};

export default useUrlTab;
