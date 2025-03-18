import { Actor } from "@dfinity/agent";
import { canisterId, idlFactory } from "../../../../declarations/backend/index.js";
import { idlFactory as idlFactoryNFID, canisterId as canisterIdNFID } from '../../../../declarations/nfid/index.js';
import { idlFactory as idlFactoryDFINITY } from '../../../../declarations/dfinity_backend/index.js';
import { idlFactory as idlFactoryOisy } from '../../../../declarations/oisy_backend/index.js';
import { idlFactory as idlFactoryMP } from '../../../../declarations/mushroom_backend/index.js';
import { idlFactory as idlFactoryDiggy } from '../../../../declarations/diggy_backend/index.js';
import { Usergeek } from "usergeek-ic-js";
import { idlFactory as idlFactoryIndex, SerializedProjectMissions } from '../../../../declarations/index/index.did.js';
import { idlFactory as idlFactoryDefault } from '../../../../declarations/dfinity_backend/index.js';
import { Principal } from "@dfinity/principal";

const canisterIdDFINITY = "2mg2s-uqaaa-aaaag-qna5a-cai";
const canisterIdOISY = "eyark-fqaaa-aaaag-qm7oa-cai";
const canisterIdMP = "wfguo-oiaaa-aaaag-qngma-cai";

const MissionFunctionsComponent = {
    followKonecta: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {

        let principal = globalID.principalId;

        try {
            const response = await fetch("https://do.konecta.one/requestTwitterAuth-v2-follow/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ principal }),
            });

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            let authSuccess = false;

            const handleEvent = (event: MessageEvent<any>) => {

                if (authSuccess) return;

                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result === 'true') {
                    Usergeek.trackEvent("Mission 1: Follow");
                    alert("Success!")
                } else {
                    if (result === 'false') {
                        alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                    } else {
                        alert("You can't use the same twitter account in two different principals.")
                    }
                }

                authSuccess = true;

                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })

                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });

                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })

                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });

                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);

                setLoading(false);
                closeModal();
            }


            window.addEventListener("message", handleEvent);



            const popupInterval = setInterval(() => {
                if (popup && popup.closed && !authSuccess) {
                    clearInterval(popupInterval);
                    setLoading(false);
                    alert("You closed the Twitter authorization window.");
                }
            }, 300);

        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    verifyPFP: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent,
            canisterId,
        })
        if (globalID.userPFPstatus !== "loading") {
            globalID.setPFPstatus = await fetchData.fetchUserPFPstatus(actor, globalID.principalId);
            alert("PFP status not verified. Please upload your updated profile picture to your twitter profile or wait for manual verification if you already did.");
        } else {
            alert("PFP status already set successfully. You will soon be manually verified");
        }

        const actorIndex = Actor.createActor(idlFactoryIndex, {
            agent: globalID.agent,
            canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
        });

        actorIndex.getAllProjectMissions()
            .then((result) => {
                const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                const targets: string[] = projects.map(project => project.canisterId.toText());
                if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                    alert("A new project has been added to Konecta! Refreshing the page...");
                    disconnect();
                    navigate('/konnect');
                }
            })

        const actors = globalID.canisterIds.map((targetCanisterId: string) => {
            return Actor.createActor(idlFactoryDefault, {
                agent: globalID.agent,
                canisterId: targetCanisterId,
            });
        });

        fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
        setLoading(false);
        closeModal();
    },

    verifyPFPTW: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {
        const principal = globalID.principalId;
        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2-pfp-tweet",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ principal }),
                }
            );

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            let authSuccess = false;

            const handleEvent = (event: MessageEvent<any>) => {

                if (authSuccess) return;

                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result === 'true') {
                    alert("Success!")
                    Usergeek.trackEvent("Mission 3: PFP Tweet");
                } else {
                    if (result === 'notw') {
                        alert("No Tweet Found!")
                    } else {
                        alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                    }
                }

                authSuccess = true;

                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });

                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })

                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });

                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                setLoading(false);
                closeModal();
            }

            window.addEventListener("message", handleEvent);



            const popupInterval = setInterval(() => {
                if (popup && popup.closed && !authSuccess) {
                    clearInterval(popupInterval);
                    setLoading(false);
                    alert("You closed the Twitter authorization window.");
                }
            }, 300);
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    vfTweet: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {

        const principal = globalID.principalId;
        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2-vft",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ principal }),
                }
            );

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            let authSuccess = false;

            const handleEvent = (event: MessageEvent<any>) => {

                if (authSuccess) return;

                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result === 'true') {
                    alert("Success!")
                    Usergeek.trackEvent("Mission 4: Tweet");
                } else {
                    if (result === 'notw') {
                        alert("No Tweet Found!")
                    } else {
                        alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                    }
                }

                authSuccess = true;

                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });

                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })

                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });

                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                setLoading(false);
                closeModal();
            }

            window.addEventListener("message", handleEvent);



            const popupInterval = setInterval(() => {
                if (popup && popup.closed && !authSuccess) {
                    clearInterval(popupInterval);
                    setLoading(false);
                    alert("You closed the Twitter authorization window.");
                }
            }, 300);
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    verRT: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, input: any, setPlacestate: any, disconnect: any) => {

        const principal = globalID.principalId;

        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2-trt",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ principal }),
                }
            );

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            let authSuccess = false;

            const handleEvent = (event: MessageEvent<any>) => {

                if (authSuccess) return;

                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result) {
                    alert("Success!")
                    Usergeek.trackEvent("Mission 5: Retweet");
                } else {
                    alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                }

                authSuccess = true;

                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });

                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })

                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });

                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                setLoading(false);
                if (input != 'a') {
                    closeModal();
                }
            }

            window.addEventListener("message", handleEvent);

            const popupInterval = setInterval(() => {
                if (popup && popup.closed && !authSuccess) {
                    clearInterval(popupInterval);
                    setLoading(false);
                    alert("You closed the Twitter authorization window.");
                }
            }, 300);
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    verMRT: async (globalID: any, navigate: any, fetchData: any, setLoading: any, _closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {

        const principal = globalID.principalId;

        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2-trtm",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ principal }),
                }
            );

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            let authSuccess = false;

            const handleEvent = (event: MessageEvent<any>) => {

                if (authSuccess) return;

                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result) {
                    alert("Success!")
                    Usergeek.trackEvent("Mission 7 Part 2: Retweet");
                } else {
                    alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                }

                authSuccess = true;

                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });

                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })

                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });

                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                setLoading(false);
            }

            window.addEventListener("message", handleEvent);



            const popupInterval = setInterval(() => {
                if (popup && popup.closed && !authSuccess) {
                    clearInterval(popupInterval);
                    setLoading(false);
                    alert("You closed the Twitter authorization window.");
                }
            }, 300);
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    sendKamiDM: async (globalID: any, _navigate: any, _fetchData: any, setLoading: any, _closeModal: any, _missionid: any, _input: any, _setPlacestate: any, _disconnect: any) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent,
            canisterId,
        })
        const a = await actor.setPFPProgressLoading(globalID.principalId);
        const url = 'https://x.com/messages/compose?recipient_id=1828134613375488000&text=Kami%2C%20I%27m%20on%20a%20mission%20for%20a%20killer%20profile%20pic.%20Let%E2%80%99s%20make%20it%20happen!';
        window.open(url, '_blank');
        setLoading(false);
    },

    twPFP: async (_globalID: any, _navigate: any, _fetchData: any, setLoading: any, _closeModal: any, _missionid: any, _input: any, _setPlacestate: any, _disconnect: any) => {
        const url = 'https://twitter.com/intent/tweet?text=Leveling%20up%20my%20profile%20with%20%23KonectaPFP%21%20Time%E2%80%99s%20on%20my%20side%20now.%20%24ICP%20%E2%8F%B3';
        window.open(url, '_blank');
        setLoading(false);
    },

    gTW: async (_globalID: any, _navigate: any, _fetchData: any, setLoading: any, _closeModal: any, _missionid: any, _input: any, _setPlacestate: any, _disconnect: any) => {
        const url = 'https://twitter.com/intent/tweet';
        window.open(url, '_blank');
        setLoading(false);
    },

    submitCode: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any, setPlacestate: any, disconnect: any) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent,
            canisterId,
        })



        const a = await actor.submitCode(globalID.principalId, missionid, input);
        if (a) {
            alert("Success");
            const actorIndex = Actor.createActor(idlFactoryIndex, {
                agent: globalID.agent,
                canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
            });

            actorIndex.getAllProjectMissions()
                .then((result) => {
                    const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                    const targets: string[] = projects.map(project => project.canisterId.toText());
                    if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                        alert("A new project has been added to Konecta! Refreshing the page...");
                        disconnect();
                        navigate('/konnect');
                    }
                })

            const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                return Actor.createActor(idlFactoryDefault, {
                    agent: globalID.agent,
                    canisterId: targetCanisterId,
                });
            });

            fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
            setLoading(false);
            closeModal();
        } else {
            alert("Invalid Code");
            setLoading(false);
        }

    },

    nuanceMission: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, input: any, setPlacestate: any, disconnect: any) => {

        const principal = globalID.principalId;

        try {
            const response = await fetch(
                "https://do.konecta.one/nuance",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        principal,
                        input,
                    }),
                }
            );

            const data = await response.json();
            if (data.message === "Success") {
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });

                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })

                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });

                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                alert(data.message);
                Usergeek.trackEvent("Mission 9 : Nuance Follow");
                setLoading(false);
                navigate('/');
                closeModal();
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error("Error trying to communicate with Nuance", error);
        }

        setLoading(false);
    },

    discordMission: async (globalID: any, _fetchData: any, setLoading: any, _setPlacestate: any, setDiscordVerified: any) => {
        const principal = globalID.principalId;

        try {
            const response = await fetch("https://do.konecta.one/requestDiscordAuth/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ principal }),
            });

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "DiscordAuth", "width=600,height=800");

            let authSuccess = false;

            const handleEvent = (event: MessageEvent<any>) => {

                if (authSuccess) return;

                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result === 'true') {
                    alert("Success!")
                    setDiscordVerified(true);
                } else {
                    if (result === 'error') {
                        alert("We broke the roof! Discord API has reached its limit for our Dev account. Please try again later.")
                    } else {
                        if (result === 'fake') {
                            alert("You can't use the same discord account in two different principals.")
                        }
                        alert("User is not a member of the Discord Server")
                    }
                }

                authSuccess = true;

                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
                const actorNFID = Actor.createActor(idlFactoryNFID, {
                    agent: globalID.agent,
                    canisterId: canisterIdNFID,
                });

                //fetchData.fetchAllNfid(actor, actorNFID, globalID.principalId, setPlacestate, setPlacestate, setPlacestate);
                setLoading(false);
            }

            window.addEventListener("message", handleEvent);

            const popupInterval = setInterval(() => {
                if (popup && popup.closed && !authSuccess) {
                    clearInterval(popupInterval);
                    setLoading(false);
                    alert("You closed the Discord authorization window.");
                }
            }, 300);

        } catch (error) {
            console.error("Error fetching Discord auth URL:", error);
        }
    },
    /*
        dfinityFollowTW: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {
    
            const principal = globalID.principalId;
            try {
                const response = await fetch("https://do.konecta.one/requestTwitterAuth-v2-follow-df/", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ principal }),
                });
    
                const data = await response.json();
                const authURL = data.authURL;
    
                const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");
    
                let authSuccess = false;
    
                const handleEvent = (event: MessageEvent<any>) => {

                if (authSuccess) return;

                    if (event.origin !== "https://do.konecta.one") return;
    
                    const { accessToken, refreshToken, result } = event.data;
                    if (result === 'true') {
                        Usergeek.trackEvent("Dfinity Mission Three: Follow");
                        alert("Success!")
                    } else {
                        if (result === 'false') {
                            alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                        } else {
                            alert("You can't use the same twitter account in two different principals.")
                        }
                    }
    
                    authSuccess = true;
    
                    window.removeEventListener("message", handleEvent);
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);
    
                    popup?.close();
                    const actor = Actor.createActor(idlFactoryDFINITY, {
                        agent: globalID.agent,
                        canisterId: canisterIdDFINITY,
                    })
                    const actorIndex = Actor.createActor(idlFactoryIndex, {
                        agent: globalID.agent,
                        canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                    });
    
                    actorIndex.getAllProjectMissions()
                        .then((result) => {
                            const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                            const targets: string[] = projects.map(project => project.canisterId.toText());
                            if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                                alert("A new project has been added to Konecta! Refreshing the page...");
                                disconnect();
                                navigate('/konnect');
                            }
                        })
    
                    const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                        return Actor.createActor(idlFactoryDefault, {
                            agent: globalID.agent,
                            canisterId: targetCanisterId,
                        });
                    });
    
                    fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                    setLoading(false);
                    closeModal();
                }
    
    
                window.addEventListener("message", handleEvent);
    
    
    
                const popupInterval = setInterval(() => {
                    if (popup && popup.closed && !authSuccess) {
                        clearInterval(popupInterval);
                        setLoading(false);
                        alert("You closed the Twitter authorization window.");
                    }
                }, 300);
    
            } catch (error) {
                console.error("Error fetching Twitter auth URL:", error);
            }
        },
    
        dfinityMissionOne: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, input: any, setPlacestate: any, disconnect: any) => {
            const actor = Actor.createActor(idlFactoryDFINITY, {
                agent: globalID.agent,
                canisterId: canisterIdDFINITY,
            })
            const a = await actor.missionOne(globalID.principalId, input);
            if (a === "Success") {
                Usergeek.trackEvent("Dfinity Mission One: Hello World");
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });
    
                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })
    
                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });
    
                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                alert(a);
                setLoading(false);
                closeModal();
            } else {
                alert(a);
                setLoading(false);
            }
        },
    
        dfinityMissionTwo: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, input: any, setPlacestate: any, disconnect: any) => {
            const actor = Actor.createActor(idlFactoryDFINITY, {
                agent: globalID.agent,
                canisterId: canisterIdDFINITY,
            })
            const a = await actor.missionTwo(globalID.principalId, input);
            if (a === "Success") {
                Usergeek.trackEvent("Dfinity Mission Two: Inter-Canister Call");
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });
    
                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })
    
                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });
    
                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                alert(a);
                setLoading(false);
                closeModal();
            } else {
                alert(a);
                setLoading(false);
            }
        },
    
        dfinityDiscord: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {
            const principal = globalID.principalId;
    
            try {
                const response = await fetch("https://do.konecta.one/requestDiscordAuthDF/", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ principal }),
                });
    
                const data = await response.json();
                const authURL = data.authURL;
    
                const popup = window.open(authURL, "DiscordAuth", "width=600,height=800");
    
                let authSuccess = false;
    
                const handleEvent = (event: MessageEvent<any>) => {

                if (authSuccess) return;

                    if (event.origin !== "https://do.konecta.one") return;
    
                    const { accessToken, refreshToken, result } = event.data;
                    if (result === 'true') {
                        alert("Success!")
                        const actor = Actor.createActor(idlFactoryDFINITY, {
                            agent: globalID.agent,
                            canisterId: canisterIdDFINITY,
                        })
                        const actorIndex = Actor.createActor(idlFactoryIndex, {
                            agent: globalID.agent,
                            canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                        });
    
                        actorIndex.getAllProjectMissions()
                            .then((result) => {
                                const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                                const targets: string[] = projects.map(project => project.canisterId.toText());
                                if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                                    alert("A new project has been added to Konecta! Refreshing the page...");
                                    disconnect();
                                    navigate('/konnect');
                                }
                            })
    
                        const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                            return Actor.createActor(idlFactoryDefault, {
                                agent: globalID.agent,
                                canisterId: targetCanisterId,
                            });
                        });
    
                        fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                        setLoading(false);
                        closeModal();
                    } else {
                        if (result === 'error') {
                            alert("We broke the roof! Discord API has reached its limit for our Dev account. Please try again later.")
                        } else {
                            if (result === 'fake') {
                                alert("You can't use the same discord account in two different principals.")
                            }
                            alert("User is not a member of the Discord Server")
                        }
                    }
    
                    authSuccess = true;
                    popup?.close();
                    setLoading(false);
                }
    
                window.addEventListener("message", handleEvent);
    
                const popupInterval = setInterval(() => {
                    if (popup && popup.closed && !authSuccess) {
                        clearInterval(popupInterval);
                        setLoading(false);
                        alert("You closed the Discord authorization window.");
                    }
                }, 300);
            } catch (error) {
                console.error("Error fetching Discord auth URL:", error);
            }
        },
        dfinityOpenChat: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {
            const actor = Actor.createActor(idlFactoryDFINITY, {
                agent: globalID.agent,
                canisterId: canisterIdDFINITY,
            })
            const a = await actor.missionOpenChat(globalID.principalId);
            if (a === "Success") {
                Usergeek.trackEvent("Dfinity Mission Five: OpenChat");
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });
    
                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })
    
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
    
                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });
    
                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                alert(a);
                setLoading(false);
                closeModal();
            } else {
                alert(a);
                setLoading(false);
            }
        },
    
        verifyOisyICP: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {
            const actor = Actor.createActor(idlFactoryOisy, {
                agent: globalID.agent,
                canisterId: canisterIdOISY,
            })
            const a = await actor.verifyOisyICP(globalID.principalId);
            if (a === "Success") {
                Usergeek.trackEvent("Oisy Mission One: Have ICP on Oisy");
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });
    
                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })
    
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
    
                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });
    
                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                alert(a);
                setLoading(false);
                closeModal();
    
            } else {
                alert(a);
                setLoading(false);
            };
        },
    
        verifyOisyOG: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {
            const actor = Actor.createActor(idlFactoryOisy, {
                agent: globalID.agent,
                canisterId: canisterIdOISY,
            })
            const a = await actor.verifyOisyOG(globalID.principalId);
            if (a === "Success") {
                Usergeek.trackEvent("Oisy Mission Two: Be an Oisy OG");
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });
    
                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })
    
                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });
    
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
    
                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                alert(a);
                setLoading(false);
                closeModal();
    
            } else {
                alert(a);
                setLoading(false);
            };
        },
        
           verNFTMP: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {
               const actor = Actor.createActor(idlFactoryMP, {
                   agent: globalID.agent,
                   canisterId: canisterIdMP,
               })
               const a = await actor.nftMission(globalID.principalId);
       
               if (a === "Success") {
                   Usergeek.trackEvent("Mushroom Protocol Mission One: NFT");
                   const actorIndex = Actor.createActor(idlFactoryIndex, {
                       agent: globalID.agent,
                       canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                   });
       
                   actorIndex.getAllProjectMissions()
                       .then((result) => {
                           const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                           const targets: string[] = projects.map(project => project.canisterId.toText());
                           if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                               alert("A new project has been added to Konecta! Refreshing the page...");
                               disconnect();
                               navigate('/konnect');
                           }
                       })
       
                   const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                       return Actor.createActor(idlFactoryDefault, {
                           agent: globalID.agent,
                           canisterId: targetCanisterId,
                       });
                   });
       
                   const actor = Actor.createActor(idlFactory, {
                       agent: globalID.agent,
                       canisterId,
                   })
       
                   fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                   alert(a);
                   setLoading(false);
                   closeModal();
       
               } else {
                   alert(a);
                   setLoading(false);
               };
           },
          
           goICPandaMission: async (_globalID: any, _navigate: any, _fetchData: any, setLoading: any, _closeModal: any, _missionid: any, _input: any) => {
               const url = 'https://twitter.com/intent/tweet?in_reply_to=1890856928701460621';
               window.open(url, '_blank');
               setLoading(false);
           },
       
           verifyICPandaMission: async (_globalID: any, navigate: any, _fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any) => {
               alert("You will be verified soon. Please wait for the manual verification process to complete.");
               setLoading(false);
               navigate('/Missions');
               closeModal();
           },
           */

    preVerifyDiggy: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, input: any, setPlacestate: any, _disconnect: any) => {

        const validateInput = (input: string): string | null => {
            const sanitized = input.replace(/\s+/g, '').toLowerCase();
            const regex = /^(?:[a-z0-9]{5}-){10}[a-z0-9]{3}$/;
            return regex.test(sanitized) ? sanitized : null;
        };

        const validInput = validateInput(input);
        if (!validInput) {
            alert("Invalid Diggy Principal.");
            setLoading(false);
            return;
        }

        const actor = Actor.createActor(idlFactoryDiggy, {
            agent: globalID.agent,
            canisterId: "sixqu-5iaaa-aaaag-qngwa-cai",
        })
        const a = await actor.preRegisterMission(globalID.principalId, Principal.fromText(validInput));

        if (a === "Success") {
            Usergeek.trackEvent("Diggy Mission One: PreRegister Validation");
            const actorIndex = Actor.createActor(idlFactoryIndex, {
                agent: globalID.agent,
                canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
            });

            actorIndex.getAllProjectMissions()
                .then((result) => {
                    const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                    const targets: string[] = projects.map(project => project.canisterId.toText());
                    if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                        alert("A new project has been added to Konecta! Refreshing the page...");
                        navigate('/konnect');
                    }
                })

            const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                return Actor.createActor(idlFactoryDefault, {
                    agent: globalID.agent,
                    canisterId: targetCanisterId,
                });
            });

            const actor = Actor.createActor(idlFactory, {
                agent: globalID.agent,
                canisterId,
            })

            fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
            alert(a);
            setLoading(false);
            closeModal();
        } else {
            alert(a);
            setLoading(false);
        };
    },
    tweetDiggy: async (_globalID: any, _navigate: any, _fetchData: any, setLoading: any, _closeModal: any, _missionid: any, _input: any) => {
        window.open("https://x.com/intent/tweet?text=%F0%9F%9A%A8EXCLUSIVE%20ACCESS%20%2B%20FREE%20GOLD%F0%9F%9A%A8%0A%0AI%20pre-registered%20at%20%40diggycoin_%20and%20earned%20%23GOLD%F0%9F%AA%99%0A%0ANow%20I%E2%80%99ll%20play%20the%20exclusive%20game%20launch%20and%20earn%20$DIGGY%20%F0%9F%8E%AE%0A%0AYou%20can%20too!%20Pre-register%20now%2C%20claim%2050%20FREE%20GOLD%2C%20and%20unlock%20up%20to%20200%20GOLD!%F0%9F%AB%B5%0A%0ALimited%20spots%20available%20%F0%9F%98%B1%20%F0%9F%91%87%0Ahttps%3A%2F%2Ftz5ol-faaaa-aaaag-qngtq-cai.icp0.io%2Ffree-gold", '_blank');
        setLoading(false);
    },
    preVerifyDiggyTweet: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, _missionid: any, _input: any, setPlacestate: any, disconnect: any) => {

        const principal = globalID.principalId;
        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2-diggyF",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ principal }),
                }
            );

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            let authSuccess = false;

            const handleEvent = (event: MessageEvent<any>) => {

                if (authSuccess) return;

                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;

                if (result === 'true') {
                    alert("Success!")
                    Usergeek.trackEvent("DIGGY Mission 1: Tweet");
                } else {
                    if (result === 'notw') {
                        alert("No Tweet Found!")
                    } else {
                        alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                    }
                }

                authSuccess = true;

                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent,
                    canisterId,
                })
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });

                actorIndex.getAllProjectMissions()
                    .then((result) => {
                        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
                        const targets: string[] = projects.map(project => project.canisterId.toText());
                        if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                            alert("A new project has been added to Konecta! Refreshing the page...");
                            disconnect();
                            navigate('/konnect');
                        }
                    })

                const actors = globalID.canisterIds.map((targetCanisterId: string) => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent,
                        canisterId: targetCanisterId,
                    });
                });

                fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);
                setLoading(false);
                closeModal();
            }

            window.addEventListener("message", handleEvent);

            const popupInterval = setInterval(() => {
                if (popup && popup.closed && !authSuccess) {
                    clearInterval(popupInterval);
                    setLoading(false);
                    alert("You closed the Twitter authorization window.");
                }
            }, 300);
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },
};

export default MissionFunctionsComponent;