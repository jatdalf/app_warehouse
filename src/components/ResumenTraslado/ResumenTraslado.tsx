import styles from "./ResumenTraslado.module.css";

interface ResumenTrasladoProps {
  origen: string;
  articulo: string;
  loteProveedor: string;
  cantidad: number;
  codigoSap: string;
  loteSap: string;
  destino: string;
  onConfirmar: () => void;
}

const ResumenTraslado: React.FC<ResumenTrasladoProps> = ({
  origen,
  articulo,
  loteProveedor,
  cantidad,
  codigoSap,
  loteSap,
  destino,
  onConfirmar,
}) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Origen</th>
            <th>Artículo</th>
            <th>Lote</th>
            <th>Cantidad</th>
            <th>Código SAP</th>
            <th>Lote SAP</th>
            <th>Destino</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{origen}</td>
            <td>{articulo}</td>
            <td>{loteProveedor}</td>
            <td>{cantidad}</td>
            <td>{codigoSap}</td>
            <td>{loteSap}</td>
            <td>{destino}</td>
          </tr>
        </tbody>
      </table>

      <div className={styles.confirmWrapper}>
        <button className={styles.confirmBtn} onClick={onConfirmar}>
          Confirmar traslados
        </button>
      </div>
    </div>
  );
};

export default ResumenTraslado;
