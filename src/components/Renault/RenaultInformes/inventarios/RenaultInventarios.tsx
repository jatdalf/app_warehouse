import InventarioSapInforme from "./InventarioSapInforme";
import InvRenaultHeader from "./invRenaultHeader/InvRenaultHeader"

const RenaultInventarios = ()=>{
    return(
        <div>
            <InvRenaultHeader />
            <InventarioSapInforme />
        </div>
    )
}

export default RenaultInventarios;