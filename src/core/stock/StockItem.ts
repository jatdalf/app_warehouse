export interface StockItem{
    articulo:string;
    ubicacion:string;
    stock:number;
    fechaVencimiento: Date | null;
}