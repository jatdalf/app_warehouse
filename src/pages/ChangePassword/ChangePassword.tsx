
import { useState } from "react";
import { completePasswordChange } from "../../services/passwordService";
import styles from "./ChangePassword.module.css";

type ChangePasswordProps = {
  onCompleted: () => Promise<void>;
  onLogout: () => Promise<void>;
};

const ChangePassword = ({
  onCompleted,
  onLogout,
}: ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) return;

    setError("");

    if (!currentPassword) {
      setError("Ingresá tu contraseña actual.");
      return;
    }

    if (currentPassword === password) {
      setError("La nueva contraseña debe ser diferente de la actual.");
      return;
    }

    if (password.length < 8 || password.length > 16) {
      setError("La nueva contraseña debe tener entre 8 y 16 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);

    try {
      await completePasswordChange(currentPassword, password);

      setCurrentPassword("");
      setPassword("");
      setConfirmation("");

      await onCompleted();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la contraseña."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon}>🔐</div>

        <h1>Establecer contraseña</h1>

        <p className={styles.description}>
          Por seguridad, debés establecer una contraseña personal
          antes de utilizar OpsFlow.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="current-password">
            Contraseña actual
          </label>

          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(event.target.value)
            }
            disabled={saving}
            required
          />

          <label htmlFor="new-password">
            Nueva contraseña
          </label>

          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            disabled={saving}
            minLength={8}
            maxLength={16}
            required
          />

          <label htmlFor="confirm-password">
            Confirmar contraseña
          </label>

          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) =>
              setConfirmation(event.target.value)
            }
            disabled={saving}
            minLength={8}
            maxLength={16}
            required
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            className={styles.submit}
            type="submit"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>

        <button
          type="button"
          className={styles.logout}
          onClick={() => void onLogout()}
          disabled={saving}
        >
          Cerrar sesión
        </button>
      </section>
    </main>
  );
};

export default ChangePassword;
