const XLSX=require("xlsx");

function analyzeBuffer(buffer){
    const wb=XLSX.read(buffer,{type:"buffer"});
    const sheetName=wb.SheetNames[0];
    const sheet=wb.Sheets[sheetName];
    const rows=XLSX.utils.sheet_to_json(sheet,{
        header:1,
        defval:""
    });

    const results=[];

    for(let i=1;i<rows.length;i++){
        const row=rows[i];

        const matCliente=row[0];
        const descripcion=row[2];
        const stockCell=row[5];
        const uomCell=row[13];

        const parseNumber=(val)=>{
            if(val===null||val===undefined||val==="") return null;
            if(typeof val==="number") return val;

            let s=String(val).trim();

            if(s.endsWith(".000")){
                s=s.slice(0,-4);
            }

            s=s.replace(/[,]/g,"");

            const n=Number(s);

            return Number.isFinite(n)?n:null;
        };

        const stockParsed=parseNumber(stockCell);
        const uom=parseNumber(uomCell);

        if(stockParsed===null||uom===null||uom===0){
            continue;
        }

        const division=stockParsed/uom;

        const isInteger=
            Math.abs(division-Math.round(division))<1e-9;

        if(!isInteger){
            results.push({
                row:i+1,
                matCliente,
                descripcion,
                stockOriginal:stockCell,
                stockParsed,
                uom,
                division
            });
        }
    }

    return results;
}

module.exports={
    analyzeBuffer
};