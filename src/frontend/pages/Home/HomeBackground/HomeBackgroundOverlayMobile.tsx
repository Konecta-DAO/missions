import React from 'react';
import styles from './HomeBackgroundOverlayMobile.module.scss';

const HomeBackgroundOverlayMobile: React.FC = () => {
    return (
        <div className={styles.svgContainer}>
            <svg
                className={styles.svgContent}
                viewBox='0 0 2160 3840'
                preserveAspectRatio="xMidYMax slice"
            >
                {/* Radial gradient for the lights */}

                <defs>
                    <radialGradient id="lightGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{ stopColor: "white" }} />
                        <stop offset="40%" style={{ stopColor: "white", stopOpacity: 0.33 }} />
                        <stop offset="85%" style={{ stopColor: "white", stopOpacity: 0 }} />
                    </radialGradient>
                </defs>

                <>
                    {/* SVG shapes for mobile */}

                    <polygon id="Cir1" className={styles.st1} points="392.6,4009.7 332.6,4009.7 332.6,2958.6 332.6,2946.2 341.4,2937.4 521.8,2757  693.5,2585.4 693.5,1660.8 364.4,1660.8 364.4,1600.8 723.5,1600.8 753.5,1600.8 753.5,1630.8 753.5,2597.8 753.5,2610.2  744.7,2619 564.2,2799.4 392.6,2971.1  " />
                    <path id="Cir2" className={styles.st1} d="M956.5,3916.9h-60V1177.5c-189.3,0-378.6,0-567.9,0c0-20,0-40,0-60c199.3,0,398.6,0,597.9,0h30v30 V3916.9z" />

                    <path id="Cir3-mobile" className={styles.st1} d="M1479.9,3296.3l-239-240v-597.4c66.3-13.2,116.4-71.7,116.4-141.9c0-79.9-64.8-144.7-144.7-144.7
					s-144.7,64.8-144.7,144.7c0,69,48.3,126.8,113,141.2v623.1l8.8,8.8l239,240v666.5h60v-691.5L1479.9,3296.3L1479.9,3296.3z
					 M1117.6,2317c0-52.4,42.6-95,95-95s95,42.6,95,95s-42.6,95-95,95S1117.6,2369.4,1117.6,2317z"/>

                    <polygon id="Cir4-mobile" className={styles.st1} points="1915.7,4029.5 1855.7,4029.5 1855.7,3309.8 1649.1,3103.1 1433.7,2887.7 1424.9,2878.9 
					1424.9,2866.5 1424.9,-30 1484.9,-30 1484.9,2854.1 1691.5,3060.7 1906.9,3276.1 1915.7,3284.9 1915.7,3297.3 				"/>

                    <path id="Cir5-mobile" className={styles.st1} d="M1946.2,2685.3v-645.9l395.6-398.9l-42.4-42.8L1895,2005.6l-8.8,8.9v670.7
					c-65.8,13.6-115.2,71.9-115.2,141.7c0,79.9,64.8,144.7,144.7,144.7s144.7-64.8,144.7-144.7
					C2060.4,2757.4,2011.5,2699.4,1946.2,2685.3L1946.2,2685.3z M1915.7,2921.8c-52.4,0-95-42.6-95-95s42.6-95,95-95s95,42.6,95,95
					S1968.1,2921.8,1915.7,2921.8z"/>

                    <path id="Linea1" className={styles.st2} d="M361.7,3840c0-294.6,0-589.2,0-883.7c120.5-120.5,241-241,361.5-361.5c0-321.3,0-642.7,0-964 c-119.6,0-239.2,0-358.8,0" />
                    <path id="Linea2" className={styles.st2} d="M329.1,1143.2c198.8,0.3,397.6,0.6,596.5,0.8c0,898.7,0,1797.3,0,2696" />
                    <path id="Linea3-mobile" className={styles.st2} d="M1214.4,2456.8c0,204.4,0,408.8,0,613.3c81.2,81.2,162.5,162.5,243.7,243.7
		c0,175.4,0,350.8,0,526.2"/>
                    <path id="Linea4-mobile" className={styles.st2} d="M1457.5,0c0,954.6,0,1909.2,0,2863.8c142.5,142.5,285,285,427.5,427.5c0,182.9,0,365.8,0,548.7" />
                    <path id="Linea5-mobile" className={styles.st2} d="M2160,1782.2c-81.2,81.2-162.4,162.4-243.6,243.6c0,221.1,0,442.2,0,663.3" />


                    <circle r="60" className={styles.movingLight}>
                        <animateMotion repeatCount="indefinite" dur="5s">
                            <mpath href="#Linea1-mobile" />
                        </animateMotion>
                    </circle>

                    <circle r="60" className={styles.movingLight}
                    >
                        <animateMotion repeatCount="indefinite" dur="5s">
                            <mpath href="#Linea2-mobile" />
                        </animateMotion>
                    </circle>

                    <circle r="60" className={styles.movingLight}
                    >
                        <animateMotion repeatCount="indefinite" dur="5s">
                            <mpath href="#Linea3-mobile" />
                        </animateMotion>
                    </circle>

                    <circle r="60" className={styles.movingLight}
                    >
                        <animateMotion repeatCount="indefinite" dur="5s">
                            <mpath href="#Linea4-mobile" />
                        </animateMotion>
                    </circle>

                    <circle r="60" className={styles.movingLight}
                    >
                        <animateMotion repeatCount="indefinite" dur="5s">
                            <mpath href="#Linea5-mobile" />
                        </animateMotion>
                    </circle>

                </>
            </svg>
        </div >

    );
};

export default HomeBackgroundOverlayMobile;
