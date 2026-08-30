import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, ScatterChart as ScatterIcon, Layers } from 'lucide-react';
import { CandidateLocation } from '../types.js';

interface ChartsSectionProps {
  candidates: CandidateLocation[];
  selectedCandidate: CandidateLocation | null;
  onSelectCandidate: (candidate: CandidateLocation) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'quadrant'>('comparison');

  if (!candidates.length) return null;

  // Prepare Bar Chart Data
  const barData = candidates.map(c => ({
    name: c.name.length > 20 ? `${c.name.substring(0, 18)}...` : c.name,
    fullName: c.name,
    area: c.area,
    'Overall Score': c.overallScore,
    'Cycling Access': c.cyclingScore,
    'Foot Traffic': c.demandScore,
    'Store Buffer': c.saturationScore,
    id: c.id
  }));

  // Prepare Scatter / Quadrant Data
  const scatterData = candidates.map(c => ({
    x: c.cyclingScore,
    y: Math.round(c.estimatedMonthlyRevenue / 1000), // £k
    z: c.overallScore,
    name: c.name,
    area: c.area,
    id: c.id,
    status: c.status
  }));

  return (
    <div className="bg-white border border-[#DADCE0] rounded-lg p-4 shadow-xs my-4">
      
      {/* Chart Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DADCE0]">
        <div>
          <div className="flex items-center space-x-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-[#4285F4]" />
            <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
              Empirical Location Analytics & Visual Benchmarks
            </h3>
          </div>
          <p className="text-[11px] text-[#70757A] mt-0.5">
            Real data correlations extracted from BigQuery spatial metrics
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-[#F1F3F4] p-0.5 rounded-md border border-[#DADCE0]">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-white text-[#1967D2] font-bold shadow-xs'
                : 'text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Multi-Score Comparison
          </button>
          <button
            onClick={() => setActiveTab('quadrant')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'quadrant'
                ? 'bg-white text-[#1967D2] font-bold shadow-xs'
                : 'text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Cycling vs Revenue Matrix
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full h-80 sm:h-96 pt-3">
        {activeTab === 'comparison' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 15, right: 20, left: -10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis 
                dataKey="name" 
                stroke="#70757A" 
                fontSize={10}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis stroke="#70757A" fontSize={10} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#DADCE0', 
                  borderRadius: '6px',
                  color: '#202124',
                  fontSize: '11px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
              />
              <Bar dataKey="Overall Score" fill="#4285F4" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Cycling Access" fill="#34A853" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Foot Traffic" fill="#1A73E8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Store Buffer" fill="#129EAF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 15, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Cycling Score" 
                unit=" pts" 
                stroke="#70757A" 
                fontSize={10}
                domain={[40, 100]}
                label={{ value: 'Cycling Accessibility Index (0 - 100)', position: 'insideBottom', offset: -10, fill: '#70757A', fontSize: 10 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Est. Monthly Revenue" 
                unit=" £k" 
                stroke="#70757A" 
                fontSize={10}
                domain={[60, 110]}
                label={{ value: 'Projected Monthly Sales (£k)', angle: -90, position: 'insideLeft', fill: '#70757A', fontSize: 10 }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 200]} name="Overall Score" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#DADCE0', 
                  borderRadius: '6px',
                  color: '#202124',
                  fontSize: '11px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                }}
              />
              <Scatter name="Candidate Locations" data={scatterData}>
                {scatterData.map((entry, index) => {
                  let fill = '#5F6368';
                  if (entry.status === 'Recommended') fill = '#F9AB00';
                  else if (entry.status === 'Strong Candidate') fill = '#4285F4';
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};
