import React from 'react';

export default function SharedBento({ onOpenFile, onViewReport }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ── Large Featured Card ───────────────────────────────────────────── */}
      <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-white shadow-level-1 h-64 border border-outline-variant/10 transition-all duration-300 hover:shadow-level-2">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

        {/* Background image */}
        <img
          className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          alt="Complex software code with vibrant syntax highlighting"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXv4B3c6lTo0h08DuxCx5AqtTo-U1Iqxm17EeiEBXTVYbpS7K6hW0Y60Ag1Dqx0rT7Igq6OEBtoCimb-OMLoyLOVuU8xx6Z87vkzSt878-C-2B2LHgcwAFogtyVqsRxP2CbEB7LNnFCEJVYpoWSKU9LWvjinKIYY1Fbfags8ko2FqVdhbqvyLsyRNybhVLgUo0JZ31r5bqW8U0dt24B1fec0EBtWo1mwC37EXzOvdCcFbQwuUKyiOGo2vf0j4TbnwnaMIQJyH9Af0"
        />

        {/* Content */}
        <div className="relative h-full p-8 flex flex-col justify-between z-10">
          <div>
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
              <span className="material-symbols-outlined text-sm" style={{ fontSize: '14px' }}>stars</span>
              Recently Edited
            </span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Q4 Product Roadmap.fig</h3>
            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Updated 2 hours ago by David Miller. Collaborative strategy for the upcoming quarter.
            </p>
          </div>

          {/* Footer: Avatars + CTA */}
          <div className="flex items-center gap-4">
            {/* Stacked Avatars */}
            <div className="flex -space-x-3">
              <img
                alt="David Miller"
                className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-outline-variant/20 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyJ2JTwPXVahGRkinwr7Tw_RtgrouSYzN2nNq3siacm83-0UVZmJr6IrDdNHjBeteELksqSzYBsGtQHS-5j45aw8jJeR5XoWWhPWOAhZqwhwHoban9Umgfbn1v1hcgQqHQpEYn13sX2DtJBVzM7C-kn6GyOUFWxQ-cKXFXgr3yze5H2B2vfmE0VH2WfC2YiNDS5uugjS3KUpb4br1plWl-OFJHzbDsqOEQNFcFeJU5_Nij03B9Wm7Evzz-PAKxc_OGS4lWZpN546A"
              />
              <img
                alt="Sarah Chen"
                className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-outline-variant/20 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIp8sCabZZAFhgtNV1-bPgxKWD-u-rpz4uLnE0Wiql2KtVFRxfx3j4AVZPy-nhZrtppxRKSjsv21vXHT0QgxeV4aj20-ZSE6EXcKfAsLv5d82LU6upr8WojDZLgSzh57p3fFAaQ9q-P-0A8Byk35_tHKs3HSifIOqBr-0gXGAOjJOCmSPIuFC93oAphiQURUPZMViaYDh4wc-OZYF2-G3DwhmOHk9Tjtz2fOdCK8X6WQCJjGfSyyEuqt5Y8npnayUCm-g5m3atUMg"
              />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container text-xs flex items-center justify-center font-bold text-outline">
                +3
              </div>
            </div>

            {/* Open File Button */}
            <button
              onClick={() => onOpenFile('Q4 Product Roadmap.fig')}
              className="px-5 py-2 bg-primary hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Open File
            </button>
          </div>
        </div>
      </div>

      {/* ── Small Stats Card ──────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white shadow-level-1 p-8 border border-outline-variant/10 flex flex-col justify-between transition-all duration-300 hover:shadow-level-2">
        <div>
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-[28px]">folder_shared</span>
          </div>
          <h4 className="text-xl font-bold text-on-surface mb-1">Shared Growth</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Your shared assets increased by 12% this week.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="pt-6 border-t border-outline-variant/10">
          <button
            onClick={onViewReport}
            className="w-full flex items-center justify-between text-sm font-bold text-primary cursor-pointer group hover:text-blue-700 transition-colors"
          >
            <span>View Report</span>
            <span
              className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform"
              style={{ fontSize: '18px' }}
            >
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
