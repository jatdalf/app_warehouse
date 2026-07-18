export interface StockPosition{
    ubicacion:string;
    stock:number;
}

export interface StockRegistro{
    articulo:string;
    ubicacion:string;
    stock:number;
}

export interface PickingLinea{
    ubicacion:string;
    retirar:number;
}

export interface PickingResultado{
    solicitado:number;
    entregado:number;
    faltante:number;
    stockSuficiente:boolean;
    lineas:PickingLinea[];
}

function compararUbicaciones(a:string,b:string){
    const pa=a.split(".");
    const pb=b.split(".");
    if(pa[0]!==pb[0]){
        return pa[0].localeCompare(pb[0]);
    }
    const calleA=Number(pa[1]??0);
    const calleB=Number(pb[1]??0);
    if(calleA!==calleB){
        return calleA-calleB;
    }
    const nivelA=Number(pa[2]??0);
    const nivelB=Number(pb[2]??0);
    return nivelA-nivelB;
}

class StockService{
    private stock=new Map<
        string,
        StockPosition[]
    >();
    reset(){
        this.stock.clear();
    }
setStock(registros:StockRegistro[]){
    this.reset();
    registros.forEach(registro=>{
        if(!this.stock.has(registro.articulo)){
            this.stock.set(
                registro.articulo,
                []
            );
        }
        this.stock.get(registro.articulo)!.push({
            ubicacion:registro.ubicacion,
            stock:registro.stock
        });
    });
    this.stock.forEach(posiciones=>{
        posiciones.sort(
            (a,b)=>
                compararUbicaciones(
                    a.ubicacion,
                    b.ubicacion
                )
        );
    });
}

    getStock(articulo:string){
        return this.stock.get(articulo)??[];
    }

consumir(articulo:string,cantidad:number):PickingResultado{
    const posiciones=this.stock.get(articulo);
    if(!posiciones){
        return{
            solicitado:cantidad,
            entregado:0,
            faltante:cantidad,
            stockSuficiente:false,
            lineas:[]
        };
    }
    const lineas:PickingLinea[]=[];
    let restante=cantidad;
    for(const posicion of posiciones){
        if(restante<=0){
            break;
        }
        if(posicion.stock<=0){
            continue;
        }
        const retirar=Math.min(
            posicion.stock,
            restante
        );
        lineas.push({
            ubicacion:posicion.ubicacion,
            retirar
        });
        posicion.stock-=retirar;
        restante-=retirar;
    }
    const entregado=cantidad-restante;
    return{
        solicitado:cantidad,
        entregado,
        faltante:restante,
        stockSuficiente:restante===0,
        lineas
    };
}

    getDisponible(articulo:string){
        return (
            this.stock.get(articulo)??[]
        ).reduce(
            (total,p)=>total+p.stock,
            0
        );
    }
}

export default new StockService();