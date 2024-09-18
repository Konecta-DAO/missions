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


                {/* SVG shapes */}

                <path className={styles.st1} d="M-24,2269.4c-3.8,0-7.7-1.5-10.6-4.4c-5.9-5.9-5.9-15.4,0-21.2L441.3,1768v-753L-46,527.7c-5.9-5.9-5.9-15.3,0-21.2 c5.9-5.9,15.4-5.9,21.2,0l496.1,496.1v777.8l-484.7,484.7C-16.3,2268-20.1,2269.4-24,2269.4z" />

                <path className={styles.st1} d="M1432.6,2390c-3.8,0-7.7-1.5-10.6-4.4l-608.4-608.4V832L229.1,247.4V-275c0-8.3,6.7-15,15-15s15,6.7,15,15V235l584.6,584.6v945.2 l599.6,599.6c5.9,5.9,5.9,15.4,0,21.2C1440.3,2388.5,1436.5,2390,1432.6,2390L1432.6,2390z" />

                <polygon className={styles.st1} points="1361.8,2390.3 1331.8,2390.3 1331.8,1632.2 1255,1555.5 1016.1,1316.6 469.8,1316.6 469.8,1286.6 1022.3,1286.6 1028.6,1286.6  1032.9,1291 1276.3,1534.3 1357.4,1615.4 1361.8,1619.8 1361.8,1626 " />

                <polygon className={styles.st1} points="1574.9,1097.5 1574.9,2363.6 1544.9,2363.6 1544.9,1109.9 1197.1,762.1 1192.7,757.7 1192.7,572.6 929.7,309.6 929.7,-51.1  959.7,-51.1 959.7,297.2 1192.7,530.2 1192.7,-18.6 1222.7,-18.6 1222.7,745.2 1570.5,1093.1					" />

                <path className={styles.st1} d="M1920,398.2c-63,0-114,51-114,114c0,56.8,41.6,103.9,96,112.6v1615.7h36.1V624.8c54.4-8.7,96-55.8,96-112.6 C2034,449.3,1983,398.2,1920,398.2L1920,398.2z M1938.1,594.3c-5.8,1.3-11.8,2-18,2s-12.2-0.7-18.1-2c-37.7-8.3-66-41.9-66-82 c0-46.3,37.7-84,84-84s84,37.7,84,84C2004,552.4,1975.7,586,1938.1,594.3z" />

                <rect x="2422.7" y="-18.6" className={styles.st1} width="30" height="2348.9" />

                <polygon className={styles.st1} points="2615.2,2369.1 2585.2,2369.1 2585.2,927.8 2585.2,921.6 2589.6,917.2 2875.4,631.4 2875.4,-69.1 
          2905.4,-69.1 2905.4,637.6 2905.4,643.9 2901,648.2 2615.2,934"/>

                <path className={styles.st1} d="M2605.7,2315.6c-3.8,0-7.7-1.5-10.6-4.4c-5.9-5.9-5.9-15.4,0-21.2l467.7-467.7V804.6L3848,19.4c5.9-5.9,15.4-5.9,21.2,0 c5.9,5.9,5.9,15.4,0,21.2L3092.9,817v1017.8l-476.5,476.5C2613.4,2314.2,2609.6,2315.6,2605.7,2315.6L2605.7,2315.6z" />

                <path className={styles.st1} d="M3250.6,2351.3c-8.3,0-15-6.7-15-15v-763.7l310.2-310.2h456.1c8.3,0,15,6.7,15,15s-6.7,15-15,15h-443.6L3265.6,1585v751.2 C3265.6,2344.6,3258.9,2351.3,3250.6,2351.3L3250.6,2351.3z" />

                {/* Paths for the lights */}

                <path id="Linea1" className={styles.st2} d="M0,553c152.4,152.4,304.8,304.8,457.2,457.2c0,254.5,0,508.9,0,763.4 c-128.9,128.9-257.9,257.9-386.8,386.8" />

                <path id="Linea2" className={styles.st2} d="M245.3,0c0,79.9,0,159.7,0,239.6C439.7,434,634.1,628.4,828.5,822.8c0,315.8,0,631.6,0,947.4 c129.5,129.5,259.1,259.1,388.6,388.6" />

                <path id="Linea3" className={styles.st2} d="M469.8,1301.4c184.2,0,368.4,0,552.6,0c108.2,108.2,216.3,216.3,324.5,324.5c0,178,0,356.1,0,534.1" />

                <path id="Linea4" className={styles.st2} d="M1207.7-3.6c0,251.7,0,503.3,0,755c117.4,117.4,234.8,234.8,352.2,352.2c0,352.1,0,704.3,0,1056.4" />

                <path id="Linea5" className={styles.st2} d="M1920.1,614.2c0,515.3,0,1030.5,0,1545.8" />

                <path id="Linea6" className={styles.st2} d="M2438.2-4.1c0,721.4,0,1442.7,0,2164.1" />

                <path id="Linea7" className={styles.st2} d="M2890.6,0c0,211.9,0,423.8,0,635.6c-96.9,96.9-193.7,193.7-290.6,290.6c0,411.3,0,822.5,0,1233.8" />

                <path id="Linea8" className={styles.st2} d="M3840,47.3c-254.2,254.2-508.4,508.4-762.5,762.5c0,340.1,0,680.2,0,1020.2 c-110.3,110.3-220.7,220.7-331,331" />

                <path id="Linea9" className={styles.st2} d="M3840,1277.7c-95.7,0-191.3,0-287,0c-100.9,100.9-201.7,201.7-302.6,302.6c0,193.2,0,386.5,0,579.7" />

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

                <circle r="60" className={styles.movingLight}>
                    <animateMotion repeatCount="indefinite" dur="5s">
                        <mpath href="#Linea8" />
                    </animateMotion>
                </circle>

                <circle r="60" className={styles.movingLight}>
                    <animateMotion repeatCount="indefinite" dur="5s">
                        <mpath href="#Linea9" />
                    </animateMotion>
                </circle>

            </svg>
        </div>
    );
};

export default HomeBackgroundOverlay;
