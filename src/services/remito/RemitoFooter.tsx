import "./RemitoStyles.css";
import type { Remito } from "../../core/remitos/Remito";

interface Props{
    remito: Remito;
}

const RemitoFooter: React.FC<Props> = ({ remito }) => {
    return (
        console.log(remito),
        <div className="footer">
            <div className="footerTitle">
                CONFORME DE RECEPCIÓN
            </div>
            <div className="footerContent">
                <div className="firmasBox">
                    <p className="footerHeading">
                        <strong>Entrega (Chofer)</strong>
                    </p>
                    <div className="footerSpacer"></div>
                    <p className="footerP">
                        Firma
                    </p>
                    <div className="footerSpacer"></div>
                    <p>
                        Aclaración
                        <span className="fechaHora">
                            Fecha y Hora
                        </span>
                    </p>
                </div>

                <div className="footerRight">
                    <p className="footerHeading">
                        <strong>Recibe</strong>
                    </p>
                    <div className="footerSpacer"></div>
                    <p className="footerP">
                        Firma / Sello
                    </p>
                    <div className="footerSpacer"></div>
                    <p>
                        Aclaración
                        <span className="fechaHora">
                            Fecha y Hora
                        </span>
                    </p>
                </div>
            </div>
            <div className="footerBottom">
                <span className="footerLeft">
                    CAI Nº 522128217779710
                    &nbsp;&nbsp;&nbsp;
                    Fecha de Vto: 21/09/2026
                </span>
                <span className="footerRightText">
                    Hoja 1 de 1
                </span>
            </div>
        </div>
    );
};

export default RemitoFooter;