const APPS_SCRIPT_URL =
    process.env.REMITOS_SCRIPT_URL;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({error: "Método no permitido"});
    }

    try {
        if (!APPS_SCRIPT_URL) {throw new Error("REMITOS_SCRIPT_URL no está configurada.");}
        const { sts, usuario } = req.body;
        const response = await fetch( APPS_SCRIPT_URL,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({accion: "obtenerRemitos", sts, usuario})
            }
        );

        if (!response.ok) {
            throw new Error(`Apps Script respondió ${response.status}`);
        }
        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error obteniendo remitos:", error);
        return res.status(500).json({error: "No fue posible obtener los números de remito."});
    }
}