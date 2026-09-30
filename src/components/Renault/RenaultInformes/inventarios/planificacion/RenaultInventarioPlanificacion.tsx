import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { WarehouseInventario } from "../InventarioWarehouseConfig";
import styles from "./RenaultInventarioPlanificacion.module.css";
import { useInventarioSapData } from "../hooks/useInventarioSapData";
import PlanificacionLocations from "./components/PlanificacionLocations";


type MetodoPlanificacion = "UBICACION" | "MATERIAL";

const TARGET_DEFAULT = 135;

const RenaultInventarioPlanificacion = () => {
    const [searchParams] = useSearchParams();
    const warehouseInicial = searchParams.get("warehouse") === "W2" ? "W2" : "W1";
    const [warehouse, setWarehouse] = useState<WarehouseInventario>(warehouseInicial);
    const [fecha, setFecha] = useState(() => {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, "0");
        const day = String(hoy.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    });
    const [target, setTarget] = useState(TARGET_DEFAULT);
    const [metodo, setMetodo] = useState<MetodoPlanificacion>("UBICACION");
    const {lx03, loading, error} = useInventarioSapData(warehouse);
    const [ubicacionesSeleccionadas, setUbicacionesSeleccionadas] = useState<Set<string>>(new Set());
    const [storageFiltro, setStorageFiltro] = useState("TODOS");
    const [mostrarLlenas, setMostrarLlenas] = useState(true);
    const [mostrarVacias, setMostrarVacias] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [mensajeGuardado, setMensajeGuardado] = useState("");
    const [errorGuardado, setErrorGuardado] = useState("");
    const cantidadPlanificada = ubicacionesSeleccionadas.size;
    const ubicaciones = useMemo(() => {
    const mapa = new Map<string, { key: string; storage: string; ubicacion: string; materiales: string[];}>();
    lx03.forEach(item => {
        const storage = item.storage.trim();
        const ubicacion = item.ubicacion.trim().toUpperCase();
        if (!storage || !ubicacion) {
            return;
        }
        const key = `${storage}|${ubicacion}`;
        const existente = mapa.get(key);
        if (!existente) {
            mapa.set(key, {
                key,
                storage,
                ubicacion,
                materiales: item.material ? [item.material.trim()] : [] });
            return;
        }
        const material = item.material.trim();
        if ( material && !existente.materiales.includes(material)) {
            existente.materiales.push(material);
        }
    });
    return [...mapa.values()].sort((a, b) => {
        const storageCompare = a.storage.localeCompare(b.storage, undefined,{ numeric: true });
        if (storageCompare !== 0) {
            return storageCompare;
        }
        return a.ubicacion.localeCompare(
            b.ubicacion,
            undefined,
            { numeric: true }
        );
    });
    }, [lx03]);
    const porcentaje = useMemo(() => {
        if (target <= 0) {
            return 0;
        }
        return (cantidadPlanificada / target) * 100;
    }, [cantidadPlanificada, target]);
    const storages = useMemo(() => {
        return [...new Set(ubicaciones.map(item => item.storage))].sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true }));
    }, [ubicaciones]);
    const esMaterialVacio = (material: string) => {
    const valor = material.trim().toLowerCase();
        return valor === "<< vacías >>";
    };
    const ubicacionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toUpperCase();

    return ubicaciones.filter(item => {
        if (
            storageFiltro !== "TODOS" &&
            item.storage !== storageFiltro
        ) {
            return false;
        }

        const estaVacia =
    item.materiales.length === 0 ||
    item.materiales.every(material => esMaterialVacio(material));

const estaLlena = !estaVacia;

        if (!mostrarLlenas && estaLlena) {
            return false;
        }

        if (!mostrarVacias && estaVacia) {
            return false;
        }

        if (!texto) {
            return true;
        }

        return (
            item.ubicacion.includes(texto) ||
            item.storage.toUpperCase().includes(texto) ||
            item.materiales.some(material =>
                material.toUpperCase().includes(texto)
            )
        );
    });
}, [
    ubicaciones,
    storageFiltro,
    busqueda,
    mostrarLlenas,
    mostrarVacias
]);
    const toggleUbicacion = (key: string) => {
        setUbicacionesSeleccionadas(actuales => {
            const siguiente = new Set(actuales);
            if (siguiente.has(key)) {
                siguiente.delete(key);
            } else {
                siguiente.add(key);
            }
            return siguiente;
        });
    };

    const estado = useMemo(() => {
        if (porcentaje <= 25) {
            return {
                clase: styles.progressRed,
                texto: "Planificación muy baja"
            };
        }

        if (porcentaje <= 75) {
            return {
                clase: styles.progressOrange,
                texto: "Planificación en preparación"
            };
        }

        if (porcentaje < 100) {
            return {
                clase: styles.progressYellow,
                texto: "Cerca del objetivo"
            };
        }

        if (porcentaje <= 105) {
            return {
                clase: styles.progressGreen,
                texto: "Objetivo alcanzado"
            };
        }

        return {
            clase: styles.progressBrightGreen,
            texto: "Sobre el objetivo"
        };
    }, [porcentaje]);

    const diferenciaTarget = cantidadPlanificada - target;
    const LIMITE_FILAS = 200;
    const ubicacionesVisibles = useMemo(() => {
        return ubicacionesFiltradas.slice(0, LIMITE_FILAS);
    }, [ubicacionesFiltradas]);
    const agregarUbicaciones = (cantidad: number) => {
    setUbicacionesSeleccionadas(actuales => {
        const nuevas = new Set(actuales);

        const disponibles = ubicacionesVisibles.filter(
            item => !nuevas.has(item.key)
        );

        disponibles
            .slice(0, cantidad)
            .forEach(item => nuevas.add(item.key));

        return nuevas;
    });
};

