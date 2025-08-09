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
