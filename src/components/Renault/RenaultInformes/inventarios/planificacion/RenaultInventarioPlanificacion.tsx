import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { WarehouseInventario } from "../InventarioWarehouseConfig";
import styles from "./RenaultInventarioPlanificacion.module.css";
import { useInventarioSapData } from "../hooks/useInventarioSapData";
import PlanificacionLocations from "./components/PlanificacionLocations";
import { PlanificacionProgress } from "./components/PlanificacionProgress";
import { PlanificacionControls } from "./components/PlanificacionControls";
import { PlanificacionMethodSelector, type MetodoPlanificacion } from "./components/PlanificacionMethodSelector";
import { PlanificacionActions } from "./components/PlanificacionActions";
import { usePlanificacionUbicaciones } from "../hooks/usePlanificacionUbicaciones";
import { InventarioPlanificacionService } from "./services/InventarioPlanificacionService";

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
    const {
        ubicaciones,
        ubicacionesFiltradas,
        ubicacionesVisibles,
        ubicacionesSeleccionadas,
        storages,
        storageFiltro,
        setStorageFiltro,
        mostrarLlenas,
        setMostrarLlenas,
        mostrarVacias,
        setMostrarVacias,
        busqueda,
        setBusqueda,
        limiteFilas,
        toggleUbicacion,
        agregarUbicaciones,
        seleccionarVisibles,
        completarTarget,
        limpiarSeleccion,
        resetearPorCambioWarehouse,
        cargarSeleccion 
    } = usePlanificacionUbicaciones(lx03, target);

    const cantidadPlanificada = ubicacionesSeleccionadas.size;
    const [planificacionExistente, setPlanificacionExistente] = useState(false);

    useEffect(() => {
        let cancelado = false;
        const cargarPlanificacion = async () => {
            try {
                const resultado = await InventarioPlanificacionService.obtener(warehouse, fecha);
                if (cancelado) {
                    return;
                }
               if (!resultado.existe) {
                    cargarSeleccion([]);
                    setPlanificacionExistente(false);
                    return;
                }
                setPlanificacionExistente(true);
                cargarSeleccion(resultado.posiciones);
                if (resultado.targetDiario !== null && resultado.targetDiario > 0) {
                    setTarget(resultado.targetDiario);
                }
                if (resultado.tipoPlanificacion) {
                    setMetodo(resultado.tipoPlanificacion);
                }
            } catch (error) {
                if (cancelado) {
                    setPlanificacionExistente(false);
                    return;
                }
                console.error("Error cargando planificación:", error);
            }
        };

        void cargarPlanificacion();
        return () => {cancelado = true; };
    }, [warehouse, fecha]);
    const [guardando, setGuardando] = useState(false);
    const [mensajeGuardado, setMensajeGuardado] = useState("");
    const [errorGuardado, setErrorGuardado] = useState("");
 
    const porcentaje = useMemo(() => {
        if (target <= 0) {
            return 0;
        }
        return (cantidadPlanificada / target) * 100;
    }, [cantidadPlanificada, target]);

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
    const guardarPlanificacion = async () => {
        if (ubicacionesSeleccionadas.size === 0) {
            setErrorGuardado("Seleccioná al menos una ubicación antes de guardar.");
            return;
        }
        try {
            setGuardando(true);
            setMensajeGuardado("");
            setErrorGuardado("");
            const posiciones = ubicaciones.filter(item => ubicacionesSeleccionadas.has(item.key))
                .map(item => ({
                    storage: item.storage,
                    ubicacion: item.ubicacion,
                    material: item.materiales.length > 0 ? item.materiales.join(", ") : ""
                }));
            const data = await InventarioPlanificacionService.guardar({
                warehouse,
                fecha,
                targetDiario: target,
                tipoPlanificacion: metodo,
                posiciones,
                usuario: ""
            });
            const accion = data.accion === "actualizada" ? "actualizada": "guardada";
            setMensajeGuardado(`Planificación ${accion} correctamente: ${data.cantidad} ubicaciones.`);

        } catch (error) {
            console.error("Error guardando planificación:", error);
            setErrorGuardado(error instanceof Error ? error.message : "No fue posible guardar la planificación.");
        } finally {
            setGuardando(false);
        }
    };
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>📅 Planificación de inventarios</h1>
                <p>Preparación de próximos inventarios</p>
            </header>
            <PlanificacionControls
                warehouse={warehouse}
                fecha={fecha}
                target={target}
                onWarehouseChange={nuevoWarehouse => {setWarehouse(nuevoWarehouse); resetearPorCambioWarehouse();}}
                onFechaChange={setFecha}
                onTargetChange={setTarget}
            />
            <PlanificacionMethodSelector metodo={metodo} onMetodoChange={setMetodo} />
            {planificacionExistente && (
                <div className={styles.existingPlan}>
                    📋 Planificación existente cargada ·{" "}
                    <strong>{cantidadPlanificada}</strong>{" "}
                    ubicaciones
                </div>
            )}
            <PlanificacionProgress
                cantidadPlanificada={cantidadPlanificada}
                target={target}
                porcentaje={porcentaje}
                diferenciaTarget={diferenciaTarget}
                estado={estado}
            />
            <PlanificacionActions 
                guardando={guardando} 
                cantidadSeleccionada={ubicacionesSeleccionadas.size}
                onGuardar={guardarPlanificacion} />
            {mensajeGuardado && (<div className={styles.saveSuccess}>✅ {mensajeGuardado}</div>)}
            {errorGuardado && (<div className={styles.saveError}>⚠️ {errorGuardado}</div>)}
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
                limiteFilas={limiteFilas}
                toggleUbicacion={toggleUbicacion}
                seleccionarVisibles={seleccionarVisibles}
                agregarUbicaciones={agregarUbicaciones}
                completarTarget={completarTarget}
                limpiarSeleccion={limpiarSeleccion}
            />
    </div>
);};

export default RenaultInventarioPlanificacion;