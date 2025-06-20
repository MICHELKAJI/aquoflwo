import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { WaterLevelData } from '../../types';

interface WaterLevelChartProps {
  data: WaterLevelData[];
  capacity: number;
  height?: number;
}

export default function WaterLevelChart({ data, capacity, height = 300 }: WaterLevelChartProps) {
  const formatData = data.map(item => ({
    ...item,
    timestamp: item.timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    percentage: Math.round((item.level / capacity) * 100),
  }));

  const getColor = (percentage: number) => {
    if (percentage >= 60) return '#10b981'; // green
    if (percentage >= 30) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const currentPercentage = formatData[formatData.length - 1]?.percentage || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Water Level Evolution</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Capacity: {capacity.toLocaleString()} L
          </div>
          <div className={`text-sm font-bold ${
            currentPercentage >= 60 ? 'text-green-600' :
            currentPercentage >= 30 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {currentPercentage}%
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={formatData}>
          <defs>
            <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getColor(currentPercentage)} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={getColor(currentPercentage)} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="timestamp" 
            className="text-xs text-gray-500"
          />
          <YAxis 
            className="text-xs text-gray-500"
            tickFormatter={(value) => `${Math.round((value / capacity) * 100)}%`}
          />
          <Tooltip 
            formatter={(value: number) => [
              `${value.toLocaleString()} L (${Math.round((value / capacity) * 100)}%)`,
              'Level'
            ]}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey="level"
            stroke={getColor(currentPercentage)}
            strokeWidth={2}
            fill="url(#colorLevel)"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Optimal level (60%+)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Moderate level (30-60%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Critical level (&lt;30%)</span>
        </div>
      </div>
    </div>
  );
}