const {google}=require("googleapis");

const DRIVE_FOLDER_ID=process.env.DRIVE_FOLDER_ID;

async function downloadFileBuffer(drive,fileId){
    const res=await drive.files.get(
        {
            fileId,
            alt:"media"
        },
        {
            responseType:"stream"
        }
    );

    const chunks=[];

    return new Promise((resolve,reject)=>{
        res.data.on("data",chunk=>chunks.push(chunk));
        res.data.on("end",()=>resolve(Buffer.concat(chunks)));
        res.data.on("error",reject);
    });
}

async function obtenerUltimoYWM005(){

    const auth=new google.auth.GoogleAuth({
        scopes:[
            "https://www.googleapis.com/auth/drive.readonly"
        ]
    });

    const authClient=await auth.getClient();

    const drive=google.drive({
        version:"v3",
        auth:authClient
    });

    const q=DRIVE_FOLDER_ID
        ? `'${DRIVE_FOLDER_ID}' in parents and trashed=false`
        : "trashed=false";

    const listRes=await drive.files.list({
        q,
        fields:"files(id,name,modifiedTime)",
        orderBy:"modifiedTime desc",
        pageSize:50
    });

    const files=listRes.data.files||[];

    if(files.length===0){
        throw new Error("No files found in Drive folder.");
    }

    let target=files.find(f=>/ywm005/i.test(f.name));

    if(!target){
        target=files[0];
    }

    const buffer=await downloadFileBuffer(
        drive,
        target.id
    );

    return{
        file:target.name,
        buffer
    };
}

module.exports={
    obtenerUltimoYWM005
};