import React, { useEffect, useState } from 'react';
import { initialise } from '@open-ic/openchat-xframe';
import { Actor } from '@dfinity/agent';
import { idlFactory } from '../declarations/backend/backend.did.js';
import { ProjectData, useGlobalID } from '../hooks/globalID.tsx';
import { canisterId } from '../declarations/backend/index.js';
import useFetchData from '../hooks/fetchData.tsx';
import { useIdentityKit } from '@nfid/identitykit/react';
import { useNavigate } from 'react-router-dom';
import { idlFactory as idlFactoryIndex, SerializedProjectMissions } from '../declarations/index/index.did.js';
import { idlFactory as idlFactoryDefault } from '../declarations/dfinity_backend/index.js';
import { IndexCanisterId } from '../frontend/main.tsx';
import { toast } from 'react-hot-toast';

const canisterIdDFINITY = "2mg2s-uqaaa-aaaag-qna5a-cai";

const OpenChatDF: React.FC = () => {
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
                        initialPath: '/community/sivm5-eaaaa-aaaar-asa7a-cai/channel/208896203006608744731322754078783145118',
                        theme: {
                            name: 'konecta',
                            base: 'dark',
                            overrides: {
                                bg: "#1a1a2e",            // Dark blue background (unchanged for depth)
                                txt: "#EBB351",           // Updated to vibrant gold for better contrast and visibility
                                primary: "#4D00F1",       // Primary color updated to a vivid purple (#4D00F1)
                                placeholder: "#4400D5",   // Placeholder color set to a slightly darker purple (#4400D5)
                                bd: "#4100CB",            // Border color updated to a deep purple (#4100CB)
                                "txt-light": "#3B00B9",   // Lighter text color adjusted to a medium purple (#3B00B9)
                                accent: "#3500A7",        // Accent color updated to a rich purple (#3500A7)

                                button: {
                                    bg: "#4D00F1",          // Button background set to primary purple (#4D00F1)
                                    hv: "#4400D5",          // Hover state slightly darker purple (#4400D5)
                                    txt: "#ffffff",         // White button text for clear readability
                                    sh: "0 2px 5px rgba(0, 0, 0, 0.3)",  // Subtle shadow remains for depth
                                },

                                input: {
                                    bg: "#22223b",          // Darker blue input background remains for contrast
                                    bd: "#4100CB",          // Input border set to deep purple (#4100CB)
                                    sh: "0 0 5px rgba(106, 13, 173, 0.5)", // Soft purple shadow remains
                                },

                                timeline: {
                                    txt: "#3B00B9",         // Lighter purple text in the timeline (#3B00B9)
                                    bg: "#1a1a2e",          // Timeline background remains dark blue
                                },

                                chatSummary: {
                                    "bg-selected": "#27293d", // Slightly darker background when selected remains
                                    hv: "#343654",          // Darker hover effect remains
                                    del: "#4100CB",         // Delete option updated to deep purple (#4100CB)
                                },

                                modal: {
                                    bg: "#22223b",          // Dark blue modal background remains
                                    bd: "#4100CB",          // Modal border set to deep purple (#4100CB)
                                    sh: "0 0 10px rgba(0, 0, 0, 0.7)",  // Heavier shadow remains for prominence
                                },

                                scrollbar: {
                                    bg: "#27293d",          // Dark blue scrollbar remains
                                },

                                currentChat: {
                                    msgs: {
                                        bg: "#1a1a2e",        // Background for messages remains dark blue
                                    },
                                    msg: {
                                        bg: "#2a2d44",        // Slightly lighter dark blue for individual messages remains
                                        txt: "#EBB351",       // Light gray text updated to vibrant gold (#EBB351)
                                        me: {
                                            bg: "#343654",      // Darker background for user's messages remains
                                            txt: "#ffffff",     // White text for user's messages remains
                                        },
                                    },
                                },

                                avatar: {
                                    bg: "#4D00F1",          // Avatar background updated to primary purple (#4D00F1)
                                    sh: "0 2px 5px rgba(0, 0, 0, 0.3)",  // Subtle shadow remains for avatars
                                },

                                notificationBar: {
                                    bg: "#27293d",          // Dark blue notification bar background remains
                                    txt: "#EBB351",         // Light gray text updated to vibrant gold (#EBB351)
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

export default OpenChatDF;
