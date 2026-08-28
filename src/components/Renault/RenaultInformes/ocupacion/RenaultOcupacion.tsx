import { useEffect, useState } from "react";
import LottieDataAnalisis from "../../../Lotties/LottieDataAnalisis";
import OcupacionResumenCards from "./cards/OcupacionResumenCards";
import OcupacionStorageTable from "./cards/OcupacionStorageTable";
import { Lx03OcupacionReader } from "../../../../readers/Lx03OcupacionReader";
import { AlmacenesReader } from "../../../../readers/AlmacenesReader";
import { OcupacionBuilder, type OcupacionResumen} from "./builders/OcupacionBuilder";
import { CompactacionBuilder } from "./builders/CompactacionBuilder";
import type { CompactacionResumen } from "./Compactacion/CompactacionItem";
import CompactacionResumenCards from "./cards/CompactacionResumenCards";

const LX03_FILE_ID = "1cXWqkwTsxxS1nyps9Ya-R_yyUxu4xtZ4";
const ALMACENES_FILE_ID = "1ZRPxkVmnJDQYNuAZp0SVTIVHeSm1Wsmx";

const RenaultOcupacion = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ocupacion, setOcupacion] = useState<OcupacionResumen | null>(null);
    const [compactacion, setCompactacion] = useState<CompactacionResumen | null>(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                setError("");
                const [lx03, almacenes] = await Promise.all([
                    Lx03OcupacionReader.read(LX03_FILE_ID),
                    AlmacenesReader.read(ALMACENES_FILE_ID)
                ]);
                const resultado = OcupacionBuilder.build(lx03, almacenes);
                const resultadoCompactacion = CompactacionBuilder.build(lx03);
                setOcupacion(resultado);
                setCompactacion(resultadoCompactacion);
   
            } catch (err) {
                console.error("Error cargando ocupación:", err);
                setError(err instanceof Error ? err.message : "No fue posible cargar el informe.");
            } finally {
                setLoading(false);
            }
        };
        void cargar();
    }, []);


    if (loading) {
        return (
            <div>
                <LottieDataAnalisis />
                <p> Analizando ocupación...</p>
            </div>
        );
    }
    if (error) {
        return (<div>{error}</div>);
    }
        if (!ocupacion || !compactacion) {
        return null;
    }

    return (
        <div>
            <OcupacionResumenCards resumen={ocupacion}/>
            <OcupacionStorageTable
                items={ocupacion.porStorage}
                compactacion={compactacion.porStorage}
                candidatos={compactacion.candidatos}
            />
            <CompactacionResumenCards resumen={compactacion}/>
        </div>
    );
};

export default RenaultOcupacion;
