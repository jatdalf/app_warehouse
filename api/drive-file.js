export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({error: "Método no permitido"});
    }
    try {
        const { fileId } = req.body;
        if (!fileId) {
            return res.status(400).json({error: "Falta fileId"});
        }
        const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google Drive respondió ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return res.status(200).json({success: true, base64});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error instanceof Error
                    ? error.message : "No fue posible obtener el archivo."
        });
    }
}