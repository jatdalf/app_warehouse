import type { Remito } from "../../../../core/remitos/Remito";
import { RemitoPrintService } from "../../../../services/remito/RemitoPrintService";

interface Props {
    remitos: Remito[];
}

const RemitoSection: React.FC<Props> = ({ remitos }) => {
    return (
        <div>
            <button onClick={() => RemitoPrintService.imprimir(remitos)}>
                🖨 Imprimir todos los remitos
            </button>
            <hr />
            {remitos.map(remito => (
                <div
                    key={remito.numero}
                    style={{ marginBottom: 12 }}
                >
                    <strong>
                        {remito.numero}
                    </strong>
                    <br />
                    Pedido:
                    {" "}
                    {remito.pedido}
                    <br />
                    Destino:
                    {" "}
                    {remito.destinoNombre}
                </div>
            ))}
        </div>
    );
};

export default RemitoSection;