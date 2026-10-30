import { useState, type FormEvent } from "react";
import "./RenaultOcupacionLogin.css";

interface RenaultOcupacionLoginProps {
    onLogin: (username: string, password: string) => Promise<boolean>;
}

export const RenaultOcupacionLogin = ({ onLogin }: RenaultOcupacionLoginProps) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!username.trim() || !password) {
            setError("Ingresá usuario y contraseña.");
            return;
        }
        try {
            setLoading(true);
            setError("");
            const ok = await onLogin(username.trim(), password);
            if (!ok) {
                setError("Usuario o contraseña incorrectos.");
            }
        } catch (error) {
            console.error(error);
            setError("No fue posible validar las credenciales.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="ocupacion-login-page">
            <div className="ocupacion-login-card">
                <div className="ocupacion-login-header">
                    <div className="ocupacion-login-lock">🔒</div>
                    <div>
                        <div className="ocupacion-login-protected">Acceso protegido</div>
                        <h1>Renault · Ocupación</h1>
                    </div>
                </div>
                <p className="ocupacion-login-description">
                    Ingresá tus credenciales para visualizar
                    los datos de ocupación del warehouse.
                </p>
                <form className="ocupacion-login-form" onSubmit={handleSubmit}>
                    <label>Usuario</label>
                    <input type="text" value={username} onChange={event => setUsername(event.target.value)}
                        placeholder="Usuario"
                        autoComplete="username"
                        disabled={loading}
                    />
                    <label>Contraseña</label>
                    <input type="password" value={password} onChange={event => setPassword(event.target.value)}
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        disabled={loading}
                    />
                    {error && (<div className="ocupacion-login-error">{error}</div>)}
                    <button type="submit" disabled={loading}>
                        {loading ? "Validando..." : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
};