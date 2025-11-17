
import * as React from 'react';

 

export const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (

  <svg

    viewBox="0 0 270 200"

    xmlns="http://www.w3.org/2000/svg"

    {...props}

    preserveAspectRatio="xMidYMid meet"

  >

    <g transform="translate(0, -35)">

        <text x="5" y="180" fontFamily="Arial, sans-serif" fontSize="60" fill="#231F20" fontWeight="bold">TARGET</text>

        <text x="5" y="230" fontFamily="Arial, sans-serif" fontSize="50" fill="#A7A9AC">DISTRIBUTION</text>

    </g>

    <path d="M129.5 0H157.9C227.1 0 270 41.2 270 100C270 158.8 227.1 200 157.9 200H129.5V123L172.1 100L129.5 77V0Z" fill="#231F20" transform="scale(0.5) translate(-20, -30)"/>

    <path d="M50 0H86.4V200H50V0Z" fill="#78B82A" transform="scale(0.5) translate(-20, -30)"/>

    <path d="M0 35H150L179.2 65L150 95H0V35Z" fill="#78B82A" transform="scale(0.5) translate(-20, -30)"/>

  </svg>

);