import styles from './GuiaYwm005.module.css';
import { useState } from 'react';
import Volver from '../Volver/Volver';
import paso1 from '../../Assets/Ywm005_step1.png';
import paso2 from '../../Assets/Ywm005_step2.png';
import paso3 from '../../Assets/Ywm005_step3.png';
import paso4 from '../../Assets/Ywm005_step4.png'; 
import paso5 from '../../Assets/Ywm005_step5.png'; 

const GuiaYwm005 = () => {
 interface Transaction {
    id: number;
    imagen: string;
    explicacion: string;
    extraImg?: string;  // Imagen adicional que quieras mostrar en el texto
  }

      const [ywm005] = useState<Transaction[]>([
        { id: 1, imagen:paso1, explicacion: 'En la pantalla principal ingresaremos la jerarquia del cliente.\nEl centro\nEl numero de Almacen\nTildamos "Con Stock"\nY ejecutamos'},
        { id: 2, imagen:paso2, explicacion: 'Una vez que el sistema nos arroje el reporte, realizamos click sobre el icono de "Seleccionat Layout..."\nDeslizamos hasta abajo y seleccionamos la disposicion "/Z-TOSO-Z"' },
        { id: 3, imagen:paso3, explicacion: 'Luego realizamos click derecho sobre la grilla y seleccionamos "Hoja de cálculo..."\nSeleccionamos "EXCEL(en formato MHTML)\nY damos aceptar"' },
        { id: 4, imagen:paso4, explicacion: 'Guardamos el archivo en el disco'  },
        { id: 5, imagen:paso5, explicacion: 'El Excel se abrira automaticamente\nEn esa instancia, procedemos a "Guardar como" y es importante que seleccionemos el tipo de archivo "Libro de Excel"\nGuardamos y ya tenemos nuestro archivo listo'  },
      ]);
    
      const [currentStep, setCurrentStep] = useState<number>(1);
    
      const handleNext = () => {
        if (currentStep < ywm005.length) {
          setCurrentStep(currentStep + 1);
        }
      };
    
      const handlePrevious = () => {
        if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
        }
      };

    
    return(
        <div>
        <img src={ywm005[currentStep - 1].imagen} className={styles.trxImage} alt="imagen de la transacción" />
        <fieldset className={styles.StepContainer}>
            <legend>Paso {currentStep}</legend>
            <p dangerouslySetInnerHTML={{ __html: ywm005[currentStep - 1]?.explicacion.replace(/\n/g, '<br />') }} />

            {ywm005[currentStep - 1].extraImg && (
            <img src={ywm005[currentStep - 1].extraImg} className={styles.inlineImage} alt="Imagen adicional" />
            )}
        </fieldset>

        <div className={styles.buttonsContainer}>
          <button 
            className={`${styles.leftArrow} ${currentStep === 1 ? styles.disabledButton : ''}`}
            onClick={handlePrevious}
            disabled={currentStep === 1} // Deshabilita si estamos en el primer paso
            >&#10148;
          </button>
          <span className={styles.stepNumber}>PASO {currentStep}</span>
          <button 
            className={`${styles.rightArrow} ${currentStep === ywm005.length ? styles.disabledButton : ''}`}
            onClick={handleNext}
            disabled={currentStep === ywm005.length} // Deshabilita si estamos en el último paso
            >&#10148;
          </button>
          <div className={styles.volverContainer}>
            <Volver />
          </div>
        </div>

      </div>
    )
}

export default GuiaYwm005;