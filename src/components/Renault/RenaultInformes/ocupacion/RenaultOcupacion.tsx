import { useEffect, useState } from "react";
import LottieDataAnalisis from "../../../Lotties/LottieDataAnalisis";
import OcupacionResumenCards from "./cards/OcupacionResumenCards";
import OcupacionStorageTable from "./cards/OcupacionStorageTable";
import { Lx03OcupacionReader } from "../../../../readers/Lx03OcupacionReader";
import { AlmacenesReader } from "../../../../readers/AlmacenesReader";
import { OcupacionBuilder, type OcupacionResumen} from "./builders/OcupacionBuilder";

const LX03_FILE_ID = "1cXWqkwTsxxS1nyps9Ya-R_yyUxu4xtZ4";
const ALMACENES_FILE_ID = "1ZRPxkVmnJDQYNuAZp0SVTIVHeSm1Wsmx";

const RenaultOcupacion = () => {const [ocupacion, setOcupacion] =
        useState<OcupacionResumen | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                setError("");
                const [lx03, almacenes] = await Promise.all([
                    Lx03OcupacionReader.read(LX03_FILE_ID),
                    AlmacenesReader.read(ALMACENES_FILE_ID)
                ]);

                const resultado =
                    OcupacionBuilder.build(
                        lx03,
                        almacenes
                    );


                setOcupacion(
                    resultado
                );

            } catch (err) {

                console.error(
                    "Error cargando ocupación:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "No fue posible cargar el informe."
                );

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

                <p>
                    Analizando ocupación...
                </p>
            </div>
        );
    }


    if (error) {

        return (
            <div>
                {error}
            </div>
        );
    }


    if (!ocupacion) {

        return null;

    }


    return (
        <div>
            <OcupacionResumenCards resumen={ocupacion} />
            <OcupacionStorageTable items={ocupacion.porStorage} />
        </div>
    );
};

export default RenaultOcupacion;
