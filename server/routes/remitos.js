const express=require("express");
const router=express.Router();

const {obtenerRemitos}=require("../services/remitosService");

router.post("/remitos",async(req,res)=>{
    try{
        const {sts,usuario}=req.body;

        if(!Array.isArray(sts)||sts.length===0){
            return res.status(400).json({
                success:false,
                error:"Debe enviar un arreglo de ST."
            });
        }

        const resultado=await obtenerRemitos(sts,usuario);

        return res.json({
            success:true,
            data:resultado
        });
    }catch(err){
        console.error(err);

        return res.status(500).json({
            success:false,
            error:String(err?.message??err)
        });
    }
});

module.exports=router;