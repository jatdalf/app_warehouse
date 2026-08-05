import { useState } from "react";
import { generarSalidaInfor } from "../../../../services/inforExcel";
import styles from "./InforSection.module.css";

interface Props {
    data: any[];
}

const InforSection: React.FC<Props> = ({ data }) => {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");

    const handleGenerateExcel = async () => {
        try {
            setGenerating(true);
            setError("");

            await generarSalidaInfor(data);
        } catch (error) {
            console.error(error);

            setError(
                "No fue posible generar el archivo Infor."
            );
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className={styles.container}>
            <p className={styles.info}>
                Se procesarán{" "}
                <strong>{data.length}</strong>{" "}
                filas y se completará el archivo{" "}
                <strong>Infor00000.xlsx</strong>.
            </p>

            <button
                type="button"
                className={styles.button}
                disabled={
                    data.length === 0 ||
                    generating
                }
                onClick={handleGenerateExcel}
            >
                {generating
                    ? "Generando archivo..."
                    : "Completar y guardar Excel"}
            </button>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default InforSection;