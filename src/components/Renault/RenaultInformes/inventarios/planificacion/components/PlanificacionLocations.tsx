import styles from "../RenaultInventarioPlanificacion.module.css";

export interface PlanificacionUbicacion {
    key: string; storage: string; ubicacion: string; materiales: string[];}

interface PlanificacionLocationsProps {
    ubicaciones: PlanificacionUbicacion[];
    ubicacionesFiltradas: PlanificacionUbicacion[];
    ubicacionesVisibles: PlanificacionUbicacion[];
    ubicacionesSeleccionadas: Set<string>;
    storages: string[];
    storageFiltro: string;
    setStorageFiltro: (value: string) => void;
    busqueda: string;
    setBusqueda: (value: string) => void;
    mostrarLlenas: boolean;
    setMostrarLlenas: (value: boolean) => void;
    mostrarVacias: boolean;
    setMostrarVacias: (value: boolean) => void;
    loading: boolean;
    error: string;
    target: number;
    limiteFilas: number;

    toggleUbicacion: (key: string) => void;
    seleccionarVisibles: () => void;
    agregarUbicaciones: (cantidad: number) => void;
    completarTarget: () => void;
    limpiarSeleccion: () => void;
}

const PlanificacionLocations = ({
    ubicaciones,
    ubicacionesFiltradas,
    ubicacionesVisibles,
    ubicacionesSeleccionadas,
    storages,
    storageFiltro,
    setStorageFiltro,
    busqueda,
    setBusqueda,
    mostrarLlenas,
    setMostrarLlenas,
    mostrarVacias,
    setMostrarVacias,
    loading,
    error,
    target,
    limiteFilas,
    toggleUbicacion,
    seleccionarVisibles,
    agregarUbicaciones,
    completarTarget,
    limpiarSeleccion
}: PlanificacionLocationsProps) => {

    return (
        <section className={styles.locationsSection}>
            <div className={styles.locationsHeader}>
                <div>
                    <h2>Ubicaciones disponibles</h2>
                    <span>
                        {ubicaciones.length.toLocaleString("es-AR")}
                        {" "}ubicaciones inventariables
                    </span>
                </div>

                <div className={styles.locationFilters}>
                    <select value={storageFiltro} onChange={event =>
                            setStorageFiltro(event.target.value)} >
                        <option value="TODOS">Todos los storages</option>
                        {storages.map(storage => (
                            <option key={storage} value={storage} >
                                Storage {storage}
                            </option>
                        ))}
                    </select>
                    <input type="text" value={busqueda} onChange={event =>
                            setBusqueda(event.target.value) }
                        placeholder="Buscar ubicación o material..." />
                </div>
            </div>

            {loading ? (
                <div className={styles.tableMessage}>Cargando ubicaciones...</div>
            ) : error ? (
                <div className={styles.tableError}>{error}</div>
            ) : (
                <>
                    <div className={styles.tableInfoRow}>
                        <div className={styles.tableInfo}>
                            Mostrando{" "}
                            <strong>
                                {Math.min(ubicacionesFiltradas.length, limiteFilas).toLocaleString("es-AR")}
                            </strong>
                            {" "}de{" "}
                            <strong>
                                {ubicacionesFiltradas.length.toLocaleString("es-AR")}
                            </strong>
                            {" "}ubicaciones
                        </div>

                        <div className={styles.contentFilters}>
                            <label className={styles.contentFilter}>
                                <input type="checkbox" checked={mostrarLlenas}
                                    onChange={event => setMostrarLlenas(event.target.checked)} />
                                <span>Mostrar ubicaciones llenas</span>
                            </label>

                            <label className={styles.contentFilter}>
                                <input type="checkbox" checked={mostrarVacias}
                                    onChange={event => setMostrarVacias(event.target.checked)} />
                                <span>Mostrar ubicaciones vacías</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.bulkActions}>
                        <button type="button" onClick={seleccionarVisibles} className={styles.bulkButton} >
                            ☑ Seleccionar visibles
                        </button>

                        <button type="button"
                            onClick={() => agregarUbicaciones(25)} className={styles.bulkButton} >
                            +25
                        </button>

                        <button type="button"
                            onClick={() => agregarUbicaciones(50)} className={styles.bulkButton} >
                            +50
                        </button>

                        <button type="button"
                            onClick={() => agregarUbicaciones(100)} className={styles.bulkButton} >
                            +100
                        </button>

                        <button type="button"
                            onClick={completarTarget} className={styles.completeTargetButton}
                            disabled={ubicacionesSeleccionadas.size >= target} >
                            🎯 Completar target
                        </button>

                        <button type="button"
                            onClick={limpiarSeleccion} className={styles.clearButton}
                            disabled={ubicacionesSeleccionadas.size === 0} >
                            Limpiar
                        </button>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.locationsTable}>
                            <colgroup>
                                <col className={styles.colCheck} />
                                <col className={styles.colStorage} />
                                <col className={styles.colUbicacion} />
                                <col className={styles.colMaterial} />
                            </colgroup>

                            <thead>
                                <tr>
                                    <th className={styles.checkColumn}>
                                        ✓
                                    </th>
                                    <th>Storage</th>
                                    <th>Ubicación</th>
                                    <th>Material</th>
                                </tr>
                            </thead>

                            <tbody>
                                {ubicacionesVisibles.map(item => {
                                    const seleccionada = ubicacionesSeleccionadas.has(item.key);
                                    return (
                                        <tr key={item.key}
                                            className={seleccionada ? styles.selectedRow : ""}
                                            onClick={() => toggleUbicacion(item.key)} >
                                            <td className={styles.checkColumn} >
                                                <input type="checkbox" checked={seleccionada}
                                                    onChange={() => toggleUbicacion(item.key)}
                                                    onClick={event => event.stopPropagation()} />
                                            </td>
                                            <td>
                                                {item.storage}
                                            </td>
                                            <td>
                                                <strong>{item.ubicacion}</strong>
                                            </td>
                                            <td>
                                                {item.materiales.length > 0 ? item.materiales.join(", ") : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
};

export default PlanificacionLocations;