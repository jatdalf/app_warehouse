import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./InventoryDetail.module.css";

interface RegistroInventario {
  fecha: string | number;
  almacen: string;
  ubicacion: string;
  material: string;
  nombre: string;
  totalTeorico: number;
  contado: number;
  resultado: number;
}

const InventoryDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registros = (location.state?.registros as RegistroInventario[]) || [];

  const registrosDiferencia = registros.filter((r) => r.resultado !== 0);
  const registrosOk = registros.filter((r) => r.resultado === 0);

  // Función para convertir fecha Excel a dd/mm/yyyy
  const excelDateToJSDate = (serial: number): Date => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = (utc_days + 1) * 86400;
    return new Date(utc_value * 1000);
  };

  const formatFecha = (fecha: string | number): string => {
    let fechaObj: Date;
    if (typeof fecha === "number") {
      fechaObj = excelDateToJSDate(fecha);
    } else {
      fechaObj = new Date(fecha);
    }
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(fechaObj);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Diferencias encontradas</h2>
      <table className={styles.tableDiferencia}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Almacén</th>
            <th>Ubicación</th>
            <th>Material</th>
            <th>Nombre</th>
            <th>Total Teórico</th>
            <th>Contado</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {registrosDiferencia.length === 0 ? (
            <tr>
              <td colSpan={8} className={styles.empty}>No se encontraron diferencias</td>
            </tr>
          ) : (
            registrosDiferencia.map((r, idx) => (
              <tr key={idx}>
                <td>{formatFecha(r.fecha)}</td>
                <td>{r.almacen}</td>
                <td>{r.ubicacion}</td>
                <td>{r.material}</td>
                <td>{r.nombre}</td>
                <td>{r.totalTeorico}</td>
                <td>{r.contado}</td>
                <td>{r.resultado}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2 className={styles.title}>Ubicaciones Ok</h2>
      <table className={styles.tableOk}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Almacén</th>
            <th>Ubicación</th>
            <th>Material</th>
            <th>Nombre</th>
            <th>Total Teórico</th>
            <th>Contado</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {registrosOk.length === 0 ? (
            <tr>
              <td colSpan={8} className={styles.empty}>No hay ubicaciones Ok</td>
            </tr>
          ) : (
            registrosOk.map((r, idx) => (
              <tr key={idx}>
                <td>{formatFecha(r.fecha)}</td>
                <td>{r.almacen}</td>
                <td>{r.ubicacion}</td>
                <td>{r.material}</td>
                <td>{r.nombre}</td>
                <td>{r.totalTeorico}</td>
                <td>{r.contado}</td>
                <td>{r.resultado}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles.buttonContainer}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default InventoryDetail;

