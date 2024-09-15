import React from 'react';

const KonectaSVG: React.FC = () => {
    return (
        <svg
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 1618.4 934.1"
            enableBackground="new 0 0 1618.4 934.1"
            xmlSpace="preserve"
            overflow="visible"
        >
            <style>
                {`
        @keyframes switchEngranajes {
            0% { opacity: 1; }
            25% { opacity: 0; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }
                    @keyframes float {
            0% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-20px);
            }
            100% {
                transform: translateY(0);
            }
        }

        #KonectaIcon {
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes opacityPulse {
                0% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.67;
                }
                100% {
                    opacity: 1;
                }
            }

            #SombraKonecta {
                animation: opacityPulse 3s ease-in-out infinite;
            }
        @keyframes fadeInOut {
                0% {
                    opacity: 0;
                }
                33.33% {
                    opacity: 1;
                }
                83.33% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }

            #path1 {
                animation: fadeInOut 6s ease-in-out infinite;
                animation-delay: 0s;
            }

            #path2 {
                animation: fadeInOut 6s ease-in-out infinite;
                animation-delay: 0.5s;
            }

            #path3 {
                animation: fadeInOut 6s ease-in-out infinite;
                animation-delay: 1s;
            }

            #path4 {
                animation: fadeInOut 6s ease-in-out infinite;
                animation-delay: 1.5s;
            }

            #path5 {
                animation: fadeInOut 6s ease-in-out infinite;
                animation-delay: 2s;
            }

            #path6 {
                animation: fadeInOut 6s ease-in-out infinite;
                animation-delay: 2.5s;
            }
        
        @keyframes glowEffect {
                0% {
                    filter: drop-shadow(0 0 0px rgba(52, 170, 220, 0));
                }
                50% {
                    filter: drop-shadow(0 0 10px rgba(52, 170, 220, 0.75));
                }
                100% {
                    filter: drop-shadow(0 0 0px rgba(52, 170, 220, 0));
                }
            }

            /* CirGoogle and CirBGoogle Animation (0s to 2s) */
            #CirGoogle, #CirBGoogle {
                animation: glowEffect 6s ease-in-out infinite;
                animation-delay: 0s;
            }

            /* CirOpenChat and CirBOpenChat Animation (2s to 4s) */
            #CirOpenChat, #CirBOpenChat {
                animation: glowEffect 6s ease-in-out infinite;
                animation-delay: 2s;
            }

            /* CirCalendly Animation (4s to 6s) */
            #CirCalendly {
                animation: glowEffect 6s ease-in-out infinite;
                animation-delay: 4s;
            }   
        `}
            </style>
            <defs>
                <radialGradient
                    id="Degradado_sin_nombre"
                    cx={809.51}
                    cy={550.6}
                    fx={809.51}
                    fy={550.6}
                    r={580.77}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.03} stopColor="#337ff5" />
                    <stop offset={0.16} stopColor="#2763bf" stopOpacity={0.78} />
                    <stop offset={0.35} stopColor="#19407b" stopOpacity={0.51} />
                    <stop offset={0.53} stopColor="#0e2446" stopOpacity={0.29} />
                    <stop offset={0.67} stopColor="#061020" stopOpacity={0.13} />
                    <stop offset={0.79} stopColor="#010408" stopOpacity={0.04} />
                    <stop offset={0.87} stopOpacity={0} />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_2"
                    cx={551.26}
                    cy={468.11}
                    fx={551.26}
                    fy={468.11}
                    r={92.94}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_3"
                    cx={559.62}
                    cy={499.78}
                    fx={559.62}
                    fy={499.78}
                    r={77.8}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_4"
                    cx={525.07}
                    cy={447.57}
                    fx={525.07}
                    fy={447.57}
                    r={97.32}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_5"
                    cx={542.37}
                    cy={462.78}
                    fx={542.37}
                    fy={462.78}
                    r={94.66}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#000c7e" />
                    <stop offset={0.18} stopColor="#0f2ea1" />
                    <stop offset={0.31} stopColor="#2259ce" />
                    <stop offset={0.41} stopColor="#2e74ea" />
                    <stop offset={0.47} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#3179ee" />
                    <stop offset={0.58} stopColor="#2b68db" />
                    <stop offset={0.67} stopColor="#224dbd" />
                    <stop offset={0.76} stopColor="#162893" />
                    <stop offset={0.77} stopColor="#15248e" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_6"
                    cx={550.73}
                    cy={494.44}
                    fx={550.73}
                    fy={494.44}
                    r={79.45}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#000c7e" />
                    <stop offset={0.18} stopColor="#0f2ea1" />
                    <stop offset={0.31} stopColor="#2259ce" />
                    <stop offset={0.41} stopColor="#2e74ea" />
                    <stop offset={0.47} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#3179ee" />
                    <stop offset={0.58} stopColor="#2b68db" />
                    <stop offset={0.67} stopColor="#224dbd" />
                    <stop offset={0.76} stopColor="#162893" />
                    <stop offset={0.77} stopColor="#15248e" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_7"
                    cx={516.19}
                    cy={442.24}
                    fx={516.19}
                    fy={442.24}
                    r={99.08}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#000c7e" />
                    <stop offset={0.18} stopColor="#0f2ea1" />
                    <stop offset={0.31} stopColor="#2259ce" />
                    <stop offset={0.41} stopColor="#2e74ea" />
                    <stop offset={0.47} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#3179ee" />
                    <stop offset={0.58} stopColor="#2b68db" />
                    <stop offset={0.67} stopColor="#224dbd" />
                    <stop offset={0.76} stopColor="#162893" />
                    <stop offset={0.77} stopColor="#15248e" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_8"
                    cx={1029.35}
                    cy={471.25}
                    fx={1029.35}
                    fy={471.25}
                    r={96.04}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_9"
                    cx={1051.38}
                    cy={487.68}
                    fx={1051.38}
                    fy={487.68}
                    r={66.9}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_10"
                    cx={1082.4}
                    cy={461.34}
                    fx={1082.4}
                    fy={461.34}
                    r={74.54}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_11"
                    cx={1020.47}
                    cy={476.59}
                    fx={1020.47}
                    fy={476.59}
                    r={97.77}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#000c7e" />
                    <stop offset={0.18} stopColor="#0f2ea1" />
                    <stop offset={0.31} stopColor="#2259ce" />
                    <stop offset={0.41} stopColor="#2e74ea" />
                    <stop offset={0.47} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#3179ee" />
                    <stop offset={0.58} stopColor="#2b68db" />
                    <stop offset={0.67} stopColor="#224dbd" />
                    <stop offset={0.76} stopColor="#162893" />
                    <stop offset={0.77} stopColor="#15248e" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_12"
                    cx={1042.5}
                    cy={493.01}
                    fx={1042.5}
                    fy={493.01}
                    r={68.67}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#000c7e" />
                    <stop offset={0.18} stopColor="#0f2ea1" />
                    <stop offset={0.31} stopColor="#2259ce" />
                    <stop offset={0.41} stopColor="#2e74ea" />
                    <stop offset={0.47} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#3179ee" />
                    <stop offset={0.58} stopColor="#2b68db" />
                    <stop offset={0.67} stopColor="#224dbd" />
                    <stop offset={0.76} stopColor="#162893" />
                    <stop offset={0.77} stopColor="#15248e" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_13"
                    cx={1073.52}
                    cy={466.67}
                    fx={1073.52}
                    fy={466.67}
                    r={76.31}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#000c7e" />
                    <stop offset={0.18} stopColor="#0f2ea1" />
                    <stop offset={0.31} stopColor="#2259ce" />
                    <stop offset={0.41} stopColor="#2e74ea" />
                    <stop offset={0.47} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#3179ee" />
                    <stop offset={0.58} stopColor="#2b68db" />
                    <stop offset={0.67} stopColor="#224dbd" />
                    <stop offset={0.76} stopColor="#162893" />
                    <stop offset={0.77} stopColor="#15248e" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_106"
                    cx={822.63}
                    cy={439.35}
                    fx={1056.42}
                    fy={251.18}
                    r={300.11}
                    gradientTransform="rotate(-64.83 1617.697 164.789)scale(1 -.79)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#363548" />
                    <stop offset={0.7} stopColor="#201f34" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_16"
                    cx={3527.49}
                    cy={-2251.47}
                    fx={3769.7}
                    fy={-2446.42}
                    r={310.92}
                    gradientTransform="matrix(.26369 -.56113 15.7114 2.37572 35276.31 7968.95)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.71} stopColor="#454556" />
                    <stop offset={0.92} stopColor="#363548" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_18"
                    cx={851.14}
                    cy={247.36}
                    fx={851.14}
                    fy={247.36}
                    r={97.19}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_19"
                    cx={874.77}
                    cy={256.43}
                    fx={874.77}
                    fy={256.43}
                    r={92.35}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_20"
                    cx={830.1}
                    cy={249.34}
                    fx={830.1}
                    fy={249.34}
                    r={96.12}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_21"
                    cx={842.25}
                    cy={243.8}
                    fx={842.25}
                    fy={243.8}
                    r={98.78}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#000c7e" />
                    <stop offset={0.18} stopColor="#0f2ea1" />
                    <stop offset={0.31} stopColor="#2259ce" />
                    <stop offset={0.41} stopColor="#2e74ea" />
                    <stop offset={0.47} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#3179ee" />
                    <stop offset={0.58} stopColor="#2b68db" />
                    <stop offset={0.67} stopColor="#224dbd" />
                    <stop offset={0.76} stopColor="#162893" />
                    <stop offset={0.77} stopColor="#15248e" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_22"
                    cx={865.89}
                    cy={252.87}
                    fx={865.89}
                    fy={252.87}
                    r={93.86}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#000c7e" />
                    <stop offset={0.18} stopColor="#0f2ea1" />
                    <stop offset={0.31} stopColor="#2259ce" />
                    <stop offset={0.41} stopColor="#2e74ea" />
                    <stop offset={0.47} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#3179ee" />
                    <stop offset={0.58} stopColor="#2b68db" />
                    <stop offset={0.67} stopColor="#224dbd" />
                    <stop offset={0.76} stopColor="#162893" />
                    <stop offset={0.77} stopColor="#15248e" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_23"
                    cx={821.21}
                    cy={245.79}
                    fx={821.21}
                    fy={245.79}
                    r={97.73}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#000c7e" />
                    <stop offset={0.18} stopColor="#0f2ea1" />
                    <stop offset={0.31} stopColor="#2259ce" />
                    <stop offset={0.41} stopColor="#2e74ea" />
                    <stop offset={0.47} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#3179ee" />
                    <stop offset={0.58} stopColor="#2b68db" />
                    <stop offset={0.67} stopColor="#224dbd" />
                    <stop offset={0.76} stopColor="#162893" />
                    <stop offset={0.77} stopColor="#15248e" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_24"
                    cx={650.35}
                    cy={427.04}
                    fx={650.35}
                    fy={427.04}
                    r={18.53}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_25"
                    cx={659.61}
                    cy={450.42}
                    fx={659.61}
                    fy={450.42}
                    r={18.53}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_26"
                    cx={671.7}
                    cy={475.71}
                    fx={671.7}
                    fy={475.71}
                    r={18.53}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_27"
                    cx={916.2}
                    cy={455.73}
                    fx={916.2}
                    fy={455.73}
                    r={15.67}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_28"
                    cx={896.91}
                    cy={467.48}
                    fx={896.91}
                    fy={467.48}
                    r={15.67}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0.1} stopColor="#2971dc" />
                    <stop offset={0.42} stopColor="#2993ec" />
                    <stop offset={0.73} stopColor="#29affa" />
                    <stop offset={0.92} stopColor="#2abaff" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_29"
                    cx={786.01}
                    cy={422.31}
                    fx={907.15}
                    fy={358.03}
                    r={137.13}
                    gradientTransform="matrix(1 0 0 -.7 0 845.37)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#363548" />
                    <stop offset={0.81} stopColor="#201f34" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_31"
                    cx={790.62}
                    cy={454.3}
                    fx={859.08}
                    fy={366.67}
                    r={127.09}
                    gradientTransform="rotate(89.64 413.615 125.666)scale(1 -.54)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.29} stopColor="#767582" />
                    <stop offset={0.51} stopColor="#6c6c79" />
                    <stop offset={0.71} stopColor="#5c5c6b" />
                    <stop offset={0.9} stopColor="#464556" />
                    <stop offset={1} stopColor="#363548" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_157"
                    cx={788.67}
                    cy={501.02}
                    fx={788.67}
                    fy={501.02}
                    r={84.23}
                    gradientTransform="matrix(1 0 0 .38 0 309.51)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#474751" />
                    <stop offset={0.16} stopColor="#41424a" stopOpacity={0.92} />
                    <stop offset={0.4} stopColor="#303437" stopOpacity={0.68} />
                    <stop offset={0.68} stopColor="#151d18" stopOpacity={0.3} />
                    <stop offset={0.86} stopColor="#000c00" stopOpacity={0} />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_33"
                    cx={786.02}
                    cy={572.46}
                    fx={786.02}
                    fy={432.99}
                    r={207.55}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#fff" />
                    <stop offset={0.03} stopColor="#edf3fe" />
                    <stop offset={0.14} stopColor="#9ec2fa" />
                    <stop offset={0.24} stopColor="#649df7" />
                    <stop offset={0.31} stopColor="#4087f5" />
                    <stop offset={0.35} stopColor="#337ff5" />
                    <stop offset={0.51} stopColor="#5f62ef" />
                    <stop offset={0.64} stopColor="#7d4fec" />
                    <stop offset={0.71} stopColor="#8849eb" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_34"
                    cx={786.77}
                    cy={636.31}
                    fx={866.08}
                    fy={525.54}
                    r={136.23}
                    gradientTransform="matrix(.99987 .01588 .01112 -.69991 -7.77 762.27)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#363548" />
                    <stop offset={0.81} stopColor="#201f34" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_36"
                    cx={820.53}
                    cy={802.03}
                    fx={820.53}
                    fy={802.03}
                    r={200.07}
                    gradientTransform="scale(1 -1)rotate(-89.64 289.455 224.4)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.29} stopColor="#767582" />
                    <stop offset={0.51} stopColor="#6c6c79" />
                    <stop offset={0.71} stopColor="#5c5c6b" />
                    <stop offset={0.9} stopColor="#464556" />
                    <stop offset={1} stopColor="#363548" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_38"
                    cx={784.72}
                    cy={771.02}
                    fx={909.82}
                    fy={771.02}
                    r={125.1}
                    gradientTransform="matrix(1 0 0 -131.42 0 101593.49)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#363548" />
                    <stop offset={0.81} stopColor="#201f34" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_42"
                    cx={784.72}
                    cy={771.02}
                    fx={907.44}
                    fy={771.02}
                    r={122.72}
                    gradientTransform="matrix(1 0 0 -131.42 0 101592.85)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#363548" />
                    <stop offset={0.79} stopColor="#201f34" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_44"
                    cx={777.07}
                    cy={782.47}
                    fx={899.4}
                    fy={782.47}
                    r={122.36}
                    gradientTransform="rotate(-33.17 173848.127 -51308.355)scale(1 -131.42)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.25} stopColor="#757581" />
                    <stop offset={0.49} stopColor="#696976" />
                    <stop offset={0.73} stopColor="#565565" />
                    <stop offset={0.96} stopColor="#3a3a4c" />
                    <stop offset={1} stopColor="#363548" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_46"
                    cx={781.62}
                    cy={768.73}
                    fx={909.37}
                    fy={768.73}
                    r={127.75}
                    gradientTransform="rotate(-10.43 555699.717 -50371.508)scale(1 -131.42)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#363548" />
                    <stop offset={0.56} stopColor="#28273c" />
                    <stop offset={0.84} stopColor="#201f34" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_50"
                    cx={779.63}
                    cy={769.15}
                    fx={912.31}
                    fy={769.15}
                    r={132.77}
                    gradientTransform="rotate(-11.5 504026.686 -50481.415)scale(1 -131.42)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#363548" />
                    <stop offset={0.83} stopColor="#201f34" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_54"
                    cx={783.34}
                    cy={788.82}
                    fx={827.54}
                    fy={788.82}
                    r={44.2}
                    gradientTransform="matrix(.99954 -.03036 -3.99044 -131.3594 3149.42 103889.94)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#363548" />
                    <stop offset={0.81} stopColor="#201f34" />
                </radialGradient>
                <radialGradient
                    id="Degradado_sin_nombre_56"
                    cx={1512.64}
                    cy={1853.79}
                    fx={1546.64}
                    fy={1853.79}
                    r={34}
                    gradientTransform="matrix(.96913 -.14553 -33.11208 -73.47755 60703.66 136666.53)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.23} stopColor="#747480" />
                    <stop offset={0.48} stopColor="#666674" />
                    <stop offset={0.76} stopColor="#505060" />
                    <stop offset={1} stopColor="#363548" />
                </radialGradient>
                <linearGradient
                    id="Degradado_sin_nombre_15"
                    x1={767.17}
                    y1={179.99}
                    x2={864.47}
                    y2={460.86}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.23} stopColor="#706f7c" />
                    <stop offset={0.59} stopColor="#575766" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_17"
                    x1={2994.25}
                    y1={-1763.96}
                    x2={3398.17}
                    y2={-1763.96}
                    gradientTransform="matrix(.24881 -.71812 1.29938 .25116 2330.72 3320.52)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.49} stopColor="#777783" />
                    <stop offset={0.66} stopColor="#70707d" />
                    <stop offset={0.79} stopColor="#646472" />
                    <stop offset={0.89} stopColor="#545363" />
                    <stop offset={0.97} stopColor="#3e3d50" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_30"
                    x1={663.3}
                    y1={442.23}
                    x2={908.73}
                    y2={442.23}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.23} stopColor="#706f7c" />
                    <stop offset={0.59} stopColor="#575766" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_32"
                    x1={663.21}
                    y1={491.14}
                    x2={908.83}
                    y2={491.14}
                    gradientTransform="scale(1 -1)rotate(-89.64 289.46 -2.289)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.25} stopColor="#757581" />
                    <stop offset={0.49} stopColor="#6a6a77" />
                    <stop offset={0.72} stopColor="#575766" />
                    <stop offset={0.94} stopColor="#3d3c4e" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_35"
                    x1={663.3}
                    y1={658.14}
                    x2={908.73}
                    y2={658.14}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.23} stopColor="#706f7c" />
                    <stop offset={0.59} stopColor="#575766" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_37"
                    x1={663.2}
                    y1={717.83}
                    x2={908.83}
                    y2={717.83}
                    gradientTransform="scale(1 -1)rotate(-89.64 289.455 224.4)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.25} stopColor="#757581" />
                    <stop offset={0.49} stopColor="#6a6a77" />
                    <stop offset={0.72} stopColor="#575766" />
                    <stop offset={0.94} stopColor="#3d3c4e" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_39"
                    x1={663.18}
                    y1={724.85}
                    x2={906.26}
                    y2={724.85}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.23} stopColor="#706f7c" />
                    <stop offset={0.59} stopColor="#575766" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_41"
                    x1={1735.73}
                    y1={1075.42}
                    x2={1928.16}
                    y2={1075.42}
                    gradientTransform="matrix(1.25167 -.1446 -.43308 -.74522 -1036.25 1318.67)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.49} stopColor="#777783" />
                    <stop offset={0.66} stopColor="#70707d" />
                    <stop offset={0.79} stopColor="#646472" />
                    <stop offset={0.89} stopColor="#545363" />
                    <stop offset={0.97} stopColor="#3e3d50" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_43"
                    x1={663.22}
                    y1={724.88}
                    x2={906.21}
                    y2={724.88}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.23} stopColor="#706f7c" />
                    <stop offset={0.59} stopColor="#575766" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_45"
                    x1={662.82}
                    y1={733.81}
                    x2={906.62}
                    y2={733.81}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.49} stopColor="#777783" />
                    <stop offset={0.66} stopColor="#70707d" />
                    <stop offset={0.79} stopColor="#646472" />
                    <stop offset={0.89} stopColor="#545363" />
                    <stop offset={0.97} stopColor="#3e3d50" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_47"
                    x1={663.22}
                    y1={724.87}
                    x2={906.21}
                    y2={724.87}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.23} stopColor="#706f7c" />
                    <stop offset={0.59} stopColor="#575766" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_49"
                    x1={662.8}
                    y1={733.8}
                    x2={906.62}
                    y2={733.8}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.49} stopColor="#777783" />
                    <stop offset={0.66} stopColor="#70707d" />
                    <stop offset={0.79} stopColor="#646472" />
                    <stop offset={0.89} stopColor="#545363" />
                    <stop offset={0.97} stopColor="#3e3d50" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_51"
                    x1={663.23}
                    y1={724.87}
                    x2={906.21}
                    y2={724.87}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.23} stopColor="#706f7c" />
                    <stop offset={0.59} stopColor="#575766" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_53"
                    x1={662.81}
                    y1={733.8}
                    x2={906.63}
                    y2={733.8}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.49} stopColor="#777783" />
                    <stop offset={0.66} stopColor="#70707d" />
                    <stop offset={0.79} stopColor="#646472" />
                    <stop offset={0.89} stopColor="#545363" />
                    <stop offset={0.97} stopColor="#3e3d50" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_55"
                    x1={750.49}
                    y1={742.65}
                    x2={818.94}
                    y2={742.65}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.23} stopColor="#706f7c" />
                    <stop offset={0.59} stopColor="#575766" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_57"
                    x1={1812.3}
                    y1={1097.69}
                    x2={1867.12}
                    y2={1097.69}
                    gradientTransform="matrix(1.25256 -.13674 -.4284 -.74793 -1043.03 1307.18)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#797985" />
                    <stop offset={0.49} stopColor="#777783" />
                    <stop offset={0.66} stopColor="#70707d" />
                    <stop offset={0.79} stopColor="#646472" />
                    <stop offset={0.89} stopColor="#545363" />
                    <stop offset={0.97} stopColor="#3e3d50" />
                    <stop offset={1} stopColor="#363548" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_100"
                    x1={1143.4}
                    y1={463.72}
                    x2={1143.4}
                    y2={205}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#fbb03b" />
                    <stop offset={1} stopColor="#f05a24" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_101"
                    x1={1192.47}
                    y1={535.03}
                    x2={1192.47}
                    y2={316.12}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#5f2583" />
                    <stop offset={1} stopColor="#ed1e79" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_102"
                    x1={1144.26}
                    y1={810.37}
                    x2={1144.26}
                    y2={518.58}
                    gradientTransform="matrix(1 0 0 -1 0 986.87)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#5f2583" />
                    <stop offset={1} stopColor="#8e9aab" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_103"
                    x1={357.33}
                    y1={14.26}
                    x2={357.33}
                    y2={-132.48}
                    gradientTransform="matrix(-.86681 -.49864 .00241 1.455 1440.86 611.59)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#fbb03b" />
                    <stop offset={1} stopColor="#f05a24" />
                </linearGradient>
                <linearGradient
                    id="Degradado_sin_nombre_104"
                    x1={1270.11}
                    y1={-350.7}
                    x2={1270.11}
                    y2={-467.85}
                    gradientTransform="matrix(.86933 .23294 -.27718 -1.75142 -45.81 -650.06)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset={0} stopColor="#5f2583" />
                    <stop offset={1} stopColor="#ed1e79" />
                </linearGradient>
                <style>
                    {
                        ".cls-13{stroke-linecap:round;stroke-linejoin:round;fill:none}.cls-32{fill:#1967d2}.cls-32,.cls-33,.cls-40,.cls-44,.cls-45{stroke-width:0}.cls-33{fill:#006bff}.cls-13{stroke-width:7.11px}.cls-40{fill:#0ae8f0}.cls-13{stroke:#000c7e}.cls-44{fill:#fff}.cls-45{fill:#bcbcc2}"
                    }
                </style>
            </defs>
            <g
                style={{
                    isolation: "isolate",
                }}
            >
                <g id="Capa_1">
                    <path
                        d="M0 36.4v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 43.2v2.05l21.03 12.14L0 69.53v2.06l22.81-13.17 26.92 15.54L22.81 89.5 0 76.33v2.06l21.03 12.14L0 102.67v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 109.47v2.06l21.03 12.14L0 135.81v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 142.61v2.05l21.03 12.14L0 168.94V171l22.81-13.17 26.92 15.54-26.92 15.54L0 175.74v2.06l21.03 12.14L0 202.08v2.05l22.8-13.16 26.92 15.54-26.92 15.54L0 208.89v2.05l21.03 12.14L0 235.22v2.05l22.8-13.16 26.92 15.54-26.92 15.54L0 242.03v2.04l21.03 12.14L0 268.35v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 275.15v2.06l21.03 12.14L0 301.49v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 308.29v2.06l21.03 12.14L0 334.63v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 341.43v2.05l21.03 12.14L0 367.76v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 374.56v2.06l21.03 12.14L0 400.9v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 407.7v2.06l21.03 12.14L0 434.04v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 440.84v2.05l21.03 12.14L0 467.17v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 473.97v2.06l21.03 12.14L0 500.31v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 507.11v2.06l21.03 12.14L0 533.45v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 540.25v2.05l21.03 12.14L0 566.58v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 573.38v2.06l21.03 12.14L0 599.72v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 606.52v2.06l21.03 12.14L0 632.86v2.05l22.81-13.17 26.92 15.54-26.92 15.54L0 639.65v2.06l21.03 12.14L0 665.99v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 672.79v2.06l21.03 12.14L0 699.13v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 705.93v2.05l21.03 12.14L0 732.26v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 739.06v2.06l21.03 12.14L0 765.4v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 772.2v2.06l21.03 12.14L0 798.54v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 805.34v2.05l21.03 12.14L0 831.67v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 838.47v2.06l21.03 12.14L0 864.81v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 871.61v2.06l21.03 12.14L0 897.95v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 904.75v2.05l21.03 12.14L0 931.08v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 937.88v2.06l21.03 12.14L0 964.22v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 971.02v2.06l21.03 12.14L0 997.36v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 1004.16v2.05l21.03 12.14L0 1030.49v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 1037.29v2.06l21.03 12.14L0 1063.63v2.06l22.81-13.17 26.92 15.54-26.92 15.54L0 1070.43v2.06l21.03 12.14L0 1096.77v2.06l22.81-13.17 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.54l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54H455l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.57-.02l26.92-15.55 26.92 15.54h-.02l3.57.01 26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.54l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l26.92-15.54 26.92 15.54h3.55l16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.04l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.04l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.04l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.04l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.04l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.05l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.05l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.04l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.05l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39v-2.05l-16.22-9.36 16.22-9.36v-2.04l-17.99 10.39-26.92-15.54 26.92-15.54 17.99 10.39V150l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.05l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36 16.22-9.36v-2.06l-18 10.39-26.92-15.54 26.92-15.54 18 10.39v-2.06l-16.22-9.36L1616.11.4h-3.55l-11.54 6.66L1589.48.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L1558.72.4h-3.55l-11.54 6.66L1532.09.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L1501.33.4h-3.55l-11.54 6.66L1474.7.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L1443.94.4h-3.55l-11.54 6.66L1417.31.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L1386.55.4H1383l-11.54 6.66L1359.92.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L1329.16.4h-3.55l-11.54 6.66L1302.53.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L1271.77.4h-3.55l-11.54 6.66L1245.14.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L1214.38.4h-3.55l-11.54 6.66L1187.75.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L1156.99.4h-3.55l-11.54 6.66L1130.36.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L1099.61.4h-3.56l-11.54 6.66L1072.97.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L1042.22.4h-3.56l-11.54 6.66L1015.58.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L984.83.4h-3.56l-11.54 6.66L958.19.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L927.44.4h-3.56l-11.54 6.66L900.8.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L870.05.4h-3.56l-11.54 6.66L843.41.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L812.66.4h-3.56l-11.54 6.66L786.02.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L755.27.4h-3.56l-11.54 6.66L728.63.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L697.88.4h-3.56l-11.54 6.66L671.24.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L640.49.4h-3.56l-11.54 6.66L613.85.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L583.1.4h-3.56L568 7.06 556.46.4h-3.55l13.32 7.69-26.92 15.54-26.92-15.54L525.71.4h-3.55l-11.54 6.66L499.08.4h-3.56l13.32 7.69-26.92 15.54L455 8.09 468.32.4h-3.55l-11.54 6.66L441.69.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L410.93.4h-3.55l-11.54 6.66L384.3.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L353.54.4h-3.55l-11.54 6.66L326.91.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L296.15.4h-3.55l-11.54 6.66L269.52.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L238.76.4h-3.55l-11.54 6.66L212.13.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L181.37.4h-3.55l-11.54 6.66L154.74.4h-3.56l13.32 7.69-26.92 15.54-26.92-15.54L123.98.4h-3.55l-11.54 6.66L97.35.4h-3.56l13.32 7.69-26.92 15.54L53.27 8.09 66.59.4h-3.55L51.5 7.06 39.96 0h-3.55l13.32 7.69-26.92 15.54L0 10.06v2.06l21.03 12.14zm24.58 20.99L51.5 41.85l26.92 15.54L51.5 72.93zm484.26 513.62-26.92 15.54L455 571.01l26.92-15.54zm-25.14-16.57 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.57L568 538.9l26.92 15.54L568 569.98zm26.92 17.6 26.92 15.54L568 603.12l-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.57 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.57 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.57 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.56 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.56 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.56 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.56 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.56 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm28.69-16.56 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm-26.92-17.59 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm25.15 16.57-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 536.85l-26.92-15.54L568 505.77l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54L455 537.88l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm26.92 17.59-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zM455 604.15l26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54L568 636.26l-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm-1.78-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 503.71l-26.92-15.54L568 472.63l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54L455 504.74l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm1.78 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54L568 669.39l-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm-26.92-17.59 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm25.15 16.56-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 470.57l-26.92-15.54L568 439.49l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54L455 471.6l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm26.92 17.6-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm-26.92 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm26.91-17.59-26.92-15.54 26.92-15.54 26.92 15.54zm-26.91-48.68 26.92-15.54 26.92 15.54-26.92 15.54zm26.91-17.6-26.92-15.54 26.92-15.54 26.92 15.54zm-26.92-48.67 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm-1.77-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 437.44l-26.92-15.54L568 406.36l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03L483.7 421.9l26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 438.47l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm1.78 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm-26.92-17.6 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm25.14 16.57-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 404.3l-26.92-15.54L568 373.22l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 405.33l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm26.92 17.6-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm-26.92 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm26.92 48.67-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm-25.15-16.57 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm26.91-17.59-26.92-15.54 26.92-15.54 26.92 15.54zm-26.91-48.68 26.92-15.54 26.92 15.54-26.92 15.54zm26.91-17.6-26.92-15.54 26.92-15.54 26.92 15.54zm-26.92-48.67 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm-1.77-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 371.16l-26.92-15.54L568 340.08l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 372.19l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm1.78 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm-26.92-17.6 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm25.14 16.57-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03L596.7 354.6l-26.92-15.54 26.92-15.54zM568 338.03l-26.92-15.54L568 306.95l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54L455 339.06l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm26.92 17.59-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm-26.92 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm26.92 48.67-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm-25.14-16.56 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm.01-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm26.91-17.6-26.92-15.54 26.92-15.54 26.92 15.54zm-26.92-48.67 26.92-15.54 26.92 15.54-26.92 15.54zm26.92-17.6-26.92-15.54 26.92-15.54 26.92 15.54zm-26.92-48.68 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm-1.77-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 304.89l-26.92-15.54L568 273.81l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 305.92l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm-26.91 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm26.92 48.67-26.92 15.54-26.92-15.54 26.92-15.54zm-.01 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm-26.91 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm28.69 16.57 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm-26.92-17.59 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm25.14 16.57-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 271.75l-26.92-15.54L568 240.67l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 272.78l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm26.92 17.6-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm-25.14-16.57 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm-1.77-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 238.62l-26.92-15.54L568 207.54l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 239.65l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm-26.91 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm26.92 48.68-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm1.77 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm-26.92-17.6 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm25.14 16.57-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 205.48l-26.92-15.54L568 174.4l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 206.51l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm26.92 17.6-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm-25.14-16.57 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm-1.77-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03L483.7 156.8l26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 173.37l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm-26.91 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm26.91 48.68-26.92 15.54-26.92-15.54 26.92-15.54zm-26.91 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm26.92 48.68-26.92 15.54-26.92-15.54 26.92-15.54zm-.01 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm-26.91 17.59 26.92 15.54-26.92 15.54-26.92-15.54zm26.92 48.68-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm1.77 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm-26.92-17.6 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm25.14 16.57-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 140.24l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm26.92 17.59-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm-25.14-16.56 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm-1.77-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zM568 106.07l-26.92-15.54L568 74.99l26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03L483.7 90.53l26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54L455 107.1l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03L81.97 90.53l26.92-15.54 26.92 15.54zm-1.77 1.03L80.2 122.64 53.28 107.1 80.2 91.56zm0 33.14L80.2 155.78l-26.92-15.54L80.2 124.7zm-.01 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm-26.91 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm26.91 48.67-26.92 15.54-26.92-15.54 26.92-15.54zm-26.91 17.6 26.92 15.54-26.92 15.54-26.92-15.54zm26.92 48.68L80.2 354.6l-26.92-15.54 26.92-15.54zm0 33.13L80.2 387.73l-26.92-15.54 26.92-15.54zm0 33.14L80.2 420.87l-26.92-15.54 26.92-15.54zm0 33.14L80.2 454.01l-26.92-15.54 26.92-15.54zm0 33.13L80.2 487.14 53.28 471.6l26.92-15.54zm0 33.14L80.2 520.28l-26.92-15.54L80.2 489.2zm0 33.14L80.2 553.42l-26.92-15.54 26.92-15.54zm0 33.13L80.2 586.55l-26.92-15.54 26.92-15.54zm0 33.14L80.2 619.69l-26.92-15.54 26.92-15.54zM80.2 621.74l26.92 15.54-26.92 15.54-26.92-15.54zm26.92 48.68L80.2 685.96l-26.92-15.54 26.92-15.54zm0 33.14L80.2 719.1l-26.92-15.54 26.92-15.54zm0 33.13L80.2 752.23l-26.92-15.54 26.92-15.54zm0 33.14L80.2 785.37l-26.92-15.54 26.92-15.54zm0 33.14L80.2 818.51l-26.92-15.54 26.92-15.54zm0 33.13L80.2 851.64 53.28 836.1l26.92-15.54zm0 33.14L80.2 884.78l-26.92-15.54L80.2 853.7zm0 33.14L80.2 917.92l-26.92-15.54 26.92-15.54zm0 33.13L80.2 951.05l-26.92-15.54 26.92-15.54zm0 33.14L80.2 984.19l-26.92-15.54 26.92-15.54zm0 33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0 33.13-26.92 15.54-26.92-15.54 26.92-15.54zm1.77 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.78-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.02 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.02 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm1.77-1.03 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 1.03 26.92 15.54-26.92 15.54-26.92-15.54zm-26.92-17.59 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm26.91-17.59-26.92-15.54 26.92-15.54 26.92 15.54zm-26.92-48.68 26.92-15.54 26.92 15.54-26.92 15.54zm.01-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0-33.13 26.92-15.54 26.92 15.54-26.92 15.54zm25.14 16.57-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.02-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-1.02-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03L1000.2 57.4l26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03L942.81 57.4l26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03L885.42 57.4l26.92-15.54 26.92 15.54zm-1.77 1.03-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-1.03L828.03 57.4l26.92-15.54 26.92 15.54zm-1.77 1.02L826.26 89.5l-26.92-15.54 26.92-15.54zm-55.62-1.02L770.64 57.4l26.92-15.54 26.92 15.54zm-1.77 1.02L768.87 89.5l-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03L711.48 89.5l-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03L654.09 89.5l-26.92-15.54 26.92-15.54zm-55.62-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.77 1.03L596.7 89.5l-26.92-15.54 26.92-15.54zM568 72.93l-26.92-15.54L568 41.85l26.92 15.54zm-1.77 1.03L539.31 89.5l-26.92-15.54 26.92-15.54zm-55.61-1.03L483.7 57.39l26.92-15.54 26.92 15.54zm-1.78 1.03L481.92 89.5 455 73.96l26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03L424.53 89.5l-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03L367.14 89.5l-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03L309.75 89.5l-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03L252.36 89.5l-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03L194.97 89.5l-26.92-15.54 26.92-15.54zm-55.61-1.03-26.92-15.54 26.92-15.54 26.92 15.54zm-1.78 1.03L137.58 89.5l-26.92-15.54 26.92-15.54zm-55.61-1.03L81.97 57.39l26.92-15.54 26.92 15.54zm-1.77 1.03L80.2 89.5 53.28 73.96 80.2 58.42zM24.58 90.53 51.5 74.99l26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14L51.5 174.4l26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54L51.5 404.3zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13L51.5 538.9l26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54L51.5 768.8zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13L51.5 903.4l26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.13 26.92-15.54 26.92 15.54-26.92 15.54zm0 33.14 26.92-15.54 26.92 15.54-26.92 15.54zm26.92 48.68-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm28.7-16.57-26.92-15.54 26.92-15.54 26.92 15.54zm28.69 16.57-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.78-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.61 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm28.69-16.57-26.92-15.54 26.92-15.54 26.92 15.54zm28.7 16.57-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm1.77-32.11 26.92-15.54 26.92 15.54-26.92 15.54zm55.62 32.11-26.92-15.54 26.92-15.54 26.92 15.54zm55.61-32.11-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.13-26.92 15.54-26.92-15.54 26.92-15.54zm0-33.14-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-32.11 26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-32.11 26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-32.11 26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-32.11 26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-32.11 26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-32.11 26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zm-55.61-32.11 26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM1141.9 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-32.11 26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zm-55.62-32.11 26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM969.73 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM912.34 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM854.95 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM797.56 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM740.17 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM682.78 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM625.39 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.77 32.11L596.7 56.37l-26.92-15.54 26.92-15.54zM568 8.72l26.92 15.54L568 39.8l-26.92-15.54zm-1.77 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM510.62 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54L455 40.83l26.92-15.54zM453.23 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM395.84 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM338.45 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM281.06 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM223.67 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM166.28 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11-26.92 15.54-26.92-15.54 26.92-15.54zM108.89 8.72l26.92 15.54-26.92 15.54-26.92-15.54zm-1.78 32.11L80.19 56.37 53.27 40.83l26.92-15.54zM51.5 8.72l26.92 15.54L51.5 39.8 24.58 24.26z"
                        style={{
                            strokeWidth: 0,
                            fill: "url(#Degradado_sin_nombre)",
                            overflow: "visible",
                        }}
                    />
                    <g id="BaseCompleta">
                        <g id="Circuitos">
                            <g id="CirGoogle">
                                <path
                                    d="M439.54 454.26c74.48 43 148.96 86.01 223.44 129.01"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_2)",
                                        filter: "url(#blueGlow)",
                                    }}
                                />
                                <path
                                    d="M460 446.14c16.55 9.55 33.09 19.11 49.64 28.66 19.72.34 39.44.68 59.17 1.03 30.14 17.4 60.29 34.81 90.43 52.21"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_3)",
                                    }}
                                />
                                <path
                                    d="M415.86 459.68c37.67 22.43 75.33 44.87 113 67.3v31.08l105.42 60.87"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_4)",
                                    }}
                                />
                                <path
                                    d="M430.65 459.59c74.48 43 148.96 86.01 223.44 129.01"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        stroke: "url(#Degradado_sin_nombre_5)",
                                        strokeWidth: "7.11px",
                                    }}
                                />
                                <path
                                    d="M451.11 451.48c16.55 9.55 33.09 19.11 49.64 28.66 19.72.34 39.44.68 59.17 1.03 30.14 17.4 60.29 34.81 90.43 52.21"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "7.11px",
                                        stroke: "url(#Degradado_sin_nombre_6)",
                                    }}
                                />
                                <path
                                    d="M406.98 465.01c37.67 22.43 75.33 44.87 113 67.3v31.08l105.42 60.87"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "7.11px",
                                        stroke: "url(#Degradado_sin_nombre_7)",
                                    }}
                                />
                            </g>
                            <g id="CirOpenChat">
                                <path
                                    d="M1144.12 447.65c-17.5 10.1-35 20.21-52.5 30.31.59 10.7 1.18 21.41 1.78 32.11-29.29 16.23-58.57 32.45-87.86 48.68l-52.4 2.88c-12.85 7.32-25.71 14.64-38.56 21.96"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_8)",
                                        filter: "url(#blueGlow)",
                                    }}
                                />
                                <path
                                    d="M1123 441.27c-23.67 13.67-47.33 27.33-71 41v33.14c-24.08 13.9-48.16 27.81-72.24 41.71"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_9)",
                                    }}
                                />
                                <path
                                    d="M1001.31 588.92c36.11-20.17 72.23-40.33 108.34-60.5-.59-11.39-1.18-22.77-1.78-34.16 18.54-10.7 37.08-21.41 55.61-32.11"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_10)",
                                    }}
                                />
                                <path
                                    d="M1135.24 442.31c-17.5 10.1-35 20.21-52.5 30.31.59 10.7 1.18 21.41 1.78 32.11-29.29 16.23-58.57 32.45-87.86 48.68l-52.4 2.88c-12.85 7.32-25.71 14.64-38.56 21.96"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "7.11px",
                                        stroke: "url(#Degradado_sin_nombre_11)",
                                    }}
                                />
                                <path
                                    d="M1114.12 435.94c-23.67 13.67-47.33 27.33-71 41v33.14c-24.08 13.9-48.16 27.81-72.24 41.71"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "7.11px",
                                        stroke: "url(#Degradado_sin_nombre_12)",
                                    }}
                                />
                                <path
                                    d="M992.43 583.59c36.11-20.17 72.23-40.33 108.34-60.5-.59-11.39-1.18-22.77-1.78-34.16 18.54-10.7 37.08-21.41 55.61-32.11"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "7.11px",
                                        stroke: "url(#Degradado_sin_nombre_13)",
                                    }}
                                />
                            </g>
                        </g>
                        <g id="BaseTriangulo">
                            <g id="LineasBase">
                                <path
                                    id="path1"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        stroke: "#34aadc",
                                        strokeWidth: "5.33px",
                                        opacity: 0,
                                    }}
                                    d="m1061.32 667.09-491 76.91 133.22-283.48z"
                                />
                                <path
                                    id="path2"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "#34aadc",
                                        opacity: 0,
                                    }}
                                    d="m1061.32 675.97-491 76.91 133.22-283.47z"
                                />
                                <path
                                    id="path3"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        stroke: "#34aadc",
                                        strokeWidth: "2.67px",
                                        opacity: 0,
                                    }}
                                    d="m1061.32 684.86-491 76.91 133.22-283.48z"
                                />
                                <path
                                    id="path4"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        stroke: "#34aadc",
                                        strokeWidth: "1.78px",
                                        opacity: 0,
                                    }}
                                    d="m1061.32 695.52-491 76.91 133.22-283.47z"
                                />
                                <path
                                    id="path5"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "1.33px",
                                        stroke: "#34aadc",
                                        opacity: 0,
                                    }}
                                    d="m1061.32 707.96-491 76.92L703.54 501.4z"
                                />
                                <path
                                    id="path6"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        stroke: "#34aadc",
                                        strokeWidth: ".89px",
                                        opacity: 0,
                                    }}
                                    d="m1061.32 723.96-491 76.91 133.22-283.48z"
                                />
                            </g>
                            <g id="Base">
                                <path
                                    d="M570.32 672.91v63.98c163.67-25.64 327.33-51.28 491-76.91V596c-163.67 25.64-327.33 51.28-491 76.91Z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        strokeWidth: "2.37px",
                                        fill: "url(#Degradado_sin_nombre_106)",
                                        stroke: "url(#Degradado_sin_nombre_15)",
                                    }}
                                />
                                <path
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "url(#Degradado_sin_nombre_16)",
                                        stroke: "url(#Degradado_sin_nombre_17)",
                                        strokeWidth: "2.37px",
                                    }}
                                    d="m1061.32 595.99-491 76.92 133.22-283.48z"
                                />
                            </g>
                        </g>
                        <g id="CirCalendly">
                            <path
                                d="M893.41 867.93c-23.84-57.54-47.69-115.08-71.53-172.61v-63.8c-4.34-6.81-8.68-13.61-13.02-20.42"
                                style={{
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    fill: "none",
                                    strokeWidth: "3.55px",
                                    stroke: "url(#Degradado_sin_nombre_18)",
                                    filter: "url(#blueGlow)",
                                }}
                            />
                            <path
                                d="M902.49 855.89c-12.29-29.87-24.58-59.74-36.88-89.62 7.08-11.05 14.17-22.1 21.25-33.15-7.21-14.87-14.42-29.73-21.62-44.6v-63.85c-6.07-6.56-12.14-13.12-18.2-19.68"
                                style={{
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    fill: "none",
                                    strokeWidth: "3.55px",
                                    stroke: "url(#Degradado_sin_nombre_19)",
                                }}
                            />
                            <path
                                d="M874.05 863.77c-7.65-18.66-15.3-37.31-22.95-55.97-14.88-3.14-29.76-6.27-44.65-9.41-6.27-17.79-12.55-35.57-18.82-53.36l27.36-17.85L804.67 700v-66.27c-6.17-7.48-12.35-14.96-18.52-22.44"
                                style={{
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    fill: "none",
                                    strokeWidth: "3.55px",
                                    stroke: "url(#Degradado_sin_nombre_20)",
                                }}
                            />
                            <path
                                d="M884.52 871.49c-23.84-57.54-47.69-115.08-71.53-172.61v-63.8c-4.34-6.81-8.68-13.61-13.02-20.42"
                                style={{
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    fill: "none",
                                    strokeWidth: "7.11px",
                                    stroke: "url(#Degradado_sin_nombre_21)",
                                }}
                            />
                            <path
                                d="m893.61 859.45-36.88-89.62c7.08-11.05 14.17-22.1 21.25-33.15-7.21-14.87-14.42-29.73-21.62-44.6v-63.85c-6.07-6.56-12.14-13.12-18.2-19.68"
                                style={{
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    fill: "none",
                                    strokeWidth: "7.11px",
                                    stroke: "url(#Degradado_sin_nombre_22)",
                                }}
                            />
                            <path
                                d="M865.16 867.32c-7.65-18.66-15.3-37.31-22.95-55.97-14.88-3.14-29.76-6.27-44.65-9.41-6.27-17.79-12.55-35.57-18.82-53.36l27.36-17.85-10.32-27.18v-66.27c-6.17-7.48-12.35-14.96-18.52-22.44"
                                style={{
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    fill: "none",
                                    strokeWidth: "7.11px",
                                    stroke: "url(#Degradado_sin_nombre_23)",
                                }}
                            />
                        </g>
                        <g id="CircuitosBase">
                            <g id="CirBGoogle">
                                <path
                                    d="M629 549.28c14.23 7.03 28.47 14.07 42.7 21.1"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_24)",
                                        filter: "url(#blueGlow)",
                                    }}
                                />
                                <path
                                    d="M638.26 525.9c14.23 7.03 28.47 14.07 42.7 21.1"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_25)",
                                    }}
                                />
                                <path
                                    d="M650.35 500.61c14.23 7.03 28.47 14.07 42.7 21.1"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_26)",
                                    }}
                                />
                                <path
                                    className="cls-13"
                                    d="M632.37 540.87c14.23 7.03 28.47 14.07 42.7 21.1m-33.44-44.47c14.23 7.03 28.47 14.07 42.7 21.1m-30.61-46.4c14.23 7.03 28.47 14.07 42.7 21.1"
                                />
                            </g>
                            <g id="CirBOpenChat">
                                <path
                                    d="M932.64 520.28c-10.96 7.24-21.92 14.49-32.87 21.73"
                                    style={{
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                        stroke: "url(#Degradado_sin_nombre_27)",
                                        filter: "url(#blueGlow)",
                                    }}
                                />
                                <path
                                    d="M913.35 508.53c-10.96 7.24-21.92 14.49-32.87 21.73"
                                    style={{
                                        stroke: "url(#Degradado_sin_nombre_28)",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        fill: "none",
                                        strokeWidth: "3.55px",
                                    }}
                                />
                                <path
                                    className="cls-13"
                                    d="M937.39 524.44c-10.96 7.24-21.92 14.49-32.87 21.73m17.61-32.59c-10.96 7.24-21.92 14.49-32.87 21.73"
                                />
                            </g>
                        </g>
                    </g>
                    <g id="Canister">
                        <g id="CanisterBot">
                            <path
                                d="M907.98 544.27h.01v-48.52h-34.83c-.41-.24-.79-.49-1.2-.73-47.82-27.61-125.06-27.77-172.53-.36-.62.36-1.2.73-1.8 1.09h-33.4v44.42c-1.88 19.4 10.05 39.22 35.83 54.1 47.82 27.61 125.06 27.77 172.53.36 24.01-13.86 35.78-32.12 35.39-50.36Z"
                                style={{
                                    strokeMiterlimit: 10,
                                    strokeWidth: "1.48px",
                                    fill: "url(#Degradado_sin_nombre_29)",
                                    stroke: "url(#Degradado_sin_nombre_30)",
                                }}
                            />
                            <ellipse
                                cx={786}
                                cy={495.74}
                                rx={70.43}
                                ry={122}
                                transform="rotate(-89.64 786 495.74)"
                                style={{
                                    fill: "url(#Degradado_sin_nombre_31)",
                                    stroke: "url(#Degradado_sin_nombre_32)",
                                    strokeMiterlimit: 10,
                                    strokeWidth: "1.63px",
                                }}
                            />
                        </g>
                        <ellipse
                            id="SombraKonecta"
                            cx={788.67}
                            cy={501.02}
                            rx={130.58}
                            ry={55.51}
                            style={{
                                strokeWidth: 0,
                                fill: "url(#Degradado_sin_nombre_157)",
                                mixBlendMode: "multiply",
                            }}
                        />
                        <g id="KonectaIcon">
                            <path
                                className="cls-45"
                                d="M788.39 475.82h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 476.45h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 477.08h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67V458c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 477.71h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 478.34h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 478.97h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 479.6h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 480.23h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 480.86h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 481.49h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 482.12h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 482.75h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 483.38h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 484.01h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 484.64h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 485.27h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 485.9h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 486.53h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 487.16h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 487.79h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 488.42h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-45"
                                d="M788.39 489.05h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm81.2-34.23c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-120.6-37.07h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                            <path
                                className="cls-44"
                                d="M869.59 454.82c6.26 2.26 6.41 2.48 6.55 8.67v6.48c.07 3.2.22 6.34-2.91 8.67-1.17.87-1.6 2.99-2.04 4.59-4.08 15.08-19.66 29.64-39.47 29.49-29.64-.22-59.35.07-88.99-.07-18.43-.07-33.57-11.43-39.18-28.98-.8-2.48-1.53-4.73-3.5-6.7-1.17-1.17-1.46-3.5-1.68-5.32-.29-2.55-.15-5.17-.07-7.72.15-6.48.51-6.92 6.85-9.25 5.46-11.22 13.98-19.37 26.36-22.72 4.73-1.24 9.69-1.89 14.64-1.89 27.31-.15 54.62 0 81.93-.15 18.57-.07 32.55 7.65 41.51 24.91Zm-81.2 34.23h13.55c6.26 0 12.45.15 18.72-.07 7.28-.22 13.33-4.88 15.44-11.58 2.33-7.14.07-14.42-5.83-19.01-3.57-2.77-7.72-3.71-12.09-3.71-6.63-.07-13.33 0-20.03 0h-39.98c-6.04 0-11.58 1.6-15.44 6.55-4.44 5.53-4.95 11.87-2.11 18.21 2.77 6.19 8.08 9.47 14.86 9.61 11 .15 21.92 0 32.92 0zm-39.4-71.3h-12.6c-.95-7.72 2.33-13.55 7.21-18.57 4.3-4.44 9.76-7.14 16.09-7.21 18.28-.15 36.56-.22 54.84 0 12.6.15 24.4 12.45 23.45 25.71-1.97.07-4.01.22-6.12.29s-4.3 0-6.26 0c-.51-.58-.95-.87-1.09-1.24-3.13-8.96-5.97-11.07-15.58-11.14h-14.42c-.15 2.62-.22 4.52-.36 6.34a258 258 0 0 0-.44 5.53h-13.25c-.22-3.79-.44-7.57-.66-11.8-6.48 0-12.74-.29-18.86.07-4.81.29-8.38 3.06-10.34 7.65-.51 1.53-1.02 2.91-1.6 4.37z"
                            />
                        </g>
                        <path
                            d="M896.91 493.43V271.28H675.12v222.24c.2 16.31 11.13 32.62 32.76 45.11 43.47 25.1 113.69 25.24 156.85.33 21.72-12.54 32.43-29.04 32.18-45.53"
                            style={{
                                strokeWidth: 0,
                                fill: "url(#Degradado_sin_nombre_33)",
                                mixBlendMode: "color",
                            }}
                            id="CanisterCuerpo"
                        />
                        <path
                            id="CanisterBrillo"
                            d="M896.91 493.43V271.28H675.12v222.24c.2 16.31 11.13 32.62 32.76 45.11 43.47 25.1 113.69 25.24 156.85.33 21.72-12.54 32.43-29.04 32.18-45.53Z"
                            style={{
                                isolation: "isolate",
                                strokeMiterlimit: 10,
                                strokeWidth: "1.48px",
                                fill: "#bcbcc2",
                                opacity: 0.3,
                                stroke: "#f2f2f2",
                            }}
                        />
                        <g id="CanisterSup">
                            <g id="TapaSuperior">
                                <path
                                    d="M907.98 317.58h.01v-48.52H664.23v44.42c-1.88 19.4 10.05 39.22 35.83 54.1 47.82 27.61 125.06 27.77 172.53.36 24.01-13.86 35.78-32.12 35.39-50.36Z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        fill: "url(#Degradado_sin_nombre_34)",
                                        stroke: "url(#Degradado_sin_nombre_35)",
                                        strokeWidth: "1.48px",
                                    }}
                                />
                                <ellipse
                                    cx={785.99}
                                    cy={269.05}
                                    rx={70.43}
                                    ry={122}
                                    transform="rotate(-89.64 785.995 269.051)"
                                    style={{
                                        strokeMiterlimit: 10,
                                        strokeWidth: "1.63px",
                                        fill: "url(#Degradado_sin_nombre_36)",
                                        stroke: "url(#Degradado_sin_nombre_37)",
                                    }}
                                />
                            </g>
                            <g
                                id="Engranaje1"
                                style={{
                                    opacity: 1,
                                    animation: "switchEngranajes 1s steps(1) infinite",
                                    animationDelay: "0s",
                                }}
                            >
                                <path
                                    d="m895.05 223.03-19.36 3.03c-3.42-3.89-7.55-7.48-12.26-10.76l.02-.02-.09-.03-.42-.3.52-.51-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-36.96-12.27-10.08 10.04c-11.57-2.15-23.92-3.11-36.49-2.71l-5.11-11.16-41.35 6.48.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.04.09c-9.15 3.1-17.29 6.95-24.22 11.38l-17.32-5.75-21.52 21.43.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63 12.34 4.1c-.06.88-.08 1.76-.07 2.64v1.7c0 .22-.01.43 0 .65l-19.26 3.02.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06 10.92 23.83 19.37-3.03c3.41 3.89 7.55 7.48 12.25 10.75l-.02.02.11.04c.14.1.27.2.41.29l-.52.52.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63.64.21-.64.63 36.96 12.27 10.08-10.04c11.57 2.14 23.92 3.11 36.49 2.7l5.11 11.16 41.35-6.48-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.04-.09c9.15-3.1 17.29-6.95 24.22-11.38l17.32 5.75 21.52-21.43-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-.64-.21.64-.63-12.33-4.09c.06-.88.08-1.76.07-2.65v-1.7c0-.22.01-.43 0-.65l19.25-3.02-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-10.92-23.83h-.01Zm-144.34 34.04c0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85-.01.3-.01.59 0 .89-.03 1.1.07 2.21.37 3.32.09.31.19.63.3.94-6.56-3.32-11.65-7.67-14.49-12.77 2.76-4.92 7.77-9.37 14.49-12.84-.5 1.41-.73 2.87-.68 4.34-.01.3-.01.59 0 .89 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85 0 .28-.01.56 0 .85v-.07Zm-21.5-9.72c-.74 2.28-1.07 4.62-.94 6.98 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85 0 .28-.02.56 0 .85.02 1.91.3 3.84.93 5.77-.88-.68-1.75-1.37-2.55-2.09-3.84-3.42-6.82-7.24-8.72-11.4-.2-.43-.38-.87-.55-1.3 2.14-5.39 6.19-10.46 11.83-14.89zm60.58 16.8c-6.39 1-12.86.08-17.62-2.14 2.13-1.01 4.64-1.79 7.48-2.24 6.38-1 12.85-.08 17.62 2.14-2.13 1.01-4.64 1.79-7.47 2.24zm28.92 2.71c0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.29.01-.57 0-.86.04-1.11-.07-2.22-.37-3.34-.09-.31-.19-.62-.3-.94 6.56 3.32 11.65 7.67 14.49 12.77-2.76 4.92-7.77 9.36-14.49 12.84.51-1.42.73-2.89.67-4.37q.015-.435 0-.87c0-.28.01-.56 0-.85 0-.28.01-.56 0-.85 0-.28.01-.56 0-.85zm21.5 9.72c.74-2.28 1.07-4.62.94-6.98 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85 0-.28.02-.56 0-.85-.02-1.91-.3-3.84-.93-5.77.88.68 1.75 1.37 2.55 2.09 3.84 3.42 6.82 7.24 8.73 11.41.2.43.37.86.55 1.3-2.14 5.39-6.19 10.46-11.83 14.89v.06Z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        fill: "url(#Degradado_sin_nombre_38)",
                                        stroke: "url(#Degradado_sin_nombre_39)",
                                        strokeWidth: ".39px",
                                    }}
                                />
                                <path
                                    d="m905.97 246.85-10.92-23.83-19.36 3.03c-5.68-6.46-13.3-12.12-22.32-16.82l10.08-10.04-36.96-12.27-10.08 10.04c-11.57-2.15-23.92-3.11-36.49-2.71l-5.11-11.16-41.35 6.48 5.11 11.16c-11.24 3.32-21.11 7.76-29.29 13l-17.32-5.75-21.52 21.43 17.32 5.75c-3.79 6.7-5.54 13.83-4.94 21.09l-19.37 3.03 10.92 23.83 19.37-3.03c5.67 6.46 13.3 12.12 22.31 16.82l-10.08 10.04 36.96 12.27 10.08-10.04c11.57 2.14 23.92 3.11 36.49 2.7l5.11 11.16 41.35-6.48-5.11-11.16c11.24-3.32 21.11-7.76 29.29-13l17.32 5.75 21.52-21.43-17.32-5.75c3.8-6.7 5.56-13.84 4.95-21.09l19.36-3.03Zm-126.33-4.84c10.6-1.66 21.49 1.95 24.29 8.07 2.8 6.11-3.54 12.42-14.14 14.08-10.61 1.66-21.5-1.95-24.3-8.06-2.8-6.12 3.53-12.43 14.15-14.09Zm-26.72 18.19c2.4 3.63 6.52 6.64 11.69 8.8 1.92.81 4 1.5 6.17 2.05l4.86 10.61c-18.54-1.89-34.38-9.76-39.51-20.96s1.86-22.65 16.29-29.7l4.86 10.61c-1.41 1.12-2.62 2.32-3.59 3.58-2.63 3.38-3.64 7.19-2.61 11.04.19.68.43 1.35.74 2.03s.68 1.33 1.09 1.97v-.03Zm63.58-14.24c-2.4-3.63-6.53-6.63-11.69-8.8-1.91-.81-3.99-1.49-6.17-2.05l-4.86-10.61c18.54 1.89 34.38 9.76 39.51 20.96s-1.86 22.65-16.29 29.7l-4.86-10.61c1.42-1.11 2.63-2.32 3.59-3.58 2.64-3.38 3.64-7.19 2.61-11.04-.18-.67-.43-1.35-.74-2.02s-.68-1.33-1.1-1.97zm-46.36 46.17c-14.26-1.72-27.24-6.03-36.96-12.27-2.39-1.53-4.57-3.17-6.53-4.92-3.84-3.42-6.82-7.24-8.72-11.4s-2.6-8.35-2.2-12.43c.2-2.09.69-4.15 1.45-6.17 3.09-8.24 10.64-15.77 21.52-21.43 2.66-1.39 5.52-2.66 8.56-3.81l3.43 7.49c-17.74 7.81-26.6 21.27-20.57 34.43 6.03 13.15 25.21 22.22 47.26 23.8l3.43 7.49c-3.61-.1-7.18-.37-10.67-.79Zm83.55-37.09c-.2 2.09-.69 4.15-1.45 6.17-3.09 8.24-10.64 15.77-21.52 21.43a78 78 0 0 1-8.56 3.81l-3.43-7.49c17.74-7.81 26.6-21.27 20.57-34.43-6.03-13.15-25.21-22.22-47.26-23.8l-3.43-7.49c3.61.1 7.18.37 10.67.79 14.26 1.72 27.24 6.03 36.96 12.27 2.39 1.53 4.57 3.17 6.53 4.92 3.84 3.42 6.82 7.24 8.73 11.41 1.9 4.16 2.6 8.34 2.19 12.42Z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        fill: "url(#Degradado_sin_nombre_44)",
                                        stroke: "url(#Degradado_sin_nombre_41)",
                                        strokeWidth: ".99px",
                                    }}
                                />
                            </g>
                            <g
                                id="Engranaje2"
                                style={{
                                    opacity: 0,
                                    animation: "switchEngranajes 1s steps(1) infinite",
                                    animationDelay: "0.25s",
                                }}
                            >
                                <path
                                    d="m905.57 246.9.36-.06-10.91-23.82-19.37 3.03c-3.46-3.94-7.72-7.67-12.73-11.11l.48-.48-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-36.95-12.26-10.08 10.03c-11.95-2.22-24.31-3.09-36.48-2.7l-5.11-11.16-41.33 6.47.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.03.07c-8.88 3.01-17.07 6.81-24.19 11.36l-17.31-5.74-21.51 21.42.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64 12.36 4.1c-.05.88-.08 1.76-.06 2.63v1.7c0 .2-.01.4-.01.6l-19.26 3.02.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06 10.91 23.82 19.37-3.03c3.46 3.94 7.72 7.67 12.73 11.1l-.49.48.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64 36.95 12.26 10.08-10.03c11.95 2.22 24.31 3.09 36.48 2.7l5.11 11.16 41.33-6.47-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.03-.07c8.89-3.01 17.09-6.81 24.2-11.36l17.3 5.74 21.51-21.42-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-12.36-4.1c.05-.88.07-1.75.06-2.62v-1.7c0-.2.01-.41.01-.61l19.25-3.02-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79h.02Zm-154.86 15.49-7.35 7.32c-2.81-2.34-4.96-4.9-6.46-7.59 1.09-1.93 2.53-3.83 4.37-5.66 2.77-2.76 6.21-5.14 10.12-7.15-.11.31-.21.63-.29.95-.09.36-.16.71-.22 1.07-.05.3-.1.61-.12.91-.03.3-.03.6-.03.9 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .14-.01.27-.02.41 0 .15 0 .29.01.44 0 .11-.01.23-.01.34zm-21.48-14.99c-.66 2.09-.98 4.19-.94 6.28v17c-.05 2.15.28 4.28.96 6.38-.88-.69-1.75-1.38-2.55-2.09-4.38-3.91-7.5-8.22-9.28-12.72 1.52-3.81 4.03-7.57 7.62-11.14 1.29-1.29 2.73-2.5 4.22-3.67zm89.45 14.15 7.35-7.32c2.81 2.34 4.96 4.9 6.46 7.59-1.09 1.93-2.53 3.83-4.37 5.66-2.77 2.76-6.21 5.14-10.12 7.15.09-.26.17-.51.24-.77.13-.47.23-.93.3-1.4.04-.24.08-.48.1-.72.03-.33.04-.66.04-.99 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.14.02-.27.02-.41 0-.15 0-.29-.01-.44 0-.09 0-.19.01-.28zm21.49 14.99c.66-2.09.98-4.19.94-6.28v-17c.05-2.15-.28-4.28-.96-6.38.88.69 1.75 1.38 2.55 2.09 4.38 3.91 7.5 8.22 9.28 12.72-1.52 3.81-4.03 7.57-7.62 11.14-1.29 1.29-2.72 2.49-4.21 3.67z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        strokeWidth: ".39px",
                                        fill: "url(#Degradado_sin_nombre_42)",
                                        stroke: "url(#Degradado_sin_nombre_43)",
                                    }}
                                />
                                <path
                                    d="m886.57 249.88 19.37-3.03-10.91-23.82-19.37 3.03c-5.49-6.25-12.97-11.98-22.29-16.82l10.07-10.03-36.95-12.26-10.08 10.03c-11.95-2.22-24.31-3.09-36.48-2.7l-5.11-11.16-41.33 6.47 5.11 11.16c-10.87 3.22-20.82 7.58-29.29 13L692 208.01l-21.51 21.42 17.31 5.74c-3.93 6.91-5.51 14.06-4.93 21.08l-19.37 3.03 10.91 23.82 19.37-3.03c5.5 6.25 12.98 11.97 22.3 16.81L706 306.91l36.95 12.26 10.08-10.03c11.95 2.22 24.31 3.09 36.48 2.7l5.11 11.16 41.33-6.47-5.11-11.16c10.88-3.22 20.85-7.58 29.3-12.99l17.3 5.74 21.51-21.42-17.3-5.74c3.92-6.92 5.51-14.06 4.93-21.08zm-58.45 17.6c-10.11 10.07-29.03 15.37-47.8 14.5l9.57-9.53c3.07-.29 6.06-.82 8.9-1.58l.24-.06c.51-.14 1.01-.29 1.5-.44.36-.11.73-.22 1.08-.34.45-.15.89-.3 1.33-.46s.88-.34 1.31-.52c.51-.21 1.01-.42 1.5-.65.53-.25 1.06-.5 1.57-.76.32-.17.63-.34.94-.51.42-.23.83-.48 1.23-.72.29-.18.58-.36.85-.54.55-.37 1.07-.74 1.58-1.14.78-.6 1.51-1.23 2.18-1.89.08-.08.14-.16.22-.24.42-.44.82-.88 1.18-1.32.13-.16.25-.31.37-.47.34-.44.64-.89.92-1.34.15-.24.27-.48.4-.72.16-.31.32-.62.45-.93q.18-.39.33-.78c.12-.32.21-.64.3-.96.13-.47.23-.93.3-1.4.04-.24.08-.48.1-.72.03-.33.04-.66.04-.99 0-.2 0-.39-.02-.58-.05-1.04-.24-2.08-.58-3.1-.09-.29-.2-.58-.32-.87-.14-.33-.29-.65-.45-.97-.13-.26-.28-.52-.43-.78-.13-.23-.26-.46-.41-.68l9.57-9.53c10.69 8.91 12.17 20.98 2.06 31.05v-.03Zm-94.93 12.36c-2.41-1.55-4.59-3.19-6.52-4.92-7.9-7.04-11.73-15.41-10.91-23.82.19-2.06.67-4.12 1.44-6.16 1.49-4 4.08-7.94 7.84-11.68s8.4-7 13.68-9.75c2.7-1.4 5.56-2.67 8.57-3.8 12.26-4.61 26.77-6.88 41.33-6.47 3.57.1 7.13.36 10.67.79l-6.76 6.73c-22.02-1.68-44.71 4.29-56.59 16.12s-9.52 26.11 4.02 36.23l-6.76 6.73Zm8.11-41.18c10.11-10.07 29.03-15.37 47.8-14.5l-9.57 9.53c-3.75.35-7.38 1.07-10.75 2.11-.3.09-.6.19-.89.28-.5.17-.99.34-1.48.52-.35.13-.69.27-1.03.41-.67.27-1.32.55-1.96.85-.44.21-.88.41-1.31.63-.34.18-.68.36-1.01.55q-.6.33-1.17.69c-.3.18-.59.37-.88.56-.54.36-1.07.74-1.57 1.13a21 21 0 0 0-2.18 1.9c-.08.08-.13.16-.21.23-.43.44-.83.89-1.19 1.33-.12.15-.24.31-.36.46-.34.45-.65.9-.92 1.35-.14.23-.26.46-.39.7-.17.32-.33.65-.47.97-.11.24-.22.48-.31.73q-.21.585-.36 1.17c-.09.36-.16.71-.22 1.07-.05.3-.1.61-.12.91-.03.3-.03.6-.03.9 0 .24 0 .47.02.71.02.33.04.65.08.97 0 .05.02.09.03.14.28 1.79.97 3.55 2.08 5.23l-9.57 9.53c-10.69-8.91-12.17-20.98-2.06-31.05Zm112.36 16.37c-.19 2.06-.67 4.12-1.44 6.16-1.49 4-4.08 7.94-7.84 11.68-3.75 3.74-8.39 7-13.67 9.74-2.7 1.4-5.56 2.67-8.57 3.8-12.26 4.61-26.77 6.88-41.33 6.47-3.57-.1-7.13-.36-10.67-.79l6.76-6.73c22.02 1.68 44.71-4.29 56.59-16.12s9.52-26.11-4.02-36.23l6.76-6.73c2.41 1.55 4.59 3.19 6.52 4.92 7.9 7.04 11.73 15.41 10.91 23.82Z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        fill: "url(#Degradado_sin_nombre_44)",
                                        stroke: "url(#Degradado_sin_nombre_45)",
                                        strokeWidth: ".93px",
                                    }}
                                />
                            </g>
                            <g
                                id="Engranaje3"
                                style={{
                                    opacity: 0,
                                    animation: "switchEngranajes 1s steps(1) infinite",
                                    animationDelay: "0.5s",
                                }}
                            >
                                <path
                                    d="m905.57 246.9.36-.06-10.92-23.82-19.36 3.03c-3.53-4.02-7.81-7.73-12.71-11.09l.49-.49-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-36.95-12.26-10.08 10.04c-11.58-2.14-23.91-3.1-36.48-2.7l-5.11-11.16-41.34 6.48.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79h-.02l-.34.05.03.06c-9.13 3.09-17.27 6.95-24.2 11.37l-17.31-5.75-21.51 21.42.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64 12.33 4.09c-.05.86-.08 1.72-.06 2.59v1.7c0 .22-.01.43 0 .65l-19.25 3.02.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06 10.92 23.82 19.36-3.03c3.53 4.02 7.81 7.73 12.71 11.09l-.49.49.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64 36.95 12.26 10.08-10.04c11.58 2.15 23.92 3.11 36.48 2.71l5.11 11.15 41.34-6.48-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.78s.03-.01.04-.02l.32-.05-.02-.05c9.13-3.1 17.27-6.94 24.19-11.38l17.31 5.75 21.51-21.42-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-12.32-4.09c.05-.86.08-1.73.06-2.59v-1.7c0-.22.01-.43 0-.65l19.24-3.01-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06zm-176.83 2.17-1.87.29c.75-.67 1.54-1.33 2.36-1.98-.18.56-.36 1.12-.49 1.68Zm111.94 25.81 1.87-.29c-.75.67-1.54 1.33-2.36 1.98.18-.56.36-1.12.49-1.68Z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        strokeWidth: ".39px",
                                        fill: "url(#Degradado_sin_nombre_46)",
                                        stroke: "url(#Degradado_sin_nombre_47)",
                                    }}
                                />
                                <path
                                    d="m886.58 249.88 19.35-3.03-10.92-23.82-19.36 3.03c-5.67-6.46-13.28-12.13-22.3-16.81l10.08-10.04-36.95-12.26-10.08 10.04c-11.58-2.14-23.91-3.1-36.48-2.7l-5.11-11.16-41.34 6.48 5.11 11.16c-11.22 3.32-21.09 7.76-29.28 13l-17.31-5.75-21.51 21.42 17.31 5.75c-3.79 6.69-5.55 13.83-4.94 21.08l-19.36 3.03 10.92 23.82 19.36-3.03c5.67 6.46 13.28 12.13 22.3 16.81l-10.08 10.04 36.95 12.26 10.08-10.04c11.58 2.15 23.92 3.11 36.48 2.71l5.11 11.15 41.34-6.48-5.11-11.15c11.23-3.33 21.09-7.76 29.28-13.01l17.31 5.75 21.51-21.42-17.31-5.75c3.8-6.7 5.56-13.83 4.95-21.08Zm-170.83 1.22c.2-2.09.69-4.15 1.45-6.16 3.08-8.24 10.64-15.76 21.51-21.42 2.66-1.39 5.52-2.66 8.56-3.8 5.95-2.24 12.59-3.99 19.8-5.12a118 118 0 0 1 32.21-.57c14.25 1.72 27.23 6.03 36.95 12.26 2.39 1.53 4.57 3.17 6.53 4.91l-12.99 2.03c-13.4-10.18-36.64-15.2-59.46-11.62-22.82 3.57-38.66 14.71-41.56 27.45l-12.99 2.03h-.01Zm89.06-13.95c-3.06-1.28-6.49-2.25-10.14-2.88-.32-.06-.64-.11-.97-.16-.55-.09-1.11-.17-1.67-.24-.4-.05-.81-.09-1.22-.13-.8-.08-1.6-.15-2.41-.19-.56-.03-1.12-.07-1.69-.08-.46-.01-.92-.02-1.38-.02-.55 0-1.11 0-1.67.01-.43 0-.87.02-1.3.04-.83.04-1.66.09-2.49.16-1.28.11-2.56.26-3.85.46-1.28.2-2.51.45-3.71.72-.79.18-1.56.38-2.32.59-.38.11-.75.22-1.12.34-.52.16-1.03.33-1.53.5-.37.13-.74.26-1.1.39-.58.22-1.14.45-1.69.69-.5.21-.98.44-1.46.67-.41.2-.81.39-1.2.6-.38.2-.75.41-1.12.62-.29.17-.57.34-.85.51-.38.24-.77.48-1.13.72-.06.04-.12.09-.18.13-1.99 1.39-3.65 2.91-4.92 4.55l-18.39 2.88c3.41-10.71 17.16-19.91 36.58-22.96 19.43-3.04 39.2.91 51.31 9.19l-18.39 2.88Zm-40.2 31.83c2.5 1.05 5.24 1.88 8.14 2.5.1.02.19.04.28.07.53.11 1.06.2 1.6.3.39.07.78.14 1.18.2q.75.12 1.5.21c.51.06 1.03.12 1.55.17.61.06 1.23.11 1.85.15.68.04 1.35.08 2.04.1.43.01.86.01 1.3.02.58 0 1.16 0 1.74-.01.42 0 .85-.02 1.27-.04.83-.04 1.65-.09 2.48-.16a51.6 51.6 0 0 0 7.6-1.19c.78-.18 1.54-.37 2.29-.58.4-.11.78-.23 1.16-.35.49-.15.97-.31 1.45-.47.4-.14.8-.28 1.19-.42.47-.18.93-.37 1.38-.56.67-.28 1.31-.57 1.93-.88.32-.15.63-.31.94-.47.43-.22.84-.46 1.25-.69.24-.14.47-.28.7-.42 2.61-1.61 4.76-3.45 6.31-5.46l18.39-2.88c-3.41 10.71-17.16 19.91-36.58 22.96-19.43 3.04-39.2-.91-51.31-9.19l18.39-2.88zm87.61-7.78c-3.08 8.24-10.64 15.76-21.51 21.42a76 76 0 0 1-8.56 3.8c-5.95 2.24-12.59 3.99-19.81 5.12a118 118 0 0 1-32.2.57c-14.25-1.72-27.23-6.03-36.95-12.26a52 52 0 0 1-6.53-4.91l12.99-2.03c13.4 10.18 36.64 15.2 59.46 11.62 22.82-3.57 38.66-14.71 41.56-27.45l12.99-2.03c-.2 2.09-.69 4.15-1.45 6.16h.01Z"
                                    style={{
                                        fill: "url(#Degradado_sin_nombre_44)",
                                        stroke: "url(#Degradado_sin_nombre_49)",
                                        strokeMiterlimit: 10,
                                        strokeWidth: ".94px",
                                    }}
                                />
                            </g>
                            <g
                                id="Engranaje4"
                                style={{
                                    opacity: 0,
                                    animation: "switchEngranajes 1s steps(1) infinite",
                                    animationDelay: "0.75s",
                                }}
                            >
                                <path
                                    d="m905.57 246.9.36-.06-10.91-23.82-19.37 3.03c-3.47-3.94-7.73-7.67-12.73-11.1l.49-.48-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-36.95-12.26-10.08 10.03c-11.94-2.22-24.31-3.08-36.48-2.7l-5.11-11.16-41.33 6.47.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.03.07c-8.88 3.01-17.08 6.81-24.19 11.37L691.99 208l-21.51 21.42.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64 12.35 4.1c-.05.87-.07 1.75-.06 2.62v1.7c0 .21-.01.41-.01.62l-19.25 3.02.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06.36.79-.36.06L674.42 301l19.37-3.03c3.47 3.94 7.72 7.67 12.72 11.1l-.48.48.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64.64.21-.64.64 36.95 12.26 10.07-10.03c11.96 2.21 24.31 3.08 36.48 2.69l5.11 11.16 41.33-6.47-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.03-.07c8.89-3.01 17.08-6.81 24.19-11.36l17.3 5.74 21.51-21.42-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-.64-.21.64-.64-12.35-4.1c.05-.87.07-1.75.06-2.62v-1.7c0-.21.01-.41.01-.62l19.25-3.02-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79.36-.06-.36-.79zM751.3 274.68c.02.07.05.14.08.21-1.22-.62-2.4-1.26-3.49-1.94l3.2 1.06c.06.22.14.45.22.67Zm-23.03-8.25c0 .06.01.11.01.17 0 .28-.01.57 0 .85 0 .28-.01.57 0 .85 0 .28-.01.57 0 .85 0 .28-.01.57 0 .85 0 .28-.01.57 0 .85-.03 2.08.3 4.14.95 6.17-.88-.69-1.75-1.38-2.55-2.09-4.14-3.7-7.16-7.76-8.98-12l10.57 3.51Zm89.74-17.37c1.23.62 2.4 1.27 3.5 1.94l-3.2-1.06c-.08-.3-.2-.59-.3-.88Zm23.12 8.45c0-.06-.01-.11-.01-.17 0-.28.01-.57 0-.85 0-.28.01-.57 0-.85 0-.28.01-.57 0-.85 0-.28.01-.57 0-.85 0-.28.01-.57 0-.85.03-2.08-.3-4.14-.95-6.17.88.69 1.75 1.38 2.55 2.09 4.14 3.7 7.16 7.76 8.98 12l-10.57-3.51Z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        strokeWidth: ".39px",
                                        fill: "url(#Degradado_sin_nombre_50)",
                                        stroke: "url(#Degradado_sin_nombre_51)",
                                    }}
                                />
                                <path
                                    d="m886.57 249.88 19.37-3.03-10.91-23.82-19.37 3.03c-5.51-6.25-12.98-11.97-22.3-16.81l10.08-10.03-36.95-12.26-10.08 10.03c-11.94-2.22-24.31-3.08-36.48-2.7l-5.11-11.16-41.33 6.47 5.11 11.16c-10.86 3.22-20.83 7.58-29.29 13L692 208.02l-21.51 21.42 17.31 5.74c-3.93 6.92-5.53 14.06-4.93 21.08l-19.37 3.03 10.91 23.82 19.37-3.03c5.5 6.26 12.98 11.98 22.29 16.82L706 306.93l36.95 12.26 10.07-10.03c11.96 2.21 24.31 3.08 36.48 2.69l5.11 11.16 41.33-6.47-5.11-11.16c10.87-3.22 20.84-7.58 29.3-12.99l17.3 5.74 21.51-21.42-17.31-5.74c3.93-6.92 5.53-14.06 4.93-21.08h.01Zm-151.9.86 16.43 5.46c.06.22.14.45.22.67.1.31.22.63.35.94.12.28.24.55.38.83.15.31.32.61.5.91.36.6.76 1.2 1.22 1.78.04.05.07.1.11.14.24.29.5.58.76.87.19.21.38.42.59.62.26.26.52.51.79.76.28.26.58.5.89.75.36.29.72.58 1.11.86.42.31.85.61 1.3.9a37 37 0 0 0 2.13 1.24c.31.17.61.33.93.49q.945.465 1.95.9c1.04.44 2.12.87 3.27 1.25s2.32.71 3.51 1c.77.19 1.54.36 2.33.52.41.08.83.15 1.25.23.53.09 1.06.18 1.6.25.45.06.9.13 1.35.18.55.07 1.11.12 1.67.16.81.07 1.61.12 2.42.16.41.02.83.04 1.24.05.57.01 1.15.02 1.72.01.34 0 .68 0 1.01-.02 3.81-.08 7.57-.52 11.12-1.31l16.43 5.46c-15.52 6.24-36.43 7.18-53.8 1.42-17.36-5.76-26.4-16.65-24.77-27.49h-.01Zm87.47 35.68c-12.26 4.61-26.77 6.88-41.33 6.47-3.57-.1-7.13-.36-10.67-.79-6.92-.83-13.72-2.3-20.18-4.44-6.44-2.14-12.06-4.79-16.77-7.82-2.41-1.55-4.59-3.19-6.52-4.92-7.9-7.04-11.73-15.41-10.91-23.82.19-2.06.67-4.12 1.44-6.16l11.61 3.85c-3.07 12.72 7.11 25.78 27.5 32.55 20.4 6.77 45.16 5.31 62.79-2.58l11.61 3.85c-2.7 1.4-5.56 2.67-8.57 3.8Zm12.61-31.02-16.43-5.46c-.58-2.16-1.8-4.25-3.58-6.19l-.48-.51c-.28-.29-.57-.57-.88-.85-.22-.2-.46-.4-.7-.59-.46-.38-.94-.76-1.46-1.12-.35-.25-.71-.51-1.08-.75-.31-.2-.63-.39-.95-.58-.38-.23-.78-.45-1.19-.67-.32-.17-.63-.34-.96-.5q-.945-.465-1.95-.9c-1.04-.44-2.12-.87-3.27-1.25-1.14-.38-2.31-.71-3.5-1-.78-.19-1.56-.37-2.35-.52-.4-.08-.8-.15-1.2-.22q-.84-.15-1.68-.27c-.42-.06-.83-.12-1.25-.17-.67-.08-1.35-.14-2.02-.2-.62-.05-1.23-.09-1.85-.12a42 42 0 0 0-1.58-.06c-.52-.01-1.03-.01-1.55-.01-.41 0-.82 0-1.22.02-.56.01-1.13.03-1.69.06-.08 0-.16.01-.25.02-3.11.17-6.16.59-9.07 1.24l-16.43-5.46c15.52-6.24 36.43-7.18 53.8-1.42 17.36 5.76 26.4 16.65 24.77 27.49Zm18.91-.37c-.19 2.06-.67 4.12-1.44 6.16l-11.61-3.85c3.07-12.72-7.11-25.78-27.5-32.55-20.4-6.77-45.16-5.31-62.79 2.58l-11.61-3.85c2.7-1.4 5.56-2.67 8.57-3.8 12.26-4.61 26.77-6.88 41.33-6.47 3.57.1 7.13.36 10.67.79 6.92.83 13.72 2.3 20.17 4.44s12.07 4.8 16.78 7.83c2.41 1.55 4.59 3.19 6.52 4.92 7.9 7.04 11.73 15.41 10.91 23.82z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        strokeWidth: ".94px",
                                        fill: "url(#Degradado_sin_nombre_44)",
                                        stroke: "url(#Degradado_sin_nombre_53)",
                                    }}
                                />
                            </g>
                            <g id="TapitaEngranaje">
                                <path
                                    d="M817.61 230.15c-4.8-10.47-23.42-16.65-41.58-13.8-15.22 2.38-25.26 10.35-25.31 19.03-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.02.28 0 .56 0 .85-.16 1.95.19 3.94 1.1 5.92 4.8 10.47 23.42 16.65 41.58 13.8 15.22-2.38 25.26-10.35 25.31-19.03.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.02-.28 0-.56 0-.85.16-1.95-.19-3.94-1.1-5.92Z"
                                    style={{
                                        strokeMiterlimit: 10,
                                        strokeWidth: ".39px",
                                        fill: "url(#Degradado_sin_nombre_54)",
                                        stroke: "url(#Degradado_sin_nombre_55)",
                                    }}
                                />
                                <ellipse
                                    cx={784.7}
                                    cy={235.32}
                                    rx={34.03}
                                    ry={19.64}
                                    transform="rotate(-.36 785.493 234.835)"
                                    style={{
                                        fill: "url(#Degradado_sin_nombre_56)",
                                        stroke: "url(#Degradado_sin_nombre_57)",
                                        strokeMiterlimit: 10,
                                        strokeWidth: ".94px",
                                    }}
                                />
                            </g>
                        </g>
                    </g>
                    <g id="GoogleCalendar">
                        <path
                            id="GrosorGoogle"
                            className="cls-32"
                            d="M523.72 259.93a5 5 0 0 0-.8-.5c-.26-.2-.54-.38-.84-.53-.26-.2-.55-.37-.84-.52-.25-.19-.51-.35-.79-.5a5 5 0 0 0-.8-.5c-.26-.2-.54-.38-.83-.53-.26-.2-.55-.37-.84-.52-.25-.19-.51-.35-.79-.5-.26-.2-.55-.37-.84-.52-.24-.19-.5-.35-.77-.49-.26-.2-.54-.38-.83-.53-.26-.2-.55-.37-.84-.52-.25-.19-.51-.35-.79-.5a5 5 0 0 0-.8-.5c-.26-.2-.54-.38-.83-.53-.26-.2-.55-.37-.84-.52-.25-.19-.51-.35-.79-.5-.26-.2-.55-.37-.84-.52-.23-.18-.48-.34-.74-.47-.28-.22-.57-.4-.89-.56-.26-.2-.53-.36-.82-.51-.25-.19-.51-.35-.79-.5a5 5 0 0 0-.8-.5c-.26-.2-.54-.38-.83-.53-.26-.2-.55-.38-.84-.52-.25-.19-.51-.35-.79-.5-.26-.2-.55-.38-.84-.52-.23-.18-.48-.34-.74-.47-.28-.22-.57-.4-.89-.56-.25-.19-.51-.35-.79-.5-.26-.2-.55-.38-.84-.52-.24-.19-.5-.35-.77-.49-.26-.2-.54-.38-.83-.53-.26-.2-.55-.37-.84-.52-.25-.19-.51-.35-.79-.5-.26-.2-.55-.38-.84-.52-.23-.18-.48-.34-.74-.47-.28-.22-.58-.4-.89-.56-.25-.19-.51-.35-.79-.5-2.04-1.58-5.08-1.57-8.49.4l-22.29 12.87-96.59 55.77h-.01c-6.16 3.54-11.14 12.14-11.14 19.2v136.27c0 3.62 1.32 6.12 3.42 7.22.28.22.57.4.89.56.25.19.51.35.79.5.26.2.55.37.84.52.24.19.5.35.77.49.26.2.54.38.83.53.26.2.55.37.84.52.25.19.51.35.79.5.26.2.55.37.84.52.24.18.48.34.74.47.28.22.57.4.89.56.25.19.51.35.79.5.26.2.55.38.84.52.24.18.48.34.74.47.28.22.57.4.89.56.26.2.53.36.82.51.25.19.51.35.79.5.25.19.52.36.8.5.26.2.54.38.83.53.26.2.55.37.84.52.25.19.51.35.79.5.26.2.55.37.84.52.24.18.48.34.74.47.28.22.57.4.89.56.25.19.51.35.79.5.26.2.55.37.84.52.24.19.5.35.77.49.26.2.54.38.83.53.26.2.55.37.84.52.25.19.51.35.79.5.26.2.55.38.84.52.23.18.48.34.74.47.28.22.58.4.89.56.25.19.51.35.79.5.26.2.55.38.84.52.23.18.48.34.74.47.28.22.58.4.89.56.25.19.51.35.79.5.26.2.55.38.84.52.26.2.53.36.82.51 2.04 1.56 5.07 1.55 8.46-.41l22.29-12.87 74.3-42.89 33.43-57.63V267.18c0-3.64-1.33-6.15-3.47-7.25Z"
                        />
                        <g id="FrenteGoogle">
                            <path
                                className="cls-44"
                                d="m494.58 312.54-33.43 15.04-40.86 27.85-3.72 44.73 3.71 40.44 37.15-16.13 37.15-26.77 3.71-45.8-3.71-39.38z"
                            />
                            <path
                                d="M435.52 412.71c-2.78-.55-4.7-2.58-5.75-6.12l6.45-6.77q.885 3.33 3.06 4.17c1.45.57 3.21.24 5.28-.95s3.92-3 5.43-5.34 2.28-4.66 2.28-6.92-.8-3.76-2.4-4.3-3.6-.12-6 1.26l-3.72 2.15v-7.31l3.34-1.93c2.06-1.19 3.8-2.83 5.21-4.92s2.12-4.25 2.12-6.47c0-1.98-.63-3.19-1.89-3.64s-2.86-.13-4.8.99c-1.89 1.09-3.4 2.54-4.51 4.34s-1.92 3.7-2.43 5.67l-6.38.64c.84-3.23 2.4-6.56 4.67-9.97 2.28-3.41 5.18-6.14 8.71-8.18 2.61-1.51 4.96-2.29 7.04-2.33s3.71.62 4.89 1.99 1.76 3.34 1.76 5.89-.55 5.13-1.64 7.57-2.44 4.6-4.04 6.5v.44c2.11-.21 3.83.35 5.18 1.64 1.35 1.3 2.02 3.39 2.02 6.28s-.64 5.85-1.92 8.86-3.06 5.82-5.3 8.42c-2.26 2.6-4.79 4.73-7.61 6.35-3.26 1.89-6.27 2.55-9.05 2.01zm39.55-59.5-7.04 9.93-3.54-4.11 12.7-17.83 4.87-2.81v49.52l-6.98 4.03v-38.73Z"
                                style={{
                                    strokeWidth: 0,
                                    fill: "#1a73e8",
                                }}
                            />
                            <path
                                d="m494.58 436.04 33.43-57.63-16.72 1.13-16.72 18.17-7.43 23.45 7.43 14.87Z"
                                style={{
                                    strokeWidth: 0,
                                    fill: "#ea4335",
                                }}
                            />
                            <path
                                d="m412.85 464.07 7.43 14.87 74.3-42.9v-38.33l-74.3 42.9-7.43 23.45Z"
                                style={{
                                    strokeWidth: 0,
                                    fill: "#34a853",
                                }}
                            />
                            <path
                                d="M397.99 329.98c-6.16 3.55-11.14 12.15-11.14 19.21v110.72l16.72-1.13 16.72-18.17v-85.17l74.3-42.9 7.43-23.45-7.43-14.87L398 329.99h-.01Z"
                                style={{
                                    strokeWidth: 0,
                                    fill: "#4285f4",
                                }}
                            />
                            <path
                                d="M386.84 459.92v25.55c0 7.06 4.99 9.9 11.14 6.34l22.29-12.87v-38.33l-33.43 19.3Z"
                                style={{
                                    strokeWidth: 0,
                                    fill: "#188038",
                                }}
                            />
                            <path
                                d="M494.58 312.54v85.17l33.43-19.3v-85.17l-16.72 1.13-16.72 18.17Z"
                                style={{
                                    strokeWidth: 0,
                                    fill: "#fbbc04",
                                }}
                            />
                            <path
                                className="cls-32"
                                d="M528.01 293.24v-25.55c0-7.06-4.99-9.9-11.14-6.34l-22.29 12.87v38.33l33.43-19.3Z"
                            />
                        </g>
                        <g
                            style={{
                                opacity: 0.5,
                            }}
                        >
                            <path
                                d="M527.08 263.12s-.03-.05-.04-.08c.01.03.03.05.04.08m.4.98s-.04-.1-.06-.16c.02.05.04.1.06.16m.29 1.1-.06-.24zm-1.19-2.94s-.01-.02-.02-.03c0 0 .01.02.02.03M386.84 485.47V349.2c0-7.06 4.99-15.65 11.14-19.21l96.59-55.77 22.29-12.87c2.98-1.72 5.68-1.93 7.67-.91-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51q-.39-.3-.81-.51c-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51q-.39-.3-.81-.51c-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51q-.39-.3-.81-.51c-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51q-.39-.3-.81-.51c-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51q-.39-.3-.81-.51c-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51q-.39-.3-.81-.51c-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51q-.39-.3-.81-.51c-.26-.2-.53-.37-.82-.51-.26-.2-.53-.37-.82-.51-2.04-1.58-5.09-1.57-8.49.39l-22.29 12.87-96.59 55.77c-6.16 3.55-11.14 12.15-11.14 19.21v136.27c0 3.65 1.34 6.15 3.47 7.25.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51.26.2.53.37.82.51.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51.26.2.53.37.82.51.26.2.53.37.82.51.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51.26.2.53.37.82.51.26.2.53.37.82.51.26.2.53.37.82.51q.39.3.81.51.39.3.81.51c.26.2.53.37.82.51q.39.3.81.51c.26.2.53.37.82.51q.39.3.81.51c-1.65-1.27-2.66-3.58-2.66-6.73zm141.11-219.08c0-.1-.03-.18-.04-.28.01.09.03.18.04.28M392.34 493.3c-.09 0-.19-.02-.28-.03zm2.13-.12c-.13.02-.25.04-.37.06.12-.02.25-.03.37-.06m1.14-.3c-.13.04-.27.07-.4.11.13-.04.26-.07.4-.11m1.17-.45c-.12.06-.24.1-.37.15.12-.05.24-.09.37-.15m-6.38.33-.12-.06zm.94.35-.21-.06z"
                                style={{
                                    strokeWidth: 0,
                                    fill: "#094184",
                                }}
                                id="SombraGoogle"
                            />
                        </g>
                    </g>
                    <g id="Openchat">
                        <g id="GrosorOpenChat">
                            <path
                                d="M1187.85 458.92c.34-.21.67-.43 1.01-.65.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.46-.28.91-.56 1.35-.86.34-.21.67-.43 1.01-.65.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.24.79-.49 1.18-.75 12.86-7.82 20.79-24 20.79-46.87 0-46.77-33.09-103.84-73.92-127.41-21.47-12.4-40.79-13.06-54.29-4.1-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.46.28-.91.56-1.35.86-.34.21-.67.43-1.01.65-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.4.24-.79.49-1.18.75-.46.28-.91.56-1.35.86-.34.21-.67.42-1 .64-.4.24-.79.49-1.18.75-12.86 7.81-20.78 24.01-20.78 46.9 0 46.8 33.09 103.84 73.89 127.4 21.47 12.4 40.8 13.05 54.31 4.09.4-.24.79-.49 1.18-.75.46-.28.91-.57 1.36-.87Zm-56.84-134.27c22.67 13.09 41.06 44.79 41.06 70.77 0 4.87-.65 9.2-1.85 12.92-4.49-.66-9.35-2.4-14.43-5.33-22.69-13.1-41.06-44.79-41.06-70.77 0-4.87.65-9.2 1.85-12.92 4.49.66 9.35 2.4 14.43 5.33"
                                style={{
                                    strokeWidth: 0,
                                    fill: "url(#Degradado_sin_nombre_100)",
                                }}
                            />
                            <path
                                d="M1188.59 458.66c.4-.24.79-.49 1.18-.75.43-.27.86-.53 1.27-.82.37-.23.73-.45 1.09-.69.4-.24.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.43-.27.86-.53 1.27-.82.36-.23.73-.45 1.09-.69.4-.25.79-.49 1.18-.75.4-.24.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75 2.52-1.56 4.85-3.42 6.96-5.63 23.55-24.56 15.38-81.83-18.25-127.94s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.99 1.03-.99 1.03c-.07-.09-.13-.18-.19-.27s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.99 1.03-.99 1.03c-.07-.09-.13-.18-.19-.27s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-.98 1.03-.98 1.03c-.07-.09-.13-.19-.2-.28s-19.07 19.9-19.07 19.9a98.6 98.6 0 0 1 10.08 17.27c9.74 21.41 9.66 41.63 1.18 52.1-.21.05-.42.12-.64.17l.17.37-.03.03c-.43.12-.87.25-1.32.34l.18.4c-.45.13-.9.25-1.36.35l.18.4c-.45.13-.9.25-1.36.35l.18.4c-.45.13-.9.25-1.36.35l.18.41c-.45.13-.9.25-1.36.35l.18.4c-.45.13-.9.25-1.36.35l.18.4c-.45.13-.9.25-1.36.35l.18.4c-.45.13-.9.25-1.36.35l.18.4c-.45.13-.9.25-1.36.35l19.07 41.91c4.56-.99 8.74-2.77 12.47-5.29.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75Z"
                                style={{
                                    strokeWidth: 0,
                                    fill: "url(#Degradado_sin_nombre_101)",
                                }}
                            />
                        </g>
                        <path
                            id="SombraOpenChat"
                            d="M1179.22 463.48c2.93-1.01 5.67-2.37 8.19-4.08.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75.4-.25.79-.49 1.18-.75 2.52-1.56 4.85-3.42 6.96-5.63 23.02-24 15.71-79.26-16.04-124.81-12.46-18.16-28.04-33.7-44.97-43.47-21.75-12.56-41.29-13.08-54.81-3.76-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.79.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.79.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.8.49-1.18.75-.39.25-.79.49-1.18.75-.39.25-.8.49-1.18.75-12.55 7.93-20.26 23.97-20.26 46.55 0 46.8 33.09 103.84 73.89 127.4 17.01 9.82 32.68 12.25 45.17 8.39.55-.16 1.08-.34 1.61-.52.08-.03.17-.05.25-.08h.01Zm-23.25-117.1-.1.1a99.2 99.2 0 0 1 10.08 17.27c.26.57.5 1.14.75 1.71 4.12 9.72 6.54 19.83 6.54 29.2 0 5.26-.76 9.86-2.15 13.78-4.73-.55-9.89-2.32-15.3-5.44-22.69-13.1-41.06-44.79-41.06-70.77 0-5.26.76-9.86 2.15-13.78 4.73.55 9.89 2.32 15.3 5.44 8.87 5.12 17.07 13.12 23.79 22.49"
                            style={{
                                strokeWidth: 0,
                                fill: "url(#Degradado_sin_nombre_102)",
                                mixBlendMode: "multiply",
                            }}
                        />
                        <g id="FrenteOpenChat">
                            <path
                                d="M1057.11 329.05c0 46.8 33.09 103.84 73.89 127.4s73.92 4.74 73.92-42.03-33.09-103.84-73.92-127.41-73.89-4.75-73.89 42.05Zm32.84 18.96c0-25.98 18.39-36.45 41.06-23.36s41.06 44.79 41.06 70.77-18.39 36.45-41.06 23.36c-22.69-13.1-41.06-44.79-41.06-70.77"
                                style={{
                                    strokeWidth: 0,
                                    fill: "url(#Degradado_sin_nombre_103)",
                                }}
                            />
                            <path
                                d="M1173.76 327.34c33.63 46.11 41.8 103.38 18.25 127.94-4.97 5.2-11.15 8.63-18.25 10.17l-19.07-41.91c18.58-4.02 23.08-30.46 10.08-59.03a98.6 98.6 0 0 0-10.08-17.27z"
                                style={{
                                    strokeWidth: 0,
                                    fill: "url(#Degradado_sin_nombre_104)",
                                }}
                            />
                        </g>
                    </g>
                    <g id="Calendly">
                        <path
                            id="SombraCalendly"
                            d="M1013.55 893.06c.22-12.6-6.38-25.32-20.28-36.1-20.49-15.6-52.85-24.55-87.31-23.55-4.6.07-9.13 1.92-10.4 4.86h-.01c-1.34 2.88-1.97 5.76-1.87 8.7-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.38-.01.75 0 1.13-5.95.73-11.59 1.94-16.53 3.54.28.31.57.62.85.93-.15.05-.3.09-.44.14l-.88-.97c-.4.09-.81.19-1.22.3-.14-.15-.28-.29-.42-.44.29-.09.58-.18.88-.27-3.35-3.75-8.53-7.12-14.3-9.77-3.75-1.89-9.26-1.62-12.71.29-27.33 11.99-41.61 30.28-41.31 48.64v23.7c-.22 12.55 6.35 25.21 20.23 35.98 34.2 26.09 98.78 31.24 144.37 11.56 27.4-11.83 41.66-30.13 41.36-48.53v-23.69Zm-176.2-7.45a18.3 18.3 0 0 0-.78 5.86c-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.01.39-.01.79 0 1.19-.01.39-.01.79 0 1.18-.13 3.7.9 7.45 3.15 11.09l1.8 2.9c-10.06-6.42-17.44-14.31-21.18-23.11 3.12-7.41 8.92-14.38 17.01-20.44Zm146.86 39.33q.87-2.895.78-5.85c.01-.39.01-.79 0-1.19.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.19.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.19.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.19.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.19.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.19.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.19.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.19.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.19.01-.39.01-.79 0-1.18.01-.39.01-.79 0-1.19.12-3.46-.78-6.97-2.73-10.38 8.28 6 14.39 13.09 17.6 20.88-2.95 6.98-8.34 13.44-15.65 19.05"
                            style={{
                                strokeWidth: 0,
                                fill: "#063c89",
                            }}
                        />
                        <g id="Brand_mark-3">
                            <path
                                className="cls-33"
                                d="M927.11 867.58c10.36 2.58 18.51 7.4 22.25 13.45l3.09 4.99c3.42 5.52 3.18 11.81-1.22 17.19-4.57 5.12-11.94 9.04-21.23 10.7l-11.41 2.4c-9.59 2.01-19.56 1.73-28.69-.51-9.29-2.5-16.2-7-19.61-12.52l-2.93-4.73c-3.74-6.05-2.92-13.05 2.24-18.89 4.86-5.48 5.1-11.76 1.06-17.45-.81-1.31-1.63-2.63-2.9-3.85-1.96 1.01-3.91 2.01-5.25 3.18l-13.31 9.33c-12.27 8.52-15.99 19.99-9.48 30.51l7 11.3c6.51 10.51 21.95 17.96 40.73 19.96l20.47 2.24c18.78 2 38.4-2.12 50.67-10.64l13.77-9.43c12.27-8.52 15.99-19.99 9.48-30.51l-7-11.3c-6.51-10.51-21.95-17.96-40.73-19.96l-20.47-2.24c-2.31-.41-4.92-.45-7.53-.5.36 1.41 1.17 2.72 1.98 4.04 2.21 6.07 9.28 10.82 19.03 13.23"
                            />
                            <path
                                className="cls-33"
                                d="m877.86 896.34 3.09 4.99c4.26 7.72 18.37 12.18 32.39 9.83l1.83-.38 11.41-2.4c13.4-2.52 20.91-11.22 16.19-18.85l-.65-1.05-2.93-4.73c-7.97-12.88-30.15-7.04-42.19-26.49-1.14-1.84-1.82-3.78-2.5-5.71-6.26.72-12.19 1.97-17.35 3.64 1.6 1.74 3.19 3.49 4.33 5.33 11.72 18.93-11.76 22.67-3.62 35.81"
                            />
                            <path
                                className="cls-33"
                                d="M895.55 838.27c-1.99 4.28-2.45 8.54-1.22 13.03 3.36-.41 7.34-.65 11.02-.53-1.2-3.61-.87-7.24.69-10.54 50.69-1.44 93.51 21.06 96.25 50.48 2.74 29.43-37.15 54.14-88.3 55.68-51.15 1.53-93.51-21.06-96.25-50.48-1.09-17.59 12.72-34.45 37.01-45.2 5.28 1.86 9.06 4.63 12.09 7.86 2.71-1.46 5.58-2.66 9.07-3.69-3.35-3.75-8.53-7.12-14.3-9.77-3.75-1.89-9.26-1.62-12.71.29-45.43 19.94-54.82 57.26-21.08 83.44 34.2 26.09 98.78 31.24 144.37 11.56s54.82-57.26 21.08-83.44c-20.49-15.6-52.85-24.55-87.31-23.55-4.6.07-9.13 1.92-10.4 4.86"
                            />
                            <path
                                className="cls-40"
                                d="M867.92 858.63c1.27 1.22 2.08 2.53 2.9 3.85 4.04 5.69 3.8 11.97-1.06 17.45-5.16 5.84-5.68 12.48-2.4 18.62l3.09 4.99c3.42 5.52 10.32 10.01 19.61 12.52 9.13 2.24 19.1 2.52 28.69.51l11.41-2.4c9.13-1.92 16.96-5.94 21.53-11.06 4.41-5.38 4.8-11.41.93-16.83l-2.93-4.73c-3.74-6.05-12.05-11.13-22.42-13.71-9.75-2.41-17.27-7.07-19.94-13.04-.81-1.31-1.63-2.63-1.98-4.04-3.68-.12-7.2.03-11.02.53.68 1.94 1.37 3.87 2.5 5.71 12.04 19.45 34.22 13.61 42.19 26.49l3.09 4.99c5.18 7.53-1.25 16.3-14.33 19.35l-1.37.29-11.87 2.49c-13.08 3.04-28.39-.87-33.57-8.4l-.49-.79-2.93-4.73c-7.97-12.88 15.5-16.62 3.46-36.07-1.14-1.84-2.73-3.58-4.33-5.33-2.74.58-5.61 1.77-8.77 3.33"
                            />
                            <path
                                className="cls-40"
                                d="M867.92 858.63c1.27 1.22 2.08 2.53 2.9 3.85 4.04 5.69 3.8 11.97-1.06 17.45-5.16 5.84-5.68 12.48-2.4 18.62l3.09 4.99c3.42 5.52 10.32 10.01 19.61 12.52 9.13 2.24 19.1 2.52 28.69.51l11.41-2.4c9.13-1.92 16.96-5.94 21.53-11.06 4.41-5.38 4.8-11.41.93-16.83l-2.93-4.73c-3.74-6.05-12.05-11.13-22.42-13.71-9.75-2.41-17.27-7.07-19.94-13.04-.81-1.31-1.63-2.63-1.98-4.04-3.68-.12-7.2.03-11.02.53.68 1.94 1.37 3.87 2.5 5.71 12.04 19.45 34.22 13.61 42.19 26.49l3.09 4.99c5.18 7.53-1.25 16.3-14.33 19.35l-1.37.29-11.87 2.49c-13.08 3.04-28.39-.87-33.57-8.4l-.49-.79-2.93-4.73c-7.97-12.88 15.5-16.62 3.46-36.07-1.14-1.84-2.73-3.58-4.33-5.33-2.74.58-5.61 1.77-8.77 3.33"
                            />
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    );
};

export default KonectaSVG;
