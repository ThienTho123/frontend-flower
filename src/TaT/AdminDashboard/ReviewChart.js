// src/Components/ReviewChart.js
import React from "react";
import { Pie } from "react-chartjs-2";

const ReviewChart = ({ reviewList }) => {
  const getChartData = () => {
    const ratingCounts = [0, 0, 0, 0, 0]; 
    reviewList.forEach((review) => {
      if (review.rating) {
        ratingCounts[review.rating - 1] += 1; 
      }
    });

    return {
      labels: ['1 sao', '2 sao', '3 sao', '4 sao', '5 sao'],
      datasets: [
        {
          data: ratingCounts,
          backgroundColor: ['red', 'orange', 'yellow', 'lightgreen', 'green'],
          hoverBackgroundColor: ['darkred', 'darkorange', 'gold', 'darkgreen', 'darkgreen'],
        },
      ],
    };
  };

  return (
    <div>
      <h3>Thống Kê Đánh Giá</h3>
      <Pie data={getChartData()} />
    </div>
  );
};

export default ReviewChart;
