export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Método no permitido."
        });
    }

    try {
        const {
            warehouse,
            fechaDesde,
            fechaHasta
        } = req.body ?? {};

        if (!warehouse) {
            return res.status(400).json({
                success: false,
                error: "Warehouse requerido."
            });
        }

        if (!fechaDesde || !fechaHasta) {
            return res.status(400).json({
                success: false,
                error: "Rango de fechas requerido."
            });
        }

        const scriptUrl =
            process.env.INVENTARIOS_PLANIFICACION_SCRIPT_URL;

        if (!scriptUrl) {
            throw new Error(
                "No está configurada INVENTARIOS_PLANIFICACION_SCRIPT_URL."
            );
        }

        const response = await fetch(
            scriptUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    accion: "obtenerPlanificacionSemanal",
                    warehouse,
                    fechaDesde,
                    fechaHasta
                })
            }
        );

        const texto = await response.text();

        if (!response.ok) {
            throw new Error(
                `Apps Script respondió ${response.status}`
            );
        }

        if (!texto) {
            throw new Error(
                "Apps Script no devolvió contenido."
            );
        }

        let data;

        try {
            data = JSON.parse(texto);
        } catch {
            throw new Error(
                "Apps Script no devolvió JSON válido."
            );
        }

        if (!data.success) {
            throw new Error(
                data.error ??
                "No fue posible obtener las planificaciones."
            );
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error(
            "Error obteniendo planificación semanal:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Error interno."
        });
    }
}