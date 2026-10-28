import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import LottieDataAnalisis from "../../../Lotties/LottieCompactar";
import OcupacionResumenCards from "./cards/OcupacionResumenCards";
import OcupacionStorageTable from "./cards/OcupacionStorageTable";
import { Lx03OcupacionReader } from "../../../../readers/Lx03OcupacionReader";
import { AlmacenesReader } from "../../../../readers/AlmacenesReader";
import {
    OcupacionBuilder,
    type OcupacionResumen,
} from "./builders/OcupacionBuilder";
import { CompactacionBuilder } from "./builders/CompactacionBuilder";
import type { CompactacionResumen } from "./Compactacion/CompactacionItem";
import CompactacionResumenCards from "./cards/CompactacionResumenCards";
import styles from "./RenaultOcupacion.module.css";
import type { AlmacenItem } from "./AlmacenItem";
import OcupacionRenaultHeader from "./Header/OcupacionRenaultHeader";
import { useRenaultAuth } from "../../../../components/hooks/useRenaultAuth";
import { RenaultOcupacionLogin } from "../../Loguin/RenaultOcupacionLogin";
import { INVENTARIO_WAREHOUSES } from "../inventarios/InventarioWarehouseConfig";

type Warehouse = "W1" | "W2";

interface Informe {
    ocupacion: OcupacionResumen;
    compactacion: CompactacionResumen;
}

interface InformeLocal extends Informe {
    nombreArchivo: string;
}

const ALMACENES_FILE_ID = "1ZRPxkVmnJDQYNuAZp0SVTIVHeSm1Wsmx";

