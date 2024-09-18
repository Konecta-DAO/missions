import React from 'react';
import './AnimatedToken.css'; // Import the CSS file

const AnimatedToken: React.FC = () => {
  return (
    <div id="main">
      <div id="child" className="coin">
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 1190 740" preserveAspectRatio="xMidYMid meet"        >
          <rect id="svgEditorBackground" x="0" y="0" width="1190" height="740" style={{ fill: 'none', stroke: 'none' }} />
          <defs id="svgEditorDefs">
            <polygon id="svgEditorShapeDefs" style={{ fill: 'khaki', stroke: 'black', vectorEffect: 'non-scaling-stroke', strokeWidth: '1px', }}
            />
            <linearGradient gradientUnits="objectBoundingBox" id="lgrd2-black-white" spreadMethod="pad" x1="0%" x2="100%" y1="0%" y2="100%"            >
              <stop offset="0%" stopColor="black" />
              <stop offset="100%" stopColor="white" />
            </linearGradient>
            <linearGradient gradientUnits="objectBoundingBox" id="lgrd2-peachpuff-sienna-v" spreadMethod="reflect" x1="0%" x2="0%" y1="0%" y2="100%"            >
              <stop offset="0" style={{ stopColor: 'rgb(70, 209, 132)' }} />
              <stop
                offset="0"
                style={{ stopColor: 'mediumseagreen', stopOpacity: 0.84 }}
              />
              <stop offset="1" style={{ stopColor: 'seagreen', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient gradientUnits="objectBoundingBox" id="gradient1" spreadMethod="pad" x1="0%" x2="100%" y1="0%" y2="0%" gradientTransform="rotate(73.3427)"            >
              <stop offset="0" stopColor="#A5F0C6" />
              <stop offset="1" stopColor="#43C77E" />
            </linearGradient>
          </defs>

          <g transform="translate(1300, 600) scale(2.75)" style={{ transformOrigin: 'center' }}>
            <path className="st0" d="M238,147.6c8.6,3.1,8.8,3.4,9,11.9c0,3,0,5.9,0,8.9c0.1,4.4,0.3,8.7-4,11.9c-1.6,1.2-2.2,4.1-2.8,6.3
		c-5.6,20.7-27,40.7-54.2,40.5c-40.7-0.3-81.5,0.1-122.2-0.1c-25.3-0.1-46.1-15.7-53.8-39.8c-1.1-3.4-2.1-6.5-4.8-9.2
		c-1.6-1.6-2-4.8-2.3-7.3c-0.4-3.5-0.2-7.1-0.1-10.6c0.2-8.9,0.7-9.5,9.4-12.7c7.5-15.4,19.2-26.6,36.2-31.2
		c6.5-1.7,13.3-2.6,20.1-2.6c37.5-0.2,75,0,112.5-0.2C206.5,113.3,225.7,123.9,238,147.6L238,147.6z M126.5,194.6L126.5,194.6
		c6.2,0,12.4,0,18.6,0c8.6,0,17.1,0.2,25.7-0.1c10-0.3,18.3-6.7,21.2-15.9c3.2-9.8,0.1-19.8-8-26.1c-4.9-3.8-10.6-5.1-16.6-5.1
		c-9.1-0.1-18.3,0-27.5,0c-18.3,0-36.6,0-54.9,0c-8.3,0-15.9,2.2-21.2,9c-6.1,7.6-6.8,16.3-2.9,25c3.8,8.5,11.1,13,20.4,13.2
		C96.4,194.8,111.4,194.6,126.5,194.6L126.5,194.6z"/>
            <path className="st0" d="M72.4,96.7H55.1c-1.3-10.6,3.2-18.6,9.9-25.5c5.9-6.1,13.4-9.8,22.1-9.9c25.1-0.2,50.2-0.3,75.3,0
		c17.3,0.2,33.5,17.1,32.2,35.3c-2.7,0.1-5.5,0.3-8.4,0.4c-2.9,0.1-5.9,0-8.6,0c-0.7-0.8-1.3-1.2-1.5-1.7
		c-4.3-12.3-8.2-15.2-21.4-15.3c-6.4,0-12.8,0-19.8,0c-0.2,3.6-0.3,6.2-0.5,8.7c-0.2,2.3-0.4,4.6-0.6,7.6h-18.2
		c-0.3-5.2-0.6-10.4-0.9-16.2c-8.9,0-17.5-0.4-25.9,0.1c-6.6,0.4-11.5,4.2-14.2,10.5C73.9,92.8,73.2,94.7,72.4,96.7L72.4,96.7z"/>
          </g>

        </svg>
      </div>
      <div id="child1" className="coin"></div>
      <div id="child2" className="coin"></div>
      <div id="child3" className="coin"></div>
      <div id="child4" className="coin"></div>
      <div id="child5" className="coin"></div>
      <div id="child6" className="coin"></div>
      <div id="child7" className="coin"></div>
      <div id="child8" className="coin">
        <svg          xmlns="http://www.w3.org/2000/svg"          xmlnsXlink="http://www.w3.org/1999/xlink"          width="100%"
          height="100%"
          viewBox="0 0 1190 740"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect
            id="svgEditorBackground"
            x="0"
            y="0"
            width="1190"
            height="740"
            style={{ fill: 'none', stroke: 'none' }}
          />
          {/* Rest of the SVG definition remains the same */}
        </svg>
      </div>
    </div>
  );
};

export default AnimatedToken;
