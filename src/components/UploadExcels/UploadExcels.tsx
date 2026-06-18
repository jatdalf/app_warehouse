import ExcelDropZone from "../ExcelDropZone/ExcelDropZone";
import type { ExcelState } from "../ExcelDropZone/ExcelDropZone";


import styles from "./UploadExcels.module.css";

export type ExcelSection = "MM" | "LX03" | "YWM005";

interface Props {
  mm: ExcelState;
  lx03: ExcelState;
  ywm005: ExcelState;
  onChange: (section: ExcelSection, state: ExcelState) => void;
}

const UploadExcels: React.FC<Props> = ({
  mm,
  lx03,
  ywm005,
  onChange,
}) => {
  return (
    <div className={styles.container}>
      <ExcelDropZone
        title="Excel MM"
        expectedColumns={4}
        baseFile="/data/MM.xlsx"
        value={mm}
        onChange={(state) => onChange("MM", state)}
      />

      <ExcelDropZone
        title="Excel LX03"
        expectedColumns={16}
        baseFile="/data/lx03.xlsx"
        value={lx03}
        onChange={(state) => onChange("LX03", state)}
      />

      <ExcelDropZone
        title="Excel YWM005"
        expectedColumns={14}
        baseFile="/data/ywm005.xlsx"
        value={ywm005}
        onChange={(state) => onChange("YWM005", state)}
      />
    </div>
  );
};

export default UploadExcels;
