// src/Components/BillGrowthChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';

const BillGrowthChart = ({ chartData }) => {
  return (
    <div>
      <h3>Thống Kê Doanh Thu Hằng Ngày</h3>
      <Line
        data={{
          labels: chartData.labels,
          datasets: [
            {
              label: 'Số hóa đơn',
              data: chartData.data,
              fill: false,
              backgroundColor: 'rgba(75,192,192,0.4)',
              borderColor: 'rgba(75,192,192,1)',
            },
          ],
        }}
        options={{
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default BillGrowthChart;
