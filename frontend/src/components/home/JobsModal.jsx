import React from 'react';
import { X, Briefcase, MapPin, DollarSign } from 'lucide-react';

export default function JobsModal({ brand, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-12 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{brand.name}</h2>
              <p className="text-sm text-slate-600">{brand.jobCount} Open Positions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition p-1 hover:bg-slate-200/50 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Jobs List */}
        <div className="p-6 space-y-4">
          {brand.jobs && brand.jobs.length > 0 ? (
            brand.jobs.map((job, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-slate-900">{job.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {job.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> {job.salary}
                    </span>
                  )}
                  {job.level && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {job.level}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">No open positions available at this moment.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:shadow-lg">
            View All Positions
          </button>
        </div>
      </div>
    </div>
  );
}
