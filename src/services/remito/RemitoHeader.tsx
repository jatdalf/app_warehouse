import "./RemitoStyles.css";
import type { Remito } from "../../core/remitos/Remito";

interface Props{
    remito: Remito;
}

const RemitoHeader: React.FC<Props> = ({ remito }) => {
  return (
    <div className="header">
      <div className="leftBox">
        <p>Organización Courier Argentina S.A (OCASA)</p>
        <p>R.N.P.S.P N° 731</p>
        <p>Echeverría 1262/64 - C1428DQN - Capital Federal</p>
        <p>I.V.A.: RESPONSABLE INSCRIPTO</p>
      </div>

      <div className="centerBox">
        <span className="bigR">R</span>
      </div>

      <div className="rightBox">
        <p>Remito Nº: {remito.numero}</p>
        <p className="barcode">
            *{remito.numero}*
        </p>
        <p>Fecha de Emisión: {remito.fecha}</p>
        <p>C.U.I.T. Nº 30-66204961-8</p>
        <p>Ingresos Brutos Nº 901995900-0</p>
        <p>Inicio de Actividades: 01/07/1993</p>
      </div>
    </div>
  );
};

export default RemitoHeader;