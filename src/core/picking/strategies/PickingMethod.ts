export const PickingMethods = {
    LOCATION: "LOCATION",
    ACCESSIBILITY: "ACCESSIBILITY"
} as const;

export type PickingMethod = typeof PickingMethods[keyof typeof PickingMethods];