const seleccionarVisibles = () => {
    setUbicacionesSeleccionadas(actuales => {
        const nuevas = new Set(actuales);

        ubicacionesVisibles.forEach(item => {
            nuevas.add(item.key);
        });

        return nuevas;
    });
};

const completarTarget = () => {
    setUbicacionesSeleccionadas(actuales => {
        const nuevas = new Set(actuales);

        const faltantes = Math.max(
            0,
            target - nuevas.size
        );

        if (faltantes === 0) {
            return nuevas;
        }

        const disponibles = ubicacionesFiltradas.filter(
            item => !nuevas.has(item.key)
        );

        disponibles
            .slice(0, faltantes)
            .forEach(item => nuevas.add(item.key));

        return nuevas;
    });
};

const limpiarSeleccion = () => {
    setUbicacionesSeleccionadas(new Set());
};
const guardarPlanificacion = async () => {
    if (ubicacionesSeleccionadas.size === 0) {
        setErrorGuardado(
            "Seleccioná al menos una ubicación antes de guardar."
        );
        return;
    }

    try {
        setGuardando(true);
        setMensajeGuardado("");
        setErrorGuardado("");

        const posiciones = ubicaciones
            .filter(item =>
                ubicacionesSeleccionadas.has(item.key)
            )
            .map(item => ({
                storage: item.storage,
                ubicacion: item.ubicacion,
                material:
                    item.materiales.length > 0
                        ? item.materiales.join(", ")
                        : ""
            }));

        const response = await fetch(
            "/api/guardar-planificacion-inventario",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    warehouse,
                    fecha,
                    targetDiario: target,
                    tipoPlanificacion: metodo,
                    posiciones,
                    usuario: ""
                })
            }
        );

        const textoRespuesta = await response.text();

console.log("STATUS GUARDADO:", response.status);
console.log("RESPUESTA GUARDADO:", textoRespuesta);

if (!textoRespuesta) {
    throw new Error(
        `El servidor respondió ${response.status} pero no devolvió contenido.`
    );
}

let data;

try {
    data = JSON.parse(textoRespuesta);
} catch {
    throw new Error(
        `El servidor no devolvió JSON válido. Status: ${response.status}`
    );
}

