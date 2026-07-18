const express=require("express");

const router=express.Router();

const {
    obtenerStockPeYa
}=require("../services/stockService");

router.get("/stock",async(req,res)=>{

    try{

        const resultado=await obtenerStockPeYa();

        res.json({
            success:true,
            file:resultado.file,
            stock:resultado.stock
        });

    }catch(err){

        console.error(err);

        res.status(500).json({
            success:false,
            error:String(err?.message??err)
        });

    }

});

module.exports=router;