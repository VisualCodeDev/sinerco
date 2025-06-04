import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(route("auth.user"));
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                setUser(null); // Reset user state on error
            }
        };
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        console.warn("useAuth must be used inside AuthProvider");
        return { user: null }; // prevent destructuring error
    }
    return context;
}