if (!response.ok || !data.success) {
    throw new Error(
        data.error ??
        "No fue posible guardar la planificación."
    );
}

        const accion =
            data.accion === "actualizada"
                ? "actualizada"
                : "guardada";

        setMensajeGuardado(
            `Planificación ${accion} correctamente: ${data.cantidad} ubicaciones.`
        );

    } catch (error) {
        console.error(
            "Error guardando planificación:",
            error
        );

        setErrorGuardado(
            error instanceof Error
                ? error.message
                : "No fue posible guardar la planificación."
        );

    } finally {
        setGuardando(false);
    }
};

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>📅 Planificación de inventarios</h1>

                <p>
                    Preparación de próximos inventarios
                </p>
            </header>

            <section className={styles.controls}>
                <label className={styles.controlGroup}>
                    <span>Warehouse</span>

                    <select
                        value={warehouse}
                        onChange={event => {
                            setWarehouse(event.target.value as WarehouseInventario);
                            setUbicacionesSeleccionadas(new Set());
                            setStorageFiltro("TODOS");
                            setBusqueda("");
                        }} >
                        <option value="W1">W1 (Rep)</option>
                        <option value="W2">W2 (BsAs)</option>
                    </select>
                </label>

                <label className={styles.controlGroup}>
                    <span>Fecha del inventario</span>

                    <input
                        type="date"
                        value={fecha}
                        onChange={event =>
                            setFecha(event.target.value)
                        }
                    />
                </label>

                <label className={styles.controlGroup}>
                    <span>Target diario</span>

                    <input
                        type="number"
                        min="1"
                        value={target}
                        onChange={event =>
                            setTarget(
                                Math.max(
                                    1,
                                    Number(event.target.value) || 1
                                )
                            )
                        }
                    />
                </label>
            </section>

            <section className={styles.methodSection}>
                <span className={styles.methodTitle}>
                    Planificar por
                </span>

                <div className={styles.methodButtons}>
                    <button
                        type="button"
                        className={
                            metodo === "UBICACION"
                                ? styles.methodActive
                                : styles.methodButton
                        }
                        onClick={() => setMetodo("UBICACION")}
                    >
                        🔠 Ubicación
                    </button>

                    <button
                        type="button"
                        className={
                            metodo === "MATERIAL"
                                ? styles.methodActive
                                : styles.methodButton
                        }
                        onClick={() => setMetodo("MATERIAL")}
                    >
                        🆔 Material
                    </button>
                </div>
            </section>

            <section className={styles.progressCard}>
                <div className={styles.progressHeader}>
                    <div>
                        <span className={styles.progressLabel}>
                            Ubicaciones planificadas
                        </span>

                        <strong className={styles.progressNumber}>
                            {cantidadPlanificada}
                        </strong>
                    </div>

                    <div className={styles.targetInfo}>
                        Target
                        <strong>{target}</strong>
                    </div>
                </div>

                <div className={styles.progressTrack}>
                    <div
                        className={`${styles.progressFill} ${estado.clase}`}
                        style={{
                            width: `${Math.min(porcentaje, 100)}%`
                        }}
                    />
                </div>

                <div className={styles.progressFooter}>
                    <strong>
                        {porcentaje.toLocaleString("es-AR", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        })}
                        %
                    </strong>

                    <span>{estado.texto}</span>
                </div>

                <div className={styles.targetMessage}>
                    {diferenciaTarget < 0 ? (
                        <>
                            Faltan{" "}
                            <strong>
                                {Math.abs(diferenciaTarget)}
                            </strong>{" "}
                            ubicaciones para alcanzar el objetivo.
                        </>
                    ) : diferenciaTarget === 0 ? (
                        <>
                            Objetivo diario alcanzado.
                        </>
                    ) : (
                        <>
                            <strong>{diferenciaTarget}</strong>{" "}
                            ubicaciones por encima del objetivo.
                        </>
                    )}
                </div>
            </section>

            <section className={styles.actions}>
                <button
                    type="button"
                    className={styles.suggestButton}
                    disabled
                >
                    ✨ Sugerir ubicaciones
                </button>

                <button
    type="button"
    className={styles.saveButton}
    onClick={guardarPlanificacion}
    disabled={
        guardando ||
        ubicacionesSeleccionadas.size === 0
    }
>
    {guardando
        ? "💾 Guardando..."
        : "💾 Guardar planificación"}
</button>
            </section>
{mensajeGuardado && (
    <div className={styles.saveSuccess}>
        ✅ {mensajeGuardado}
    </div>
)}

{errorGuardado && (
    <div className={styles.saveError}>
        ⚠️ {errorGuardado}
    </div>
)}
        <PlanificacionLocations
            ubicaciones={ubicaciones}
            ubicacionesFiltradas={ubicacionesFiltradas}
            ubicacionesVisibles={ubicacionesVisibles}
            ubicacionesSeleccionadas={ubicacionesSeleccionadas}
            storages={storages}
            storageFiltro={storageFiltro}
            setStorageFiltro={setStorageFiltro}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            mostrarLlenas={mostrarLlenas}
            setMostrarLlenas={setMostrarLlenas}
            mostrarVacias={mostrarVacias}
            setMostrarVacias={setMostrarVacias}
            loading={loading}
            error={error}
            target={target}
            limiteFilas={LIMITE_FILAS}
            toggleUbicacion={toggleUbicacion}
            seleccionarVisibles={seleccionarVisibles}
            agregarUbicaciones={agregarUbicaciones}
            completarTarget={completarTarget}
            limpiarSeleccion={limpiarSeleccion}
        />
    </div>
);};

export default RenaultInventarioPlanificacion;