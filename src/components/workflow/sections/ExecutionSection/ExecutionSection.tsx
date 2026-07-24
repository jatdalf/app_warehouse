import { useState } from "react";
import styles from "./ExecutionSection.module.css"

interface Props{
    enabled:boolean;
    onExecute:()=>Promise<void>;
}

const ExecutionSection: React.FC<Props> = ({enabled, onExecute}) => {
    const [running,setRunning]=useState(false);
    const execute=async()=>{
        console.log("CLICK");
        setRunning(true);
        try{
            await onExecute();
        }finally{
            setRunning(false);
        }
    };
        console.log({
        enabled,
        running
    });
    return(
        <fieldset className={styles.section}>
        <legend>3. Procesar</legend>
        <button
            disabled={!enabled || running}
            onClick={execute}
        >
            {
                running
                    ? "Procesando..."
                    : "Ejecutar proceso"
            }
        </button>
    </fieldset>
    )
} 

export default ExecutionSection;