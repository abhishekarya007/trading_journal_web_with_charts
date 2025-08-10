import React from "react";

const base = {
  className: "w-4 h-4",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconCandle = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M12 2v4"/>
    <rect x="9" y="6" width="6" height="8" rx="2"/>
    <path d="M12 14v8"/>
  </svg>
);

export const IconDownload = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M12 3v12"/>
    <path d="M7 10l5 5 5-5"/>
    <path d="M5 21h14"/>
  </svg>
);

export const IconReset = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M3 12a9 9 0 1 0 9-9"/>
    <path d="M3 4v4h4"/>
  </svg>
);

export const IconMoon = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export const IconSun = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/>
  </svg>
);

export const IconCompress = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M4 8h6V2"/>
    <path d="M20 16h-6v6"/>
    <path d="M4 16h6v6"/>
    <path d="M20 8h-6V2"/>
  </svg>
);

export const IconSearch = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <circle cx="11" cy="11" r="7"/>
    <path d="M21 21l-4.3-4.3"/>
  </svg>
);

export const IconMenu = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M3 12h18"/>
    <path d="M3 6h18"/>
    <path d="M3 18h18"/>
  </svg>
);

export const IconX = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M18 6L6 18"/>
    <path d="M6 6l12 12"/>
  </svg>
);

export const IconTrendingUp = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
    <polyline points="16,7 22,7 22,13"/>
  </svg>
);

export const IconBarChart = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M12 20V4"/>
    <path d="M18 20V8"/>
    <path d="M6 20v-6"/>
  </svg>
);

export const IconBookOpen = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

export const IconChevronLeft = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <polyline points="15,18 9,12 15,6"/>
  </svg>
);

export const IconChevronRight = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

export const IconCalendar = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export const IconTrophy = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 1.1.9 2 2 2s2-.9 2-2v-2.34"/>
    <path d="M8 9v6a4 4 0 0 0 8 0V9"/>
  </svg>
);

export const IconFire = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1.5-2.5"/>
    <path d="M15.5 14.5A2.5 2.5 0 0 1 13 12c0-1.38.5-2 1.5-2.5"/>
    <path d="M12 2c-1.5 0-3 1.5-3 3s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3z"/>
    <path d="M12 8v6"/>
  </svg>
);

export const IconZap = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
  </svg>
);

export const IconRocket = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

export const IconStar = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

export const IconDollarSign = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

export const IconTarget = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

export const IconChartBar = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M18 20V10"/>
    <path d="M12 20V4"/>
    <path d="M6 20v-6"/>
  </svg>
);

export const IconTrendingDown = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <polyline points="22,17 13.5,8.5 8.5,13.5 2,7"/>
    <polyline points="16,17 22,17 22,11"/>
  </svg>
);

export const IconEye = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const IconEdit = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export const IconCopy = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

export const IconTrash = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
  </svg>
);

export const IconUpload = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,5 17,10"/>
    <line x1="12" y1="5" x2="12" y2="15"/>
  </svg>
);

export const IconRefresh = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);

export const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

export const IconPlus = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const IconFilter = (props) => (
  <svg viewBox="0 0 24 24" {...base} {...props}>
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
  </svg>
);
