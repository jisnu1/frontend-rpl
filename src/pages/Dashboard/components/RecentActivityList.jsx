import React from 'react';
import { Link } from 'react-router-dom';

export default function RecentActivityList({ activities = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-level-1 border border-slate-100 overflow-hidden">
      {/* List Header Section */}
      <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900">Recent Alerts &amp; Activity</h2>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
          {activities.length} Tasks Auto-Monitored
        </span>
      </div>

      {/* Responsive Table Grid */}
      <div className="flex flex-col w-full overflow-x-auto">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-150 bg-slate-50/30 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[700px]">
          <div className="col-span-5">Event</div>
          <div className="col-span-3">User/System</div>
          <div className="col-span-2">Time</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Table Body / Row Items */}
        <div className="min-w-[700px] divide-y divide-slate-100">
          {activities.map((activity) => {
            const isLink = !!activity.link;

            const rowContent = (
              <>
                {/* Event Title and Icon */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`p-2.5 rounded-full ${activity.iconClass} flex items-center justify-center shrink-0 ${isLink ? 'group-hover:scale-110 transition-transform' : ''}`}>
                    <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
                  </div>
                  {isLink ? (
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-bold text-primary group-hover:underline truncate flex items-center gap-1.5">
                        {activity.title}
                        <span className="material-symbols-outlined text-[16px] text-primary/50 group-hover:text-primary transition-colors">
                          open_in_new
                        </span>
                      </span>
                      {activity.subtitle && (
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          {activity.subtitle}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {activity.title}
                    </span>
                  )}
                </div>

                {/* User/System Column */}
                <div className="col-span-3 text-sm text-slate-500">{activity.user}</div>

                {/* Time Column */}
                <div className="col-span-2 text-sm text-slate-400">{activity.time}</div>

                {/* Status Column */}
                <div className="col-span-2 text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${activity.statusClass}`}>
                    {activity.status}
                  </span>
                </div>
              </>
            );

            if (isLink) {
              return (
                <Link
                  key={activity.id}
                  to={activity.link}
                  className="grid grid-cols-12 gap-4 px-6 py-4.5 ghost-row items-center border-l-4 border-primary hover:bg-blue-50/30 group cursor-pointer"
                >
                  {rowContent}
                </Link>
              );
            }

            return (
              <div
                key={activity.id}
                className="grid grid-cols-12 gap-4 px-6 py-4.5 ghost-row items-center"
              >
                {rowContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
