import type { Remito } from "../../core/remitos/Remito";
import RemitoPage from "./RemitoPage";

interface Props{
    remitos: Remito[];
}

const RemitoDocument: React.FC<Props> = ({ remitos }) => {
    return (
        <>
            {remitos.map((remito) => (
                <RemitoPage
                    key={remito.numero}
                    remito={remito}
                />
            ))}
        </>
    );
};

export default RemitoDocument;