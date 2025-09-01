import React, { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
  id?: string; // Add unique identifier
}

interface SimpleChartProps {
  data: DataPoint[];
  type: 'bar' | 'line' | 'pie';
  height?: number;
  showValues?: boolean;
  className?: string;
  'aria-label'?: string;
}

// Constants for better maintainability
const CHART_CONSTANTS = {
  BAR_PADDING: 30,
  MIN_BAR_HEIGHT_FOR_TEXT: 20,
  LINE_POINT_RADIUS: 2,
  PIE_STROKE_WIDTH: 8,
  PIE_RADIUS: 16,
  DEFAULT_COLORS: [
    'stroke-blue-500',
    'stroke-green-500', 
    'stroke-purple-500',
    'stroke-orange-500',
    'stroke-red-500'
  ],
  DEFAULT_BG_COLORS: [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500', 
    'bg-orange-500',
    'bg-red-500'
  ]
} as const;

// Separate chart components for better maintainability
const BarChart: React.FC<{
  data: DataPoint[];
  height: number;
  showValues: boolean;
}> = ({ data, height, showValues }) => {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const availableHeight = height - CHART_CONSTANTS.BAR_PADDING;

  return (
    <div className="flex items-end justify-between h-full space-x-1">
      {data.map((item) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * availableHeight : 0;
        const itemId = item.id || `bar-${item.label}-${item.value}`;
        
        return (
          <div key={itemId} className="flex flex-col items-center flex-1">
            <div
              className={`w-full rounded-t-md transition-all duration-500 ${
                item.color || 'bg-indigo-500'
              }`}
              style={{ height: `${barHeight}px` }}
              role="img"
              aria-label={`Bar for ${item.label}: ${item.value}`}
            >
              {showValues && barHeight > CHART_CONSTANTS.MIN_BAR_HEIGHT_FOR_TEXT && (
                <div className="text-white text-xs font-medium pt-1 text-center">
                  {item.value}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-1 text-center truncate w-full">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LineChart: React.FC<{
  data: DataPoint[];
  height: number;
}> = ({ data, height }) => {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  
  if (data.length === 1) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={`Line chart showing ${data[0].label}: ${data[0].value}`}>
        <line
          x1="20"
          y1="50"
          x2="80"
          y2="50"
          stroke="#6366F1"
          strokeWidth="3"
          className="drop-shadow-sm"
        />
        <circle
          cx="50"
          cy="50"
          r="4"
          fill="#6366F1"
          className="drop-shadow-sm"
        />
        <text
          x="50"
          y="30"
          textAnchor="middle"
          className="text-xs font-medium fill-gray-700"
        >
          {data[0].value}
        </text>
      </svg>
    );
  }

  const points = useMemo(() => {
    const width = 100;
    return data.map((item, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = maxValue > 0 ? ((maxValue - item.value) / maxValue) * 80 + 10 : 50;
      return `${x},${y}`;
    }).join(' ');
  }, [data, maxValue]);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label="Line chart">
      <polyline
        fill="none"
        stroke="#6366F1"
        strokeWidth="2"
        points={points}
        className="drop-shadow-sm"
      />
      {data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = maxValue > 0 ? ((maxValue - item.value) / maxValue) * 80 + 10 : 50;
        const itemId = item.id || `line-${item.label}-${item.value}`;
        
        return (
          <circle
            key={itemId}
            cx={x}
            cy={y}
            r={CHART_CONSTANTS.LINE_POINT_RADIUS}
            fill="#6366F1"
            className="drop-shadow-sm"
          />
        );
      })}
    </svg>
  );
};

const PieChart: React.FC<{
  data: DataPoint[];
  height: number;
}> = ({ data, height }) => {
  const { total, segments } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    const segments = data.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const strokeDasharray = `${percentage} 100`;
      const strokeDashoffset = -currentAngle;
      currentAngle += percentage;
      
      return {
        ...item,
        percentage,
        strokeDasharray,
        strokeDashoffset,
        color: item.color || CHART_CONSTANTS.DEFAULT_COLORS[index % CHART_CONSTANTS.DEFAULT_COLORS.length],
        bgColor: CHART_CONSTANTS.DEFAULT_BG_COLORS[index % CHART_CONSTANTS.DEFAULT_BG_COLORS.length]
      };
    });
    
    return { total, segments };
  }, [data]);

  return (
    <div className="flex items-center space-x-4">
      <div className="relative" style={{ width: `${height}px`, height: `${height}px` }}>
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90" role="img" aria-label="Pie chart">
          {segments.map((segment, index) => {
            const itemId = segment.id || `pie-${segment.label}-${segment.value}`;
            
            return (
              <circle
                key={itemId}
                cx="50"
                cy="50"
                r={CHART_CONSTANTS.PIE_RADIUS}
                fill="transparent"
                strokeWidth={CHART_CONSTANTS.PIE_STROKE_WIDTH}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                className={segment.color}
              />
            );
          })}
        </svg>
      </div>
      <div className="flex-1 space-y-2">
        {segments.map((segment, index) => {
          const itemId = segment.id || `legend-${segment.label}-${segment.value}`;
          
          return (
            <div key={itemId} className="flex items-center text-xs">
              <div className={`w-3 h-3 rounded-full mr-2 ${segment.bgColor}`} />
              <span className="text-gray-700 flex-1 truncate">{segment.label}</span>
              <span className="font-medium text-gray-900 ml-2">{segment.percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function SimpleChart({ 
  data, 
  type, 
  height = 120, 
  showValues = true, 
  className = '',
  'aria-label': ariaLabel 
}: SimpleChartProps) {
  // Validate data with better error handling
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div 
        className={`w-full ${className}`} 
        style={{ height: `${height}px` }}
        role="img"
        aria-label="Chart with no data available"
      >
        <div className="flex items-center justify-center h-full text-gray-500">
          <span className="text-sm">No data available</span>
        </div>
      </div>
    );
  }

  // Validate data structure
  const isValidData = data.every(item => 
    typeof item === 'object' && 
    item !== null && 
    typeof item.label === 'string' && 
    typeof item.value === 'number' && 
    item.value >= 0
  );

  if (!isValidData) {
    return (
      <div 
        className={`w-full ${className}`} 
        style={{ height: `${height}px` }}
        role="img"
        aria-label="Chart with invalid data"
      >
        <div className="flex items-center justify-center h-full text-red-500">
          <span className="text-sm">Invalid data format</span>
        </div>
      </div>
    );
  }

  const chartAriaLabel = ariaLabel || `${type} chart showing ${data.length} data points`;

  return (
    <div 
      className={`w-full ${className}`} 
      style={{ height: `${height}px` }}
      role="img"
      aria-label={chartAriaLabel}
    >
      {type === 'bar' && (
        <BarChart data={data} height={height} showValues={showValues} />
      )}
      
      {type === 'line' && (
        <>
          <LineChart data={data} height={height} />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            {data.map((item) => {
              const itemId = item.id || `label-${item.label}-${item.value}`;
              return (
                <span key={itemId} className="truncate">
                  {item.label}
                </span>
              );
            })}
          </div>
        </>
      )}
      
      {type === 'pie' && (
        <PieChart data={data} height={height} />
      )}
    </div>
  );
}