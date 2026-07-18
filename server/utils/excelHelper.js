function obtenerIndiceColumnas(header, columnas) {

    const resultado = {};

    Object.entries(columnas).forEach(([key, nombre]) => {

        const indice = header.findIndex(col =>
            String(col)
                .trim()
                .toLowerCase() ===
            String(nombre)
                .trim()
                .toLowerCase()
        );

        if (indice === -1) {
            throw new Error(`No se encontró la columna "${nombre}"`);
        }

        resultado[key] = indice;

    });

    return resultado;

}

module.exports = {
    obtenerIndiceColumnas
};