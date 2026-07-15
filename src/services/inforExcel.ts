import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const SHEET_DATA="Data";
const SHEET_DETAIL="Detail";

const STORERKEY="0102003550";

const DATA_START_ROW=3;
const DETAIL_START_ROW=3;

const COL_ORDERKEY=3;
const COL_STORERKEY=4;
const COL_EXTERNORDERKEY=5;
const COL_TYPE=6;
const COL_ENABLEPACKING=7;
const COL_DESTINO=8;

const DETAIL_COL_ORDERKEY=3;
const DETAIL_COL_SKU=4;
const DETAIL_COL_STORERKEY=5;
const DETAIL_COL_EXTERNORDERKEY=6;
const DETAIL_COL_OPENQTY=7;
const DETAIL_COL_DESTINO=8;

export interface SalidaInforRow{
    st:string;
    sku:string;
    bultos:number|string;
    storeName:string;
}

function obtenerSTUnicos(
    data:SalidaInforRow[]
){
    return [
        ...new Set(
            data
                .map(r=>r.st)
                .filter(st=>/^ST\d+$/.test(st))
        )
    ];
}

function escribirHojaData(worksheet: ExcelJS.Worksheet, data: SalidaInforRow[]){
    const stValues=obtenerSTUnicos(data);
    stValues.forEach((st,index)=>{
        const fila=DATA_START_ROW+index;
        const destinosPorST=new Map(
            data.map(r=>[r.st,r.storeName])
);
    const destino=destinosPorST.get(st) ?? "";
        worksheet.getCell(fila,COL_ORDERKEY).value=st;
        worksheet.getCell(fila,COL_STORERKEY).value=STORERKEY;
        worksheet.getCell(fila,COL_EXTERNORDERKEY).value=st;
        worksheet.getCell(fila,COL_TYPE).value="0";
        worksheet.getCell(fila,COL_ENABLEPACKING).value="0";
        worksheet.getCell(fila,COL_DESTINO).value=destino;
    });
}

function escribirHojaDetail(worksheet: ExcelJS.Worksheet, data: SalidaInforRow[]){
    let fila=DETAIL_START_ROW;
    data.forEach(r=>{
        if(
            !r.st ||
            !/^ST\d+$/.test(r.st) ||
            !r.sku
        ){
            return;
        }
        worksheet.getCell(fila,DETAIL_COL_ORDERKEY).value=r.st;
        worksheet.getCell(fila,DETAIL_COL_SKU).value=r.sku;
        worksheet.getCell(fila,DETAIL_COL_STORERKEY).value=STORERKEY;
        worksheet.getCell(fila,DETAIL_COL_EXTERNORDERKEY).value=r.st;
        worksheet.getCell(fila,DETAIL_COL_OPENQTY).value=Number(r.bultos);
        worksheet.getCell(fila,DETAIL_COL_DESTINO).value=r.storeName;
        fila++;
    });
}

export async function generarSalidaInfor(data: SalidaInforRow[]) {
    // Leer la plantilla desde /public
    const response = await fetch("/data/Infor00000.xlsx");
    if (!response.ok) {
        throw new Error("No fue posible cargar la plantilla Infor00000.xlsx");
    }
    const arrayBuffer = await response.arrayBuffer();
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    // Cargar el archivo en memoria
    await workbook.xlsx.load(arrayBuffer);
    // Obtener las hojas
    const wsData = workbook.getWorksheet(SHEET_DATA);
    const wsDetail = workbook.getWorksheet(SHEET_DETAIL);
    if (!wsData) {
        throw new Error(`No existe la hoja "${SHEET_DATA}"`);
    }
    if (!wsDetail) {
        throw new Error(`No existe la hoja "${SHEET_DETAIL}"`);
    }
    escribirHojaData(wsData, data);
    escribirHojaDetail(wsDetail, data);
    const buffer=await workbook.xlsx.writeBuffer();
    saveAs(
        new Blob(
            [buffer],
            {
                type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        ),
        "Infor00000.xlsx"
    );
}
