const express=require("express");
const router=express.Router();

const {obtenerUltimoYWM005}=require("../services/driveService");
const {analyzeBuffer}=require("../utils/xlsxAnalyzer");

router.get("/process-drive-ywm005",async(req,res)=>{
    try{
        const {file,buffer}=await obtenerUltimoYWM005();

        const results=analyzeBuffer(buffer);

        return res.json({
            file,
            results
        });
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            error:String(err?.message??err)
        });
    }
});

module.exports=router;