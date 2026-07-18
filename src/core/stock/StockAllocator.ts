import type { StockItem } from "./StockItem";
import type { PickingItem } from "../picking/PickingItem";
import type { PickingResult } from "../picking/PickingResult";

export function buscarUbicacionesPorSKU(
    stock: StockItem[],
    sku: string
): StockItem[]{

    return stock
        .filter(item=>item.articulo===sku)
        .sort((a,b)=>
            compararUbicaciones(
                a.ubicacion,
                b.ubicacion
            )
        );
}

export function distribuirCantidad(
    ubicaciones: StockItem[],
    cantidad: number,
    st: string,
    sku: string,
    descripcion: string
): PickingResult{

    const resultado: PickingItem[] = [];
    let pendiente = cantidad;
    for(const ubicacion of ubicaciones){
        if(pendiente<=0){
            break;
        }
        const tomar = Math.min(
            pendiente,
            ubicacion.stock
        );

        if(tomar>0){
            resultado.push({
                st,
                sku,
                descripcion,
                cantidad: tomar,
                ubicacion: ubicacion.ubicacion
            });
            pendiente -= tomar;
        }
    }
    return{
    items:resultado,
    pendiente
};
}

function compararUbicaciones(
    a:string,
    b:string
){

    const pa=a.split(".");
    const pb=b.split(".");

    if(pa[0]!==pb[0]){
        return pa[0].localeCompare(pb[0]);
    }

    for(let i=1;i<3;i++){

        const na=Number(pa[i]??0);
        const nb=Number(pb[i]??0);

        if(na!==nb){
            return na-nb;
        }

    }

    return 0;

}