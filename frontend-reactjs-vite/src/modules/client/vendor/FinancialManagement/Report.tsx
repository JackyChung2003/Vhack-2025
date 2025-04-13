import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Report: React.FC = () => {
  const profit = 12000;
  const loss = 3000;
  const net = profit - loss;

  // Data for the bar chart
  const data = {
    labels: ["Profit", "Loss", "Net"],
    datasets: [
      {
        label: "Amount (RM)",
        data: [profit, loss, net],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)", // Profit (Green)
          "rgba(255, 99, 132, 0.6)", // Loss (Red)
          net >= 0 ? "rgba(54, 162, 235, 0.6)" : "rgba(255, 99, 132, 0.6)", // Net (Blue or Red)
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)", // Profit (Green)
          "rgba(255, 99, 132, 1)", // Loss (Red)
          net >= 0 ? "rgba(54, 162, 235, 1)" : "rgba(255, 99, 132, 1)", // Net (Blue or Red)
        ],
        borderWidth: 1,
      },
    ],
  };

  // Options for the bar chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `RM${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: string | number) {
            if (typeof tickValue === "number") {
              return `RM${tickValue.toLocaleString()}`;
            }
            return tickValue;
          },
        },
      },
    },
  };

  return (
    <div className="p-6 rounded-lg shadow-xl border border-[var(--stroke)]">
      <h2 className="text-2xl font-bold text-[var(--headline)] mb-6">Profit and Loss Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-lg shadow-md border border-[var(--card-border)] hover:bg-[var(--background)] transition-all">
          <h3 className="text-lg font-semibold text-[var(--headline)]">Total Profit</h3>
          <p className="text-2xl font-bold text-green-600">RM{profit.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg shadow-md border border-[var(--card-border)] hover:bg-[var(--background)] transition-all">
          <h3 className="text-lg font-semibold text-[var(--headline)]">Total Loss</h3>
          <p className="text-2xl font-bold text-red-600">RM{loss.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg shadow-md border border-[var(--card-border)] hover:bg-[var(--background)] transition-all">
          <h3 className="text-lg font-semibold text-[var(--headline)]">Net</h3>
          <p
            className={`text-2xl font-bold ${
              net >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            RM{net.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-[var(--headline)] mb-4">Visual Insights</h3>
        <div className="bg-[var(--background)] p-4 rounded-lg shadow-md">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Report;