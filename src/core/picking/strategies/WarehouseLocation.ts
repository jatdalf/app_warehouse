export interface ParsedLocation {
    warehouse: string;
    aisle: string;
    rack: number;
    level: number;
    physicalLevel: number;
    subLevel: number;
}
const LEVEL_COST: Record<number, number> = {
    10: 1,
    20: 2,
    30: 5,
    40: 5,
    50: 10,
    60: 15
};
export class WarehouseLocation {
    static parse(value: string): ParsedLocation {
        const [sector, rackText, levelText] = value.split(".");
        const warehouse = sector.charAt(0);
        const aisle = sector.charAt(1);
        const rack = Number(rackText);
        const level = Number(levelText);
        return {
            warehouse,
            aisle,
            rack,
            level,
            physicalLevel: this.getPhysicalLevel(level),
            subLevel: level % 10
        };
    }

    static getPhysicalLevel(level: number): number {
        return Math.floor(level / 10) * 10;
    }

    static getOperationCost(level: number): number {
        return (
            LEVEL_COST[this.getPhysicalLevel(level)] ?? 100
        );
    }
    static compareByAccessibility(a: ParsedLocation, b: ParsedLocation): number {
        const costA = this.getOperationCost(a.level);
        const costB = this.getOperationCost(b.level);
        if (costA !== costB) {
            return costA - costB;
        }
        if (a.aisle !== b.aisle) {
            return a.aisle.localeCompare(b.aisle);
        }
        if (a.rack !== b.rack) {
            return a.rack - b.rack;
        }
        return a.subLevel - b.subLevel;
    }
    static compareByLocation(a: ParsedLocation, b: ParsedLocation): number {
        if (a.aisle !== b.aisle) {
            return a.aisle.localeCompare(b.aisle);
        }
        if (a.rack !== b.rack) {
            return a.rack - b.rack;        }

        return a.level - b.level;
    }
}