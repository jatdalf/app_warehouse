import { useState } from "react";

const SESSION_KEY = "renault-ocupacion-auth";
export const useRenaultAuth = () => {
    const [authenticated, setAuthenticated] = useState(sessionStorage.getItem(SESSION_KEY) === "OK");
    const login = async ( username: string, password: string) => {
    const response = await fetch("/api/ocupacion-login",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password})
        });
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        if (data.success) {
            sessionStorage.setItem(SESSION_KEY, "OK" );
            setAuthenticated(true);
            return true;
        }
        return false;
    };
    const logout = () => {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthenticated(false);
    };
    return { authenticated, login, logout };
};