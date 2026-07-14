const API_URL =
"https://script.google.com/macros/s/AKfycbyyWV0NyHZe9y1wmD7Lu8T-XS6bKxm_DrapGy366xN9mMXcCvisuHTtkTyPGJvZfBs6/exec";

export interface RemitoResponse{
    st:string;
    remito:string;
}

export async function obtenerRemitos(
    usuario:string,
    sts:string[]
):Promise<RemitoResponse[]>{

    const response=await fetch(API_URL,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            usuario,
            sts
        })
    });

    if(!response.ok){
        throw new Error("No fue posible obtener los remitos.");
    }

    const data=await response.json();

    if(!data.success){
        throw new Error(data.error);
    }

    return data.remitos;

}