import React, { useEffect, useState } from 'react';
import { initialise } from '@open-ic/openchat-xframe';
import { Actor } from '@dfinity/agent';
import { idlFactory } from '../declarations/backend/backend.did.js';
import { ProjectData, useGlobalID } from '../hooks/globalID.tsx';
import { canisterId } from '../declarations/backend/index.js';
import useFetchData from '../hooks/fetchData.tsx';
import { idlFactory as idlFactoryIndex, SerializedProjectMissions } from '../declarations/index/index.did.js';
import { useIdentityKit } from '@nfid/identitykit/react';
import { useNavigate } from 'react-router-dom';
import { idlFactory as idlFactoryDefault } from '../declarations/dfinity_backend/index.js';
import { IndexCanisterId } from '../frontend/main.tsx';
import { toast } from 'react-hot-toast';

const canisterIdDFINITY = "2mg2s-uqaaa-aaaag-qna5a-cai";

const OpenChat: React.FC = () => {
    const globalID = useGlobalID();
    const fetchData = useFetchData();
    const [placestate, setPlacestate] = useState(false);
    const { disconnect } = useIdentityKit();
    const navigate = useNavigate();

    useEffect(() => {
        if (globalID.agent == null || globalID.principalId == null) {
            return;
        } else {
            const initOpenChat = async () => {
                let attempts = 0;
                const maxAttempts = 10;

                const checkIframeExists = (): Promise<HTMLIFrameElement | null> => {
                    return new Promise<HTMLIFrameElement | null>((resolve) => {
                        const iframe = document.getElementById('openchat-iframe') as HTMLIFrameElement;
                        if (iframe) {
                            resolve(iframe);
                        } else if (attempts < maxAttempts) {
                            setTimeout(() => {
                                attempts += 1;
                                resolve(checkIframeExists());
                            }, 300);
                        } else {
                            resolve(null);
                        }
                    });
                };

                const iframe = await checkIframeExists();
                if (!iframe) {
                    console.error('Iframe element not found after retries');
                    return;
                }

                try {
                    await initialise(iframe, {
                        targetOrigin: 'https://oc.app',
                        initialPath: '/community/mnxqn-oaaaa-aaaaf-bm4dq-cai/channel/249008524007198397170279379338618862603',
                        theme: {
                            name: 'konecta',
                            base: 'dark',
                            overrides: {
                                bg: "#1a1a2e",            // Dark blue background
                                txt: "#eaeaea",           // Light gray text
                                primary: "#6a0dad",       // Dark purple primary color
                                placeholder: "#828bb1",   // Muted purple-blue for placeholders
                                bd: "#6a0dad",            // Dark purple border color
                                "txt-light": "#9a75c8",   // Lighter purple for secondary text
                                accent: "#4e5b73",        // Blue-gray for accents
                                button: {
                                    bg: "#6a0dad",          // Dark purple button background
                                    hv: "#570b93",          // Slightly darker purple on hover
                                    txt: "#ffffff",         // White button text
                                    sh: "0 2px 5px rgba(0, 0, 0, 0.3)",  // Subtle shadow for buttons
                                },
                                input: {
                                    bg: "#22223b",          // Darker blue input background
                                    bd: "#6a0dad",          // Dark purple border for inputs
                                    sh: "0 0 5px rgba(106, 13, 173, 0.5)", // Soft purple shadow
                                },
                                timeline: {
                                    txt: "#9a75c8",         // Lighter purple text in the timeline
                                    bg: "#1a1a2e",          // Match the background of the timeline
                                },
                                chatSummary: {
                                    "bg-selected": "#27293d", // Slightly darker background when selected
                                    hv: "#343654",          // Darker hover effect
                                    del: "#6a0dad",         // Dark purple delete option
                                },
                                modal: {
                                    bg: "#22223b",          // Dark blue modal background
                                    bd: "#6a0dad",          // Dark purple border
                                    sh: "0 0 10px rgba(0, 0, 0, 0.7)",  // Heavier shadow for modals
                                },
                                scrollbar: {
                                    bg: "#27293d",          // Dark blue scrollbar
                                },
                                currentChat: {
                                    msgs: {
                                        bg: "#1a1a2e",        // Background for messages
                                    },
                                    msg: {
                                        bg: "#2a2d44",        // Slightly lighter dark blue for individual messages
                                        txt: "#eaeaea",       // Light gray text
                                        me: {
                                            bg: "#343654",      // Darker background for user's messages
                                            txt: "#ffffff",     // White text for user's messages
                                        },
                                    },
                                },
                                avatar: {
                                    bg: "#6a0dad",          // Dark purple avatar background
                                    sh: "0 2px 5px rgba(0, 0, 0, 0.3)",  // Subtle shadow for avatars
                                },
                                notificationBar: {
                                    bg: "#27293d",          // Dark blue notification bar background
                                    txt: "#eaeaea",         // Light gray text
                                },
                            }
                        },
                        onUserIdentified: async (userId: string) => {
                            if (globalID.agent != null && globalID.principalId != null) {
                                const actor = Actor.createActor(idlFactory, {
                                    agent: globalID.agent,
                                    canisterId,
                                })
                                await actor.addOCProfile(globalID.principalId, userId);

                                const actorIndex = Actor.createActor(idlFactoryIndex, {
                                    agent: globalID.agent,
                                    canisterId: IndexCanisterId,
                                });

                                const projects = await actorIndex.getAllProjectMissions() as SerializedProjectMissions[];
                                const targets: string[] = projects.map(project => project.canisterId.toText());

                                if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null) {
                                    toast('A new project has been added to Konecta! Refreshing the page...', { icon: '👀' });
                                    disconnect();
                                    window.location.href = '/konnect';
                                } else {
                                    const mappedProjects: ProjectData[] = projects.map((project) => ({
                                        id: project.canisterId.toText(),
                                        name: project.name,
                                        icon: project.icon,
                                    }));

                                    globalID.setProjects(mappedProjects);
                                    const actors = targets.map(targetCanisterId => {
                                        return Actor.createActor(idlFactoryDefault, {
                                            agent: globalID.agent!,
                                            canisterId: targetCanisterId,
                                        });
                                    });
                                    fetchData.fetchAll(actor, actors, actorIndex, targets, globalID.principalId, setPlacestate, setPlacestate);
                                }

                            }
                        },
                        settings: {
                            disableLeftNav: true
                        }
                    });
                } catch (error) {
                    console.error('Error initializing OpenChat:', error);
                }
            };

            initOpenChat();
        }
    }, [globalID.agent, globalID.principalId]);

    return <iframe
        id="openchat-iframe"
        title="OpenChat"
        style={{
            width: '100%',
            height: '100%',
            border: "1px solid #ccc",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        }}></iframe>;
};

export default OpenChat;
