const APPS_SCRIPT_URL=process.env.REMITOS_SCRIPT_URL;

async function obtenerRemitos(sts,usuario){
    if(!APPS_SCRIPT_URL){
        throw new Error("REMITOS_SCRIPT_URL no está configurada.");
    }

    const response=await fetch(APPS_SCRIPT_URL,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            accion:"obtenerRemitos",
            sts,
            usuario
        })
    });

    if(!response.ok){
        throw new Error(`Apps Script respondió ${response.status}`);
    }

    return await response.json();
}

module.exports={
    obtenerRemitos
};