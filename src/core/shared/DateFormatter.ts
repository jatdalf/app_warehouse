const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic"
];

function getDateParts(date = new Date()) {
    return {
        dia: String(date.getDate()).padStart(2, "0"),
        mesTexto: meses[date.getMonth()],
        mesNumero: String(date.getMonth() + 1).padStart(2, "0"),
        anio: date.getFullYear(),
        hora: String(date.getHours()).padStart(2, "0"),
        minutos: String(date.getMinutes()).padStart(2, "0")
    };
}

export function formatPrintDate(): string {
    const {
        dia,
        mesTexto,
        anio,
        hora,
        minutos
    } = getDateParts();
    return `${dia}/${mesTexto}/${anio} ${hora}:${minutos}`;
}

export function formatShortDate(): string {
    const {
        dia,
        mesTexto,
        anio
    } = getDateParts();
    return `${dia}/${mesTexto}/${anio}`;
}

export function formatFileDate(): string {
    const {
        dia,
        mesNumero,
        anio,
        hora,
        minutos
    } = getDateParts();
    return `${anio}${mesNumero}${dia}_${hora}${minutos}`;
}