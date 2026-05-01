/**
 * StatCard.jsx
 * Simple metric card used on the dashboard.
 */

import React from 'react';

export default function StatCard({ label, value, icon: Icon, accent = 'indigo', sub }) {
  const accentMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10',
    green:  'text-green-400 bg-green-500/10',
    blue:   'text-blue-400 bg-blue-500/10',
    red:    'text-red-400 bg-red-500/10',
    amber:  'text-amber-400 bg-amber-500/10',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
