import React from 'react';
import { Bar } from 'react-chartjs-2';
import { SerializedMission } from '../types.ts';

interface MissionChartProps {
  missions: SerializedMission[];
  missionCounts: number[];
}

const MissionChart: React.FC<MissionChartProps> = ({ missions, missionCounts }) => {
  return (
    <div className="chart-container">
      <Bar
        data={{
          labels: missions.map(mission => mission.id.toString()),
          datasets: [{
            label: 'Number of Times Mission Completed',
            data: missionCounts,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  );
};

export default MissionChart;
