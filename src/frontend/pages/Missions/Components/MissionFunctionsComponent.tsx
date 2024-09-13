import { Actor } from "@dfinity/agent";
import { canisterId, idlFactory } from "../../../../declarations/backend/index.js";

const MissionFunctionsComponent = {
    followKonecta: async (globalID: any, navigate: any, fetchData: any) => {

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

            const handleEvent = (event: MessageEvent<any>) => {
                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result) {
                    alert("Success!")
                } else {
                    alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                }

                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();

                navigate("/");
            }

            window.addEventListener("message", handleEvent);
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    verifyPFP: async (globalID: any, navigate: any, fetchData: any) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent,
            canisterId,
        })
        if (globalID.userPFPstatus === "false") {
            globalID.setPFPstatus = await fetchData.fetchUserPFPstatus(actor, globalID.principalId);
            alert("PFP status not verified. Please upload your updated profile picture or wait for manual verification if you already did.");
        } else {
            alert("PFP status sucessfully set. You will soon be manually verified");
        }
        navigate("/");
    },

    verifyPFPTW: async (globalID: any, navigate: any, fetchData: any) => {
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

            const handleEvent = (event: MessageEvent<any>) => {
                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result) {
                    alert("Success!")
                } else {
                    alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                }
                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();

                navigate("/");
            }

            window.addEventListener("message", handleEvent);
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    vfTweet: async (globalID: any, navigate: any, fetchData: any) => {

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

            const handleEvent = (event: MessageEvent<any>) => {
                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result === 'true') {
                    alert("Success!")
                } else {
                    if (result === 'notw') {
                        alert("No Tweet Found!")
                    } else {
                        alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                    }
                }
                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();

                navigate("/");
            }

            window.addEventListener("message", handleEvent);

        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    verRT: async (globalID: any, navigate: any, fetchData: any) => {

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
            const handleEvent = (event: MessageEvent<any>) => {
                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken, result } = event.data;
                if (result) {
                    alert("Success!")
                } else {
                    alert("We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.")
                }
                window.removeEventListener("message", handleEvent);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();

                navigate("/");
            }

            window.addEventListener("message", handleEvent);
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    sendKamiDM: async (globalID: any, navigate: any, fetchData: any) => {
        const url = 'https://x.com/messages/compose?recipient_id=1828134613375488000&text=Kami%2C%20I%27m%20on%20a%20mission%20for%20a%20killer%20profile%20pic.%20Let%E2%80%99s%20make%20it%20happen!';
        window.open(url, '_blank');
    },
};

export default MissionFunctionsComponent;
