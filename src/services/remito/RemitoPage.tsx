import type { Remito } from "../../core/remitos/Remito";
import RemitoHeader from "./RemitoHeader";
import RemitoCustomer from "./RemitoCustomer";
import RemitoProducts from "./RemitoProducts";
import RemitoFooter from "./RemitoFooter";

interface Props{
    remito: Remito;
}

const RemitoPage: React.FC<Props> = ({ remito }) => {
    return (
        <div className="remito">
            <div className="container">
                <RemitoHeader remito={remito} />
                <RemitoCustomer remito={remito} />
                <RemitoProducts remito={remito} />
                <RemitoFooter remito={remito} />
            </div>
        </div>
    );
};

export default RemitoPage;