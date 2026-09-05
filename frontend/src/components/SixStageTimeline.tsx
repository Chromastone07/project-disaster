import React from 'react';

const stages = [
  "Submitted", "Acknowledged", "Validated", "Assigned", "On Site", "Resolved"
];

interface SixStageTimelineProps {
  currentStage: number; // 0 to 5
  timestamps: (string | null)[]; // 6 strings representing timestamps
}

export default function SixStageTimeline({ currentStage, timestamps }: SixStageTimelineProps) {
  return (
    <div className="flex items-center justify-between w-full py-8 px-4">
      {stages.map((stage, idx) => (
        <div key={stage} className="flex flex-col items-center relative w-1/6">
          {/* Line connecting circles */}
          {idx !== stages.length - 1 && (
            <div className={`absolute left-1/2 top-5 w-full h-1 ${idx < currentStage ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
          {/* Circle */}
          <div className={`w-10 h-10 rounded-full z-10 flex items-center justify-center border-2 
            ${idx < currentStage ? 'bg-green-500 border-green-500 text-white' : 
              idx === currentStage ? 'bg-white border-blue-500 animate-pulse text-blue-500' : 
              'bg-white border-gray-300 text-gray-400'}`}>
            {idx < currentStage ? '✓' : idx + 1}
          </div>
          <span className="text-xs mt-2 font-medium text-center">{stage}</span>
          <span className="text-[10px] text-gray-500 text-center">{timestamps[idx] || 'Pending'}</span>
        </div>
      ))}
    </div>
  );
}
