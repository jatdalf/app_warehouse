const APPS_SCRIPT_URL =
    process.env.INVENTARIOS_PLANIFICACION_SCRIPT_URL;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método no permitido"
        });
    }

    try {
        if (!APPS_SCRIPT_URL) {
            throw new Error(
                "INVENTARIOS_PLANIFICACION_SCRIPT_URL no está configurada."
            );
        }

        const {
            warehouse,
            fecha,
            targetDiario,
            tipoPlanificacion,
            posiciones,
            usuario
        } = req.body;

        if (!warehouse) {
            return res.status(400).json({
                error: "No se recibió el warehouse."
            });
        }

        if (!fecha) {
            return res.status(400).json({
                error: "No se recibió la fecha."
            });
        }

        if (!Array.isArray(posiciones) || posiciones.length === 0) {
            return res.status(400).json({
                error: "No se recibieron posiciones."
            });
        }

        const response = await fetch(
            APPS_SCRIPT_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    accion: "guardarPlanificacion",
                    warehouse,
                    fecha,
                    targetDiario,
                    tipoPlanificacion,
                    posiciones,
                    usuario: usuario ?? ""
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                `Apps Script respondió ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error ??
                "Apps Script no pudo guardar la planificación."
            );
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error(
            "Error guardando planificación:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "No fue posible guardar la planificación."
        });
    }
}