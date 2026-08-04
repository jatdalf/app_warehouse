import type { PickingMethod } from "./PickingMethod";
import { PickingMethods } from "./PickingMethod";
import type { PickingSortStrategy } from "./PickingSortStrategy";
import { LocationStrategy } from "./LocationStrategy";
import { AccessibilityStrategy } from "./AccessibilityStrategy";

export class PickingStrategyFactory {
    static create(type: PickingMethod): PickingSortStrategy {
        switch (type) {
            case PickingMethods.ACCESSIBILITY:
                return new AccessibilityStrategy();
            case PickingMethods.LOCATION:
            default:
                return new LocationStrategy();
        }
    }
}