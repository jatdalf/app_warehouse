import { useEffect, useState } from "react";
import { PeYaFeriadosReader } from "../../../../../readers/PeYaFeriadosReader";
import type { FeriadoItem } from "../FeriadoItem";

export const useFeriados = () => {
    const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
    useEffect(() => {
        const cargarFeriados = async () => {
            try {
                const data = await PeYaFeriadosReader.read();
                setFeriados(data);
            } catch (err) {
                console.error("Error cargando feriados:", err);
            }
        };
        void cargarFeriados();
    }, []);
    return feriados;
};