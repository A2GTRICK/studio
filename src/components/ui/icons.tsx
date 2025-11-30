import React from 'react';

export const MortarAndPestle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Bowl of Hygieia - A more standard and cleaner pharmacy symbol */}
    <path d="M18.3,5.9a7.4,7.4,0,0,0-10.5,0" />
    <path d="M19,8.4a9.9,9.9,0,0,0-14,0" />
    <path d="M12,14.9v6" />
    <path d="M10,20.9h4" />
    <path d="M12,2.9a4.5,4.5,0,0,1,4.5,4.5v0a4.5,4.5,0,0,1-4.5,4.5h0a4.5,4.5,0,0,1-4.5-4.5v0A4.5,4.5,0,0,1,12,2.9Z" />
    <path d="M14.5,7.4H9.5" />
    <path d="M12,9.9V4.9" />
  </svg>
);
