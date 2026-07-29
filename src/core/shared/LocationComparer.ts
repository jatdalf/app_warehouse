export class LocationComparer {
    static compare(a: string, b: string): number {
        const pa = a.split(".");
        const pb = b.split(".");
        if (pa[0] !== pb[0]) {
            return pa[0].localeCompare(pb[0]);
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
    static getSector(ubicacion: string): string {
        return ubicacion.split(".")[0];
    }
}