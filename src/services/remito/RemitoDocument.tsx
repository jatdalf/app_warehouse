import type { Remito } from "../../core/remitos/Remito";
import RemitoPage from "./RemitoPage";

interface Props {
    remitos: Remito[];
}

const COPIAS = [
    "ORIGINAL",
    "DUPLICADO",
    "TRIPLICADO"
] as const;

const RemitoDocument: React.FC<Props> = ({ remitos }) => {
    return (
        <>
            {remitos.flatMap((remito) =>
                COPIAS.map((copia) => {
                    const remitoCopia: Remito = {
                        ...remito,
                        copia
                    };

                    return (
                        <RemitoPage
                            key={`${remito.numero}-${copia}`}
                            remito={remitoCopia}
                        />
                    );
                })
            )}
        </>
    );
};

export default RemitoDocument;