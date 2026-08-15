export class EgresoBillingCalendar {

    static fechaEntrega(fechaArmado: Date): Date {
        const fecha = new Date(fechaArmado.getFullYear(), fechaArmado.getMonth(), fechaArmado.getDate());
        const dia = fecha.getDay();
        if (dia === 6 || dia === 0) {
            return fecha;
        }
        fecha.setDate(fecha.getDate() + 1);
        return fecha;
    }
}