const { obtenerArchivoDrive } = require("./driveService");
const { parseStockWorkbook } = require("../utils/stockParser");

async function obtenerStockPeYa(){
    const {file,buffer}=await obtenerArchivoDrive("StockPeYa");
    const stock=parseStockWorkbook(buffer);
    return{
        file,
        stock
    };

}

module.exports={
    obtenerStockPeYa
};