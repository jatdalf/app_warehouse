interface RemitoAsignado {
    st: string;
    remito: string;
}

interface RemitosResponse {
    success: boolean;
    remitos: RemitoAsignado[];
    error?: string;
}

export async function obtenerRemitos( sts: string[], usuario: string): Promise<RemitoAsignado[]> {
    const response = await fetch("/api/remitos",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({sts, usuario})
        }
    );
    const data = await response.json() as RemitosResponse;

    if (!response.ok) {
        throw new Error(data.error ?? `Error HTTP ${response.status}`);
    }

    if (!data.success || !Array.isArray(data.remitos)) {
        throw new Error( "Respuesta de remitos inválida." );
    }
    return data.remitos;
}