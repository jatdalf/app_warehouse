// src/components/Inventarios/InventariosGrid.tsx
import { Pie } from "react-chartjs-2";
import styles from "./Inventarios.module.css";
import { useNavigate } from "react-router-dom";
import InventariosWeeklyChart from "./InventariosWeeklyChart";

interface InventariosGridProps {
  countPosiciones: number;
  countOk: number;
  countDiferencia: number;
  resumenInventarios: {
    cantidadPosiciones: number;
    inventariosOk: number;
    inventariosDiferencia: number;
  };
  pieInventarios: any;
  meses: string[];
  mesesSeleccionados: string[];
  setMesesSeleccionados: (meses: string[]) => void;
  registrosFiltrados: any[];
  ultimaFecha: string;
  feriados: Date[];
}

const InventariosGrid: React.FC<InventariosGridProps> = ({
  countPosiciones,
  countOk,
  countDiferencia,
  resumenInventarios,
  pieInventarios,
  meses,
  mesesSeleccionados,
  setMesesSeleccionados,
  registrosFiltrados,
  ultimaFecha,  
  feriados
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.layout}>
    <div className={styles.inventoryKpis}>
      <div className={`${styles.inventoryKpi} ${styles.inventoryKpiMain}`}>
        <strong>{countPosiciones.toLocaleString("es-AR")}</strong>
        <span>Inventarios realizados</span>
        <small>Total del período</small>
      </div>

      <div className={styles.inventoryKpi}>
        <strong>{countOk.toLocaleString("es-AR")}</strong>
        <span>Inventarios OK</span>
        <small>{resumenInventarios.cantidadPosiciones > 0 ? (
                resumenInventarios.inventariosOk / resumenInventarios.cantidadPosiciones * 100
              ).toLocaleString("es-AR",{ minimumFractionDigits: 2, maximumFractionDigits: 2})
            : "0,00"}%
        </small>
      </div>

      <div className={styles.inventoryKpi}>
        <strong>{countDiferencia.toLocaleString("es-AR")}</strong>
        <span>Con diferencia</span>
        <small>{resumenInventarios.cantidadPosiciones > 0 ? (
                resumenInventarios.inventariosDiferencia / resumenInventarios.cantidadPosiciones * 100
              ).toLocaleString("es-AR",{minimumFractionDigits: 2, maximumFractionDigits: 2})
            : "0,00"} %
        </small>
      </div>

    </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: "250px", height: "250px" , marginLeft:"-50px"}}>
          <Pie data={pieInventarios} />
        </div>
        <div style={{ marginLeft: "20px" }}>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* ✅ Fieldset con meses */}
      <fieldset className={styles.fieldsetMeses}>
        <legend className={styles.legendMeses}>Visualizar</legend>
    
<select
  multiple
  size={12}   // ✅ muestra todos los meses sin scroll
  className={styles.InventorySelect}
  value={mesesSeleccionados}
  onChange={(e) =>
    setMesesSeleccionados(
      Array.from(e.target.selectedOptions, (opt) => opt.value)
    )
  }
>
  {meses.map((mes) => (
    <option key={mes} value={mes}>
      {mes}
    </option>
  ))}
</select>

    </fieldset>
  </div>

   <div style={{ marginTop: "10px" }}>
        <button
          className={styles.InventoryDetailButton}
          onClick={() =>
            navigate("/InventoryDetail", { state: { registros: registrosFiltrados } })
          }
        >
          Ver detalles
        </button>
      </div>
</div>
      </div>

      <div className={styles.InventoryLabel}>
        ( Última actualización {ultimaFecha} )
      </div>
      <div className={styles.weeklyChart}>
        <InventariosWeeklyChart registros={registrosFiltrados} feriados={feriados} 
        fechaCorte={ultimaFecha} mesesSeleccionados={mesesSeleccionados}/>
    </div>
    </div>
  );
};

export default InventariosGrid;