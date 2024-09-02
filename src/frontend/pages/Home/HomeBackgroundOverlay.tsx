import React from 'react';
import styled from 'styled-components';

interface HomeBackgroundOverlayProps {
    mobile: boolean;
}

const SvgContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  mix-blend-mode: overlay;
`;

const SvgWithAnimation = styled.svg<{ mobile: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;
  width: ${({ mobile }) => (mobile ? '100%' : 'auto')};
  height: auto;
  transform: translateX(-50%);
  min-width: ${({ mobile }) => (mobile ? 'none' : '100%')};
  min-height: ${({ mobile }) => (mobile ? 'none' : '100%')};
  object-fit: cover;
  object-position: ${({ mobile }) => (mobile ? 'top' : 'initial')};

  .st1 {
    fill: #A88CED;
    stroke: #FFFFFF;
    stroke-width: 4;
    stroke-miterlimit: 10;
  }

  .st2 {
    fill: none;
    stroke: transparent;
  }

  .moving-light {
    fill: url(#lightGradient);
  }
`;

const HomeBackgroundOverlay: React.FC<HomeBackgroundOverlayProps> = ({ mobile }) => {
    return (
        <SvgContainer>
            <SvgWithAnimation viewBox={mobile ? "0 0 2160 3840" : "0 0 3840 2160"} mobile={mobile}>

                {/* Radial gradient for the lights */}

                <defs>
                    <radialGradient id="lightGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{ stopColor: "white" }} />
                        <stop offset="40%" style={{ stopColor: "white", stopOpacity: 0.33 }} />
                        <stop offset="85%" style={{ stopColor: "white", stopOpacity: 0 }} />
                    </radialGradient>
                </defs>

                {/* Desktop */}

                {!mobile && (
                    <>

                        {/* Original SVG shapes Desktop*/}

                        <path className="st1" d="M1920,398.2c-63,0-114,51-114,114c0,56.8,41.6,103.9,96,112.6v1615.7h36.1V624.7
          c54.4-8.7,96-55.8,96-112.6C2034,449.2,1983,398.2,1920,398.2L1920,398.2z M1938.1,594.2c-5.8,1.3-11.8,2-18,2
          s-12.2-0.7-18.1-2c-37.7-8.3-66-41.9-66-82c0-46.3,37.7-84,84-84s84,37.7,84,84C2004,552.3,1975.7,585.9,1938.1,594.2z"/>

                        <polygon className="st1" points="1361.8,2390.2 1331.8,2390.2 1331.8,1632.2 1255,1555.5 1016.1,1316.6 469.8,1316.6 
          469.8,1286.6 1022.3,1286.6 1028.6,1286.6 1032.9,1290.9 1276.3,1534.2 1357.4,1615.3 1361.8,1619.7 1361.8,1626"/>

                        <polygon className="st1" points="1574.9,1097.4 1574.9,2363.5 1544.9,2363.5 1544.9,1109.8 1197.1,762 1192.7,757.6 1192.7,572.6 
						929.7,309.6 929.7,-51.1 959.7,-51.1 959.7,297.2 1192.7,530.1 1192.7,-18.6 1222.7,-18.6 1222.7,745.2 1570.5,1093 					"/>

                        <rect x="2422.7" y="-18.6" className="st1" width="30" height="2348.9" />

                        <polygon className="st1" points="2615.2,2369.1 2585.2,2369.1 2585.2,927.8 2585.2,921.6 2589.6,917.2 2875.4,631.4 2875.4,-69.1 
          2905.4,-69.1 2905.4,637.6 2905.4,643.9 2901,648.2 2615.2,934"/>

                        <polygon className="st1" points="3092.5,875.2 3077.5,875.2 3077.5,890.2 3077.5,1074.3 3077.5,1114.3 3077.5,1198 2782.9,1481.5 
          2803.8,1503.1 3102.9,1215.2 3107.5,1210.8 3107.5,1204.4 3107.5,1112.2 3107.5,1072.2 3107.5,905.2 3645.5,905.2 3645.5,875.2"/>

                        <polygon className="st1" points="3241.6,547.8 3226.6,547.8 3226.6,562.8 3226.6,995.1 3226.6,1035.1 3226.6,1240.2 2820.5,1645.8 
          2841.7,1667.1 3252.2,1257 3256.6,1252.6 3256.6,1246.4 3256.6,1035.9 3256.6,995.9 3256.6,577.8 3595.5,577.8 3595.5,547.8"/>

                        {/* Paths for the lights to follow Desktop */}

                        <path id="Linea1" className="st2" d="M469.8,1301.4c184.2,0,368.4,0,552.6,0c108.2,108.2,216.3,216.3,324.5,324.5
          c0,178,0,356.1,0,534.1"/>

                        <path id="Linea2" className="st2" d="M1207.7-3.6c0,251.7,0,503.3,0,755c117.4,117.4,234.8,234.8,352.2,352.2
          c0,352.1,0,704.3,0,1056.4"/>

                        <path id="Linea3" className="st2" d="M1920.1,614.2c0,515.3,0,1030.5,0,1545.8" />

                        <path id="Linea4" className="st2" d="M2438.2-4.1c0,721.4,0,1442.7,0,2164.1" />

                        <path id="Linea5" className="st2" d="M2890.6,0c0,211.9,0,423.8,0,635.6c-96.9,96.9-193.7,193.7-290.6,290.6c0,411.3,0,822.5,0,1233.8" />

                        <path id="Linea6" className="st2" d="M3645.5,890.7c-184.3,0-368.5,0-552.8,0c0,104.4,0,208.7,0,313.1
          c-100,96-199.9,191.9-299.9,287.9"/>

                        <path id="Linea7" className="st2" d="M3595.5,563.6c-117.6,0-235.2,0-352.7,0c0,227.1,0,454.2,0,681.3
          c-137.2,137.2-274.4,274.4-411.7,411.7"/>

                        {/* Animated circles (lights) for each path Desktop*/}

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea1" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea2" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea3" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea4" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea5" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea6" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea7" />
                            </animateMotion>
                        </circle>
                    </>
                )}

                {/* Mobile */}

                {mobile && (
                    <>
                        {/* SVG shapes for mobile */}

                        <polygon id="Cir1-mobile" className="st1" points="292.6,4009.7 232.6,4009.7 232.6,2958.6 232.6,2946.2 241.4,2937.4 421.8,2757 
					593.5,2585.4 593.5,1660.8 264.4,1660.8 264.4,1600.8 623.5,1600.8 653.5,1600.8 653.5,1630.8 653.5,2597.8 653.5,2610.2 
					644.7,2619 464.2,2799.4 292.6,2971.1 				"/>

                        <polygon id="Cir2-mobile" className="st1" points="956.5,3916.9 896.5,3916.9 896.5,1177.5 264.4,1177.5 264.4,1117.5 926.5,1117.5 
					956.5,1117.5 956.5,1147.5 				"/>

                        <path id="Cir3-mobile" className="st1" d="M1479.9,3296.3l-239-240v-597.4c66.3-13.2,116.4-71.7,116.4-141.9c0-79.9-64.8-144.7-144.7-144.7
					s-144.7,64.8-144.7,144.7c0,69,48.3,126.8,113,141.2v623.1l8.8,8.8l239,240v666.5h60v-691.5L1479.9,3296.3L1479.9,3296.3z
					 M1117.6,2317c0-52.4,42.6-95,95-95s95,42.6,95,95s-42.6,95-95,95S1117.6,2369.4,1117.6,2317z"/>

                        <polygon id="Cir4-mobile" className="st1" points="1915.7,4029.5 1855.7,4029.5 1855.7,3309.8 1649.1,3103.1 1433.7,2887.7 1424.9,2878.9 
					1424.9,2866.5 1424.9,-30 1484.9,-30 1484.9,2854.1 1691.5,3060.7 1906.9,3276.1 1915.7,3284.9 1915.7,3297.3 				"/>

                        <path id="Cir5-mobile" className="st1" d="M1946.2,2685.3v-645.9l395.6-398.9l-42.4-42.8L1895,2005.6l-8.8,8.9v670.7
					c-65.8,13.6-115.2,71.9-115.2,141.7c0,79.9,64.8,144.7,144.7,144.7s144.7-64.8,144.7-144.7
					C2060.4,2757.4,2011.5,2699.4,1946.2,2685.3L1946.2,2685.3z M1915.7,2921.8c-52.4,0-95-42.6-95-95s42.6-95,95-95s95,42.6,95,95
					S1968.1,2921.8,1915.7,2921.8z"/>

                        {/* Paths for the lights to follow Desktop */}

                        <path id="Linea1-mobile" className="st2" d="M261.7,3840c0-294.6,0-589.2,0-883.7c120.5-120.5,241-241,361.5-361.5c0-321.3,0-642.7,0-964
		c-119.6,0-239.2,0-358.8,0"/>
                        <path id="Linea2-mobile" className="st2" d="M264.4,1144c220.4,0,440.8,0,661.2,0c0,898.7,0,1797.3,0,2696" />
                        <path id="Linea3-mobile" className="st2" d="M1214.4,2456.8c0,204.4,0,408.8,0,613.3c81.2,81.2,162.5,162.5,243.7,243.7
		c0,175.4,0,350.8,0,526.2"/>
                        <path id="Linea4-mobile" className="st2" d="M1457.5,0c0,954.6,0,1909.2,0,2863.8c142.5,142.5,285,285,427.5,427.5c0,182.9,0,365.8,0,548.7" />
                        <path id="Linea5-mobile" className="st2" d="M2160,1782.2c-81.2,81.2-162.4,162.4-243.6,243.6c0,221.1,0,442.2,0,663.3" />

                        {/* Animated circles (lights) for each path Desktop*/}

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea1-mobile" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea2-mobile" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea3-mobile" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea4-mobile" />
                            </animateMotion>
                        </circle>

                        <circle r="60" className="moving-light">
                            <animateMotion repeatCount="indefinite" dur="5s">
                                <mpath href="#Linea5-mobile" />
                            </animateMotion>
                        </circle>

                    </>
                )}
            </SvgWithAnimation>
        </SvgContainer>
    );
};

export default HomeBackgroundOverlay;
