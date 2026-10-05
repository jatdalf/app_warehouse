import type { PeyaBranch } from "../../../core/remitos/RemitoConfig";

const PEYA_BRANCH_KEY = "peya_branch";

export const getPeyaBranch = (): PeyaBranch => {
    const branch = localStorage.getItem(PEYA_BRANCH_KEY);

    if (branch === "COR" || branch === "BUE") {
        return branch;
    }

    throw new Error(
        "No hay una sucursal PeYa seleccionada."
    );
};