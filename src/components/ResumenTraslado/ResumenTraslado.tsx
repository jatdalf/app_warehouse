import styles from "./ResumenTraslado.module.css";
import { useIsMobile } from "../hooks/useIsMobile";

interface Props {
  origen: string;
  articulo: string;
  loteProveedor: string;
  cantidad: number;
  codigoSap: string;
  loteSap: string;
  destino: string;
  onConfirmar?: () => void; 
  onAgregar: () => void;  
}

const ResumenTraslado: React.FC<Props> = (props) => {
  const isMobile = useIsMobile();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Artículo</th>
            <th>Cantidad</th>
            <th>Desde</th>
            <th>Hacia</th>

            {!isMobile && (
              <>
                <th>Lote Prov.</th>
                <th>Cód. SAP</th>
                <th>Lote SAP</th>
              </>
            )}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>{props.articulo}</td>
            <td>{props.cantidad}</td>
            <td>{props.origen}</td>
            <td>{props.destino}</td>

            {!isMobile && (
              <>
                <td>{props.loteProveedor}</td>
                <td>{props.codigoSap}</td>
                <td>{props.loteSap}</td>
              </>
            )}
          </tr>
        </tbody>
      </table>

      <button className={styles.confirmBtn} onClick={props.onConfirmar}>
        Confirmar traslados
      </button>
    </div>
  );
};

export default ResumenTraslado;
