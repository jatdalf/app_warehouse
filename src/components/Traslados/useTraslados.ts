import { useState } from "react";

/* =======================
   TIPOS
======================= */

export interface Traslado {
  origen: string;
  articulo: string;
  loteProveedor: string;
  cantidad: number;
  codigoSap: string;
  loteSap: string;
  destino: string;
}

/* =======================
   HOOK
======================= */

export const useTraslados = () => {
  const [traslados, setTraslados] = useState<Traslado[]>([]);

  const agregarTraslado = (traslado: Traslado) => {
    setTraslados((prev) => [...prev, traslado]);
  };

  const resetTraslados = () => {
    setTraslados([]);
  };

  return {
    traslados,
    agregarTraslado,
    resetTraslados,
  };
};
