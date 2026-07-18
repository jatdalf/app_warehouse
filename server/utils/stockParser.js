const XLSX = require("xlsx");
const { obtenerIndiceColumnas } = require("./excelHelper");

function parseStock(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return 0;
    }
    if (typeof valor === "number") {
        return Math.trunc(valor);
    }
    return Math.trunc(Number(String(valor).replace(",", ".")));
}

function compararUbicaciones(a, b) {
    const pa = a.split(".");
    const pb = b.split(".");
    const zonaA = pa[0] ?? "";
    const zonaB = pb[0] ?? "";
    if (zonaA !== zonaB) {
        return zonaA.localeCompare(zonaB);
    }
    for (let i = 1; i < 3; i++) {
        const na = Number(pa[i] ?? 0);
        const nb = Number(pb[i] ?? 0);
        if (na !== nb) {
            return na - nb;
        }
    }

    return 0;
}

function consolidarStock(registros) {
    const mapa = new Map();
    registros.forEach(r => {
        const key = `${r.articulo}|${r.ubicacion}`;
        if (!mapa.has(key)) {
            mapa.set(key, {
                articulo: r.articulo,
                ubicacion: r.ubicacion,
                stock: 0
            });
        }
        mapa.get(key).stock += r.stock;
    });
    return [...mapa.values()];
}

function parseStockWorkbook(buffer) {
    const workbook = XLSX.read(buffer, {
        type: "buffer"
    });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: ""
    });
    const header=rows[0];
    const columnas = obtenerIndiceColumnas(header, {
    articulo: "Artículo",
    ubicacion: "Ubicación",
    stock: "Stock físico"
    });
    const resultado = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const articulo=String(row[columnas.articulo]??"").trim();
        const ubicacion = String(row[columnas.ubicacion] ?? "").trim();
        const stock = parseStock(row[columnas.stock]);
        if (!articulo) continue;
        if (!ubicacion) continue;
        if (stock <= 0) continue;
        resultado.push({
            articulo,
            ubicacion,
            stock
        });
    }

    const consolidado = consolidarStock(resultado);
    consolidado.sort((a, b) => {
        if (a.articulo !== b.articulo) {
            return a.articulo.localeCompare(b.articulo);
        }
        return compararUbicaciones(
            a.ubicacion,
            b.ubicacion
        );

    });
    return consolidado;
}

module.exports = {
    parseStockWorkbook,
    compararUbicaciones,
    consolidarStock,
    parseStock
};