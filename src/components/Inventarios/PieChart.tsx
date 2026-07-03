// src/components/Inventarios/PieChart.tsx
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// ✅ Registrar los elementos necesarios para PieChart
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  labels: string[];
  data: number[];
  colors: string[];
  size?: number; // opcional, default 250px
}

const PieChart: React.FC<PieChartProps> = ({ labels, data, colors, size = 250 }) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: ["#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div style={{ width: `${size}px`, height: `${size}px` }}>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;

