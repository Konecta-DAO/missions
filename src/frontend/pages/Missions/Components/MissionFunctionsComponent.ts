import { Actor } from "@dfinity/agent";
import { canisterId, idlFactory } from "../../../../declarations/backend/index.js";
import { Console } from "console";
import { Usergeek } from "usergeek-ic-js";

const MissionFunctionsComponent = {
    followKonecta: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any, setPlacestate: any) => {

        const principal = globalID.principalId;
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
                fetchData.fetchAll(actor, globalID.principalId, setPlacestate, setPlacestate);
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

    verifyPFP: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any, setPlacestate: any) => {
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
        await fetchData.fetchAll(actor, globalID.principalId, setPlacestate, setPlacestate);
        setLoading(false);
        closeModal();
    },

    verifyPFPTW: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any, setPlacestate: any) => {
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
                fetchData.fetchAll(actor, globalID.principalId, setPlacestate, setPlacestate);
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

    vfTweet: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any, setPlacestate: any) => {

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
                fetchData.fetchAll(actor, globalID.principalId, setPlacestate, setPlacestate);
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

    verRT: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any, setPlacestate: any) => {

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
                fetchData.fetchAll(actor, globalID.principalId, setPlacestate, setPlacestate);
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

    sendKamiDM: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any, setPlacestate: any) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent,
            canisterId,
        })
        const a = await actor.setPFPProgressLoading(globalID.principalId);
        const url = 'https://x.com/messages/compose?recipient_id=1828134613375488000&text=Kami%2C%20I%27m%20on%20a%20mission%20for%20a%20killer%20profile%20pic.%20Let%E2%80%99s%20make%20it%20happen!';
        window.open(url, '_blank');
    },

    twPFP: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any, setPlacestate: any) => {
        const url = 'https://twitter.com/intent/tweet?text=Leveling%20up%20my%20profile%20with%20%23KonectaPFP%21%20Time%E2%80%99s%20on%20my%20side%20now.%20%24ICP%20%E2%8F%B3';
        window.open(url, '_blank');
    },

    gTW: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any) => {
        const url = 'https://twitter.com/intent/tweet';
        window.open(url, '_blank');
    },

    submitCode: async (globalID: any, navigate: any, fetchData: any, setLoading: any, closeModal: any, missionid: any, input: any, setPlacestate: any) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent,
            canisterId,
        })

        if (missionid != 7) {
            const a = await actor.submitCode(globalID.principalId, missionid, input);
            if (a) {
                alert("Success");
                await fetchData.fetchAll(actor, globalID.principalId, setPlacestate, setPlacestate);
                setLoading(false);
                closeModal();
            } else {
                alert("Invalid Code");
                setLoading(false);
            }

        } else {
            const b = await actor.isOc(globalID.principalId);
            alert(b);
            if (b === "Success") {
                const a = await actor.submitCode(globalID.principalId, missionid, input);
                await fetchData.fetchAll(actor, globalID.principalId, setPlacestate, setPlacestate);
                setLoading(false);
                closeModal();
            } else {
                setLoading(false);
            }
        }

    },
};

export default MissionFunctionsComponent;
