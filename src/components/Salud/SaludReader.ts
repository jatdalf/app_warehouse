import * as XLSX from "xlsx";
import type { SaludStock, SaludMaterial } from "./SaludData";
import { texto, codigo } from "./SaludData";
const normalizar = (v: unknown) => texto(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g," ");
export function filasExcel(bytes: ArrayBuffer | Uint8Array, requeridos: string[]): { headers: string[]; rows: unknown[][] } {
    const wb=XLSX.read(bytes,{type:"array",cellDates:true});
    for(const nombre of wb.SheetNames) {
        const rows=XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[nombre],{header:1,defval:"",raw:true});
        const indice=rows.findIndex(row=>requeridos.every(c=>row.some(v=>normalizar(v)===normalizar(c))));
        if(indice>=0) return {headers:rows[indice].map(normalizar),rows:rows.slice(indice+1).filter(row=>row.some(v=>String(v??"").trim()))};
    }
    throw new Error(`No se encontró una hoja con las columnas: ${requeridos.join(", ")}.`);
}
function indice(headers:string[],nombre:string){const i=headers.indexOf(normalizar(nombre));if(i<0)throw new Error(`Falta la columna ${nombre}.`);return i;}
function numero(v:unknown){if(typeof v==="number"&&Number.isFinite(v))return v;const s=String(v??"").trim().replace(/\s/g,"");if(!s)return 0;const n=Number(s.replace(/\./g,"").replace(",","."));if(!Number.isFinite(n))throw new Error(`Stock inválido: ${String(v)}`);return n;}
export function leerLx03Salud(bytes:ArrayBuffer|Uint8Array):SaludStock[]{
    const {headers:h,rows}=filasExcel(bytes,["Tipo almacén","Ubicación","Tipo de ubicación","Material","Lote","Stock total","Centro"]);
    const c={a:indice(h,"Tipo almacén"),u:indice(h,"Ubicación"),t:indice(h,"Tipo de ubicación"),m:indice(h,"Material"),l:indice(h,"Lote"),q:indice(h,"Stock total"),centro:indice(h,"Centro")};
    const items=rows.filter(r=>texto(r[c.u])).map((r,i)=>({almacen:codigo(r[c.a]),ubicacion:texto(r[c.u]),tipo:texto(r[c.t]),material:texto(r[c.m]),lote:texto(r[c.l]),cantidad:numero(r[c.q]),centro:texto(r[c.centro]),fila:i+2}));
    if(!items.length)throw new Error("La LX03 no contiene ubicaciones.");
    if(items.some(r=>!/^\d+$/.test(r.almacen)))throw new Error("Hay ubicaciones sin tipo de almacén numérico en LX03.");
    return items;
}
export function leerYwmSalud(bytes:ArrayBuffer|Uint8Array):SaludMaterial[]{
    const {headers:h,rows}=filasExcel(bytes,["MAT. CLIENTE","LOTE","DESCRIPCIÓN MATERIAL","CENTRO"]);
    const m=indice(h,"MAT. CLIENTE"),l=indice(h,"LOTE"),d=indice(h,"DESCRIPCIÓN MATERIAL"),c=indice(h,"CENTRO");
    const items=rows.filter(r=>texto(r[m])).map(r=>({material:codigo(r[m]),lote:texto(r[l]),descripcion:String(r[d]??"").trim(),centro:texto(r[c])}));
    if(!items.length)throw new Error("YWM005 no contiene materiales.");return items;
}
