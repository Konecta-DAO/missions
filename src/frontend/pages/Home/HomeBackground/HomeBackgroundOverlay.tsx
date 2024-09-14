import React from 'react';
import styles from './HomeBackgroundOverlay.module.scss';

const HomeBackgroundOverlay: React.FC = () => {
    return (
        <div className={styles.svgContainer}>
            <svg
                className={styles.svgContent}
                viewBox='0 0 3840 2160'
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


                {/* SVG shapes for mobile */}

                <path className={styles.st1} d="M1920,398.2c-63,0-114,51-114,114c0,56.8,41.6,103.9,96,112.6v1615.7h36.1V624.7
          c54.4-8.7,96-55.8,96-112.6C2034,449.2,1983,398.2,1920,398.2L1920,398.2z M1938.1,594.2c-5.8,1.3-11.8,2-18,2
          s-12.2-0.7-18.1-2c-37.7-8.3-66-41.9-66-82c0-46.3,37.7-84,84-84s84,37.7,84,84C2004,552.3,1975.7,585.9,1938.1,594.2z"/>

                <polygon className={styles.st1} points="1361.8,2390.2 1331.8,2390.2 1331.8,1632.2 1255,1555.5 1016.1,1316.6 469.8,1316.6 
          469.8,1286.6 1022.3,1286.6 1028.6,1286.6 1032.9,1290.9 1276.3,1534.2 1357.4,1615.3 1361.8,1619.7 1361.8,1626"/>

                <polygon className={styles.st1} points="1574.9,1097.4 1574.9,2363.5 1544.9,2363.5 1544.9,1109.8 1197.1,762 1192.7,757.6 1192.7,572.6 
						929.7,309.6 929.7,-51.1 959.7,-51.1 959.7,297.2 1192.7,530.1 1192.7,-18.6 1222.7,-18.6 1222.7,745.2 1570.5,1093 					"/>

                <rect x="2422.7" y="-18.6" className={styles.st1} width="30" height="2348.9" />

                <polygon className={styles.st1} points="2615.2,2369.1 2585.2,2369.1 2585.2,927.8 2585.2,921.6 2589.6,917.2 2875.4,631.4 2875.4,-69.1 
          2905.4,-69.1 2905.4,637.6 2905.4,643.9 2901,648.2 2615.2,934"/>

                <polygon className={styles.st1} points="3092.5,875.2 3077.5,875.2 3077.5,890.2 3077.5,1074.3 3077.5,1114.3 3077.5,1198 2782.9,1481.5 
          2803.8,1503.1 3102.9,1215.2 3107.5,1210.8 3107.5,1204.4 3107.5,1112.2 3107.5,1072.2 3107.5,905.2 3645.5,905.2 3645.5,875.2"/>

                <polygon className={styles.st1} points="3241.6,547.8 3226.6,547.8 3226.6,562.8 3226.6,995.1 3226.6,1035.1 3226.6,1240.2 2820.5,1645.8 
          2841.7,1667.1 3252.2,1257 3256.6,1252.6 3256.6,1246.4 3256.6,1035.9 3256.6,995.9 3256.6,577.8 3595.5,577.8 3595.5,547.8"/>

                {/* Paths for the lights to follow Desktop */}

                <path id="Linea1" className={styles.st2} d="M469.8,1301.4c184.2,0,368.4,0,552.6,0c108.2,108.2,216.3,216.3,324.5,324.5
          c0,178,0,356.1,0,534.1"/>

                <path id="Linea2" className={styles.st2} d="M1207.7-3.6c0,251.7,0,503.3,0,755c117.4,117.4,234.8,234.8,352.2,352.2
          c0,352.1,0,704.3,0,1056.4"/>

                <path id="Linea3" className={styles.st2} d="M1920.1,614.2c0,515.3,0,1030.5,0,1545.8" />

                <path id="Linea4" className={styles.st2} d="M2438.2-4.1c0,721.4,0,1442.7,0,2164.1" />

                <path id="Linea5" className={styles.st2} d="M2890.6,0c0,211.9,0,423.8,0,635.6c-96.9,96.9-193.7,193.7-290.6,290.6c0,411.3,0,822.5,0,1233.8" />

                <path id="Linea6" className={styles.st2} d="M3645.5,890.7c-184.3,0-368.5,0-552.8,0c0,104.4,0,208.7,0,313.1
          c-100,96-199.9,191.9-299.9,287.9"/>

                <path id="Linea7" className={styles.st2} d="M3595.5,563.6c-117.6,0-235.2,0-352.7,0c0,227.1,0,454.2,0,681.3
          c-137.2,137.2-274.4,274.4-411.7,411.7"/>

                {/* Animated circles (lights) for each path Desktop*/}

                <circle r="60" className={styles.movingLight}>
                    <animateMotion repeatCount="indefinite" dur="5s">
                        <mpath href="#Linea1" />
                    </animateMotion>
                </circle>

                <circle r="60" className={styles.movingLight}>
                    <animateMotion repeatCount="indefinite" dur="5s">
                        <mpath href="#Linea2" />
                    </animateMotion>
                </circle>

                <circle r="60" className={styles.movingLight}>
                    <animateMotion repeatCount="indefinite" dur="5s">
                        <mpath href="#Linea3" />
                    </animateMotion>
                </circle>

                <circle r="60" className={styles.movingLight}>
                    <animateMotion repeatCount="indefinite" dur="5s">
                        <mpath href="#Linea4" />
                    </animateMotion>
                </circle>

                <circle r="60" className={styles.movingLight}>
                    <animateMotion repeatCount="indefinite" dur="5s">
                        <mpath href="#Linea5" />
                    </animateMotion>
                </circle>

                <circle r="60" className={styles.movingLight}>
                    <animateMotion repeatCount="indefinite" dur="5s">
                        <mpath href="#Linea6" />
                    </animateMotion>
                </circle>

                <circle r="60" className={styles.movingLight}>
                    <animateMotion repeatCount="indefinite" dur="5s">
                        <mpath href="#Linea7" />
                    </animateMotion>
                </circle>

            </svg>
        </div>
    );
};

export default HomeBackgroundOverlay;
