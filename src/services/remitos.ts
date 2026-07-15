import {post} from "./api";

export interface Remito{
    st:string;
    remito:string;
}

interface ObtenerRemitosResponse{
    success:boolean;
    remitos:Remito[];
}

export async function obtenerRemitos(
    sts:string[],
    usuario:string
):Promise<Remito[]>{

    const response=await post<ObtenerRemitosResponse>(
        "/remitos",
        {
            sts,
            usuario
        }
    );

    return response.remitos;
}