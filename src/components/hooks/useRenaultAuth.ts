import { useState } from "react";

const SESSION_KEY = "renault-ocupacion-auth";

export const useRenaultAuth = () => {
    const [authenticated, setAuthenticated] = useState( () => sessionStorage.getItem(SESSION_KEY) === "OK");
    const login = async ( username: string, password: string ): Promise<boolean> => {
        try {
            const response = await fetch("/api/ocupacion-login",
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ username, password })
                }
            ); 
            if (!response.ok) {
                return false;
            }
            const data = await response.json();
            if (!data.success) {
                return false;
            }
            sessionStorage.setItem(SESSION_KEY, "OK");
            setAuthenticated(true);
            return true;
        } catch (error) {
            console.error("Error de autenticación:", error);
            return false;
        }
    };
    const logout = () => {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthenticated(false);
    };
    return { authenticated, login, logout };
};