const RenaultOcupacion = () => {
    const { authenticated, login } = useRenaultAuth();

    const [warehouse, setWarehouse] = useState<Warehouse>("W1");
    const [informeDrive, setInformeDrive] = useState<
        Partial<Record<Warehouse, Informe>>
    >({});
    const [informesLocales, setInformesLocales] = useState<
        Partial<Record<Warehouse, InformeLocal>>
    >({});

    const [loading, setLoading] = useState(true);
    const [cargandoArchivo, setCargandoArchivo] = useState(false);
    const [error, setError] = useState("");
    const [errorArchivo, setErrorArchivo] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);
    const almacenesCache = useRef<AlmacenItem[] | null>(null);
    const almacenesPendientes = useRef<Promise<AlmacenItem[]> | null>(null);
    const driveCache = useRef<Partial<Record<Warehouse, Informe>>>({});

    const local = informesLocales[warehouse];
    const informe = local ?? informeDrive[warehouse];

    const obtenerAlmacenes = (): Promise<AlmacenItem[]> => {
        if (almacenesCache.current) {
            return Promise.resolve(almacenesCache.current);
        }

        if (!almacenesPendientes.current) {
            almacenesPendientes.current = AlmacenesReader
                .read(ALMACENES_FILE_ID)
                .then(items => {
                    almacenesCache.current = items;
                    return items;
                })
                .finally(() => {
                    almacenesPendientes.current = null;
                });
        }

        return almacenesPendientes.current;
    };

    useEffect(() => {
        if (!authenticated || local) {
            return;
        }

        let cancelado = false;

        const cargar = async () => {
            setLoading(true);
            setError("");

            try {
                let resultado = driveCache.current[warehouse];

                if (!resultado) {
                    const [lx03, almacenes] = await Promise.all([
                        Lx03OcupacionReader.read(
                            INVENTARIO_WAREHOUSES[warehouse].lx03FileId,
                        ),
                        obtenerAlmacenes(),
                    ]);

                    resultado = {
                        ocupacion: OcupacionBuilder.build(lx03, almacenes),
                        compactacion: CompactacionBuilder.build(lx03),
                    };

                    driveCache.current[warehouse] = resultado;
                }

                if (!cancelado) {
                    const informeCargado = resultado;

                    setInformeDrive(actual => ({
                        ...actual,
                        [warehouse]: informeCargado,
                    }));
                }
            } catch (err) {
                if (!cancelado) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "No fue posible cargar el informe.",
                    );
                }
            } finally {
                if (!cancelado) {
                    setLoading(false);
                }
            }
        };

        void cargar();

        return () => {
            cancelado = true;
        };
    }, [warehouse, authenticated, local]);

    const cargarArchivo = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        // Permite volver a seleccionar el mismo archivo.
        event.target.value = "";

        if (!file) {
            return;
        }

        const warehouseDestino = warehouse;

        setCargandoArchivo(true);
        setErrorArchivo("");

        try {
            const [lx03, almacenes] = await Promise.all([
                Lx03OcupacionReader.readFile(file),
                obtenerAlmacenes(),
            ]);

            const resultado: InformeLocal = {
                ocupacion: OcupacionBuilder.build(lx03, almacenes),
                compactacion: CompactacionBuilder.build(lx03),
                nombreArchivo: file.name,
            };

            setInformesLocales(actual => ({
                ...actual,
                [warehouseDestino]: resultado,
            }));
        } catch (err) {
            setErrorArchivo(
                err instanceof Error
                    ? err.message
                    : "No fue posible leer el archivo LX03.",
            );
        } finally {
            setCargandoArchivo(false);
        }
    };

    const volverADrive = () => {
        setErrorArchivo("");
        setError("");
        setLoading(true);

        setInformesLocales(actual => {
            const siguiente = { ...actual };
            delete siguiente[warehouse];
            return siguiente;
        });
    };

    const cambiarWarehouse = (nuevo: Warehouse) => {
        if (nuevo === warehouse) {
            return;
        }

        setError("");
        setErrorArchivo("");
        setLoading(true);
        setWarehouse(nuevo);
    };

    if (!authenticated) {
        return <RenaultOcupacionLogin onLogin={login} />;
    }

    return (
        <div className={styles.container}>
            <OcupacionRenaultHeader />

            <div className={styles.printContext}>
                {warehouse === "W1" ? "W1 · REP" : "W2 · BsAs"}
            </div>

            <div className={styles.warehouseSelector}>
                <button
                    type="button"
                    disabled={cargandoArchivo}
                    className={
                        warehouse === "W1"
                            ? styles.warehouseActive
                            : styles.warehouseButton
                    }
                    onClick={() => cambiarWarehouse("W1")}
                >
                    W1 · REP
                </button>

                <button
                    type="button"
                    disabled={cargandoArchivo}
                    className={
                        warehouse === "W2"
                            ? styles.warehouseActive
                            : styles.warehouseButton
                    }
                    onClick={() => cambiarWarehouse("W2")}
                >
                    W2 · BsAs
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={event => void cargarArchivo(event)}
            />

            {!informe && loading && !error ? (
                <div className={styles.loading}>
                    <LottieDataAnalisis />
                    <p>Analizando ocupación {warehouse}...</p>
                </div>
            ) : null}

            {!informe && error ? (
                <div className={styles.error}>{error}</div>
            ) : null}

            {informe && (
                <OcupacionResumenCards resumen={informe.ocupacion} />
            )}

            <div className={styles.sourceToolbar}>
                <div className={styles.sourceInfo}>
                    <strong>
                        {local ? "LX03 local" : "LX03 de Drive"}
                        {" · "}
                        {warehouse === "W1" ? "W1 · REP" : "W2 · BsAs"}
                    </strong>

                    <span>
                        {local
                            ? local.nombreArchivo
                            : "Podés cargar una LX03 desde tu PC para actualizar el análisis."}
                    </span>
                </div>

                <div className={styles.sourceActions}>
                    {local && (
                        <button
                            type="button"
                            className={styles.restoreButton}
                            disabled={cargandoArchivo}
                            onClick={volverADrive}
                        >
                            Volver a Drive
                        </button>
                    )}

                    <button
                        type="button"
                        className={styles.uploadButton}
                        disabled={cargandoArchivo}
                        onClick={() => inputRef.current?.click()}
                    >
                        {cargandoArchivo
                            ? "Procesando LX03..."
                            : "↑ Cargar LX03"}
                    </button>
                </div>
            </div>

            {errorArchivo && (
                <div className={styles.error} role="alert">
                    {errorArchivo}
                </div>
            )}

            {informe && (
                <>
                    <OcupacionStorageTable
                        items={informe.ocupacion.porStorage}
                        compactacion={informe.compactacion.porStorage}
                        candidatos={informe.compactacion.candidatos}
                        warehouse={warehouse}
                    />

                    <CompactacionResumenCards
                        resumen={informe.compactacion}
                    />
                </>
            )}
        </div>
    );
};

export default RenaultOcupacion;