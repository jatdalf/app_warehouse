export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Método no permitido"
        });
    }
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: "Falta usuario o contraseña"
            });
        }
        const validUsername = process.env.OCUPACION_USERNAME;
        const validPassword = process.env.OCUPACION_PASSWORD;
        
        console.log("LOGIN ENV", {
    usernameDefined: !!process.env.OCUPACION_USERNAME,
    passwordDefined: !!process.env.OCUPACION_PASSWORD
});
        if ( username !== validUsername || password !== validPassword ) {
            return res.status(401).json({
                success: false,
                error: "Usuario o contraseña incorrectos"
            });
        }
        return res.status(200).json({
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Error al validar las credenciales."});
    }
}