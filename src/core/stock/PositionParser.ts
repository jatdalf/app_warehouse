export interface ParsedPosition {
    warehouse: string;
    aisle: string;
    rack: number;
    level: number;
    subLevel: number;
}

export class PositionParser {
    static parse(position: string): ParsedPosition {
        const [zone, rackText, levelText] = position.split(".");
        const warehouse = zone.charAt(0);
        const aisle = zone.charAt(1);
        const rack = Number(rackText);
        const level = Math.floor(Number(levelText) / 10) * 10;
        const subLevel = Number(levelText) % 10;
        return {
            warehouse,
            aisle,
            rack,
            level,
            subLevel
        };
    }
    
}
