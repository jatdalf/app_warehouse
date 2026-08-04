import "./RemitoStyles.css";
import type { Remito } from "../../core/remitos/Remito";
import {CUSTOMER, SOURCE_OFFICE} from "../../core/remitos/RemitoConfig";

interface Props{
    remito: Remito;
}

const RemitoCustomer: React.FC<Props> = ({ remito }) => {
  const {
    name,
    adress,
    zipCode,
    state,
    sapId,
    sapAp
  } = CUSTOMER;

  const {
    office,
    adress: officeAdress,
    zipCode: officeZipCode,
    state: officeState
  } = SOURCE_OFFICE;

    return(
      <div className="body">
        
        <div className="leftSection">
          <p>Por cuenta y orden de: {name}</p>
          <p>Solic: {sapId} - AP: {sapAp}</p>
          <p>Domicilio: {adress}</p>
          <p>Código Postal: {zipCode}</p>
          <p>Localidad: {state} </p>

          <hr />
            <p>Detalles de Origen - {office}</p>
            <p>Domicilio: {officeAdress}</p>
            <p>Código Postal: {officeZipCode}</p>
            <p>Localidad: {officeState}</p>
          <hr />

          <p>
            Detalles de entrega - Pedido Nº:
            <strong> {remito.pedido}</strong>
          </p>
          <p>
            Destinatario:
            <strong> {remito.destinoNombre}</strong>
          </p>
          <p>
            Domicilio:
            <strong>{remito.destino.domicilio}</strong>
          </p>

          <p>
            Localidad:
            <strong>{remito.destino.localidad}</strong>
            {" · "}
            CP:
            <strong>{remito.destino.cp}</strong>
          </p>

          <p>
            Guía Remito:
            <strong> {remito.pedido}</strong>
          </p>

          <hr />
        </div>

        <div className="rightSection">
          <p className="barcodeLarge">
            *{remito.pedido}*
          </p>

          <p className="guiaRemito">
            {remito.pedido}
          </p>
        </div>
      </div>
    )
};

export default RemitoCustomer