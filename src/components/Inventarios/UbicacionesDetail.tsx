// src/components/Inventarios/UbicacionesDetail.tsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./Inventarios.module.css";

interface RegistroUbicacion {
  tipoAlmacen: string;
  ubicacion: string;
}

const UbicacionesDetail: React.FC = () => {
  const location = useLocation();
  const registros: RegistroUbicacion[] = location.state?.registros || [];

  // ✅ Estado para filtro
  const [tipoFiltro, setTipoFiltro] = useState<string>("");

  // ✅ Filtrar registros por tipo almacén
  const registrosFiltrados = tipoFiltro
    ? registros.filter((r) => r.tipoAlmacen === tipoFiltro)
    : registros;

  // ✅ Obtener lista única de tipos de almacén para el combo
  const tiposAlmacenUnicos = Array.from(new Set(registros.map((r) => r.tipoAlmacen)));

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Ubicaciones sin inventariar ({registrosFiltrados.length})
      </h2>

      {/* Filtro por Tipo almacén */}
      <div className={styles.filterContainer}>
        <label className={styles.InventoryLabel}>Filtrar por tipo almacén: </label>
        <select
          className={styles.UbicacionesSelect}
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
        >
          <option value="">Todos</option>
          {tiposAlmacenUnicos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla con estética similar a Ubicaciones OK */}
      <table className={styles.tableUbicaciones}>
        <thead>
          <tr>
            <th>Tipo almacén</th>
            <th>Ubicación</th>
          </tr>
        </thead>
    <tbody>
      {registrosFiltrados.map((r, idx) => (
        <tr key={idx}>
          <td data-label="Tipo almacén">{r.tipoAlmacen}</td>
          <td data-label="Ubicación">{r.ubicacion}</td>
        </tr>
      ))}
    </tbody>

      </table>
    </div>
  );
};

export default UbicacionesDetail;

