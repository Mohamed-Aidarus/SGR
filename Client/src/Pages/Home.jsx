import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { useGetChartDataQuery, useGetSummaryChartDataQuery } from '../store/api/fileApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
  const { data: chartData, error: chartDataError, isLoading: isChartDataLoading } = useGetChartDataQuery();
  const { data: summaryData, error: summaryDataError, isLoading: isSummaryDataLoading } = useGetSummaryChartDataQuery();

  if (isChartDataLoading || isSummaryDataLoading) return <div>Loading...</div>;
  if (chartDataError || summaryDataError) return <div>Error: {chartDataError?.message || summaryDataError?.message}</div>;

  console.log('chartData:', chartData);
  console.log('summaryData:', summaryData);

  if (!Array.isArray(chartData?.chart_data) || !Array.isArray(summaryData?.summary_data)) {
    return <div>Error: Chart data is not in the expected format.</div>;
  }

  const processBarChartData = (predictionType, groupBy) => {
    const groups = {};

    chartData.chart_data.forEach(department => {
      department.predictions.forEach(prediction => {
        if (prediction.Prediction === predictionType) {
          const key = prediction[groupBy];
          if (!groups[key]) {
            groups[key] = { Male: 0, Female: 0 };
          }
          groups[key][prediction.Gender]++;
        }
      });
    });

    const labels = Object.keys(groups);
    const maleData = labels.map(label => groups[label].Male);
    const femaleData = labels.map(label => groups[label].Female);

    return {
      labels,
      datasets: [
        {
          label: 'Male',
          data: maleData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Female',
          data: femaleData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const processPieChartData = (predictionType) => {
    const groups = { Male: 0, Female: 0 };

    summaryData.summary_data.forEach(item => {
      if (item._id === predictionType) {
        item.genders.forEach(gender => {
          groups[gender.Gender] += gender.count;
        });
      }
    });

    return {
      labels: ['Male', 'Female'],
      datasets: [
        {
          data: [groups.Male, groups.Female],
          backgroundColor: ['#36A2EB', '#FF6384'],
          hoverBackgroundColor: ['#36A2EB', '#FF6384'],
        },
      ],
    };
  };

  const graduatedByDepartmentData = processBarChartData('Will Graduate', 'Department');
  const dropoutByDepartmentData = processBarChartData('Dropout', 'Department');
  const graduatedByModeData = processBarChartData('Will Graduate', 'Mode');
  const dropoutByModeData = processBarChartData('Dropout', 'Mode');
  const overallGraduatedData = processPieChartData('Will Graduate');
  const overallDropoutData = processPieChartData('Dropout');

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Chart',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="p-4 bg-[#ede0d4]">
      <h2 className="text-2xl font-bold mb-4">Previous Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-xl font-semibold mb-2">Graduated by Department</h3>
          <Bar data={graduatedByDepartmentData} options={options} />
        </div>
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-xl font-semibold mb-2">Dropout by Department</h3>
          <Bar data={dropoutByDepartmentData} options={options} />
        </div>
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-xl font-semibold mb-2">Graduated by Mode</h3>
          <Bar data={graduatedByModeData} options={options} />
        </div>
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-xl font-semibold mb-2">Dropout by Mode</h3>
          <Bar data={dropoutByModeData} options={options} />
        </div>
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-xl font-semibold mb-2">Overall Graduated</h3>
          <Pie data={overallGraduatedData} options={options} />
        </div>
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-xl font-semibold mb-2">Overall Dropout</h3>
          <Pie data={overallDropoutData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Home;
