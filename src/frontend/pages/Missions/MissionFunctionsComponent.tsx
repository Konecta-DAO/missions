import { Actor } from "@dfinity/agent";
import { idlFactory, canisterId } from "../../../declarations/backend/index.js";
import { useNavigate } from "react-router-dom";
import { FetchData } from "../../../hooks/fetchData.tsx";

const MissionFunctionsComponent = {
    followKonecta: async (globalID: any) => {
        const navigate = useNavigate();
        const principal = globalID.principalId;

        try {
            const response = await fetch("https://do.konecta.one/requestTwitterAuth-v2/", {
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

            window.addEventListener("message", (event) => {
                if (event.origin !== "https://do.konecta.one") return;

                const { accessToken, refreshToken } = event.data;

                // Track user progress with Usergeek
                console.log("User progress tracked.");

                // Store tokens in localStorage
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                // Close popup and navigate back
                popup?.close();
                navigate("/");
            });
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    verifyPFP: async (globalID: any) => {
        const fetchData = FetchData();
        const navigate = useNavigate();

        if (!fetchData) {
            throw new Error("FetchData is not defined");
        }

        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent,
            canisterId,
        });

        if (globalID.agent !== null) {
            const principal = await globalID.agent.getPrincipal();
            const pfpStatus = await fetchData.fetchUserPFPstatus(actor, principal);

            if (pfpStatus === "verified") {
                console.log("PFP successfully verified.");
                // Track event with Usergeek
                console.log("Mission 2: PFP Verified");
                navigate("/");
            } else if (globalID.userPFPstatus === "loading") {
                alert("PFP status is loading. Please wait.");
            }
        }
    },

    verifyPFPTW: async (globalID: any) => {
        const navigate = useNavigate();

        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2-pfp",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            window.addEventListener("message", (event) => {
                if (event.origin !== "https://do.konecta.one") return;

                const { result } = event.data;

                if (result) {
                    console.log("Mission 3: PFP Verified (Twitter)");
                    popup?.close();
                    navigate("/");
                } else {
                    alert("You have not tweeted the message yet.");
                }
            });
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },


    vfTweet: async (globalID: any) => {
        const navigate = useNavigate();

        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2-vft",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            window.addEventListener("message", (event) => {
                if (event.origin !== "https://do.konecta.one") return;

                const { result } = event.data;

                if (result) {
                    console.log("Mission 4: Tweet Verified");
                    popup?.close();
                    navigate("/");
                } else {
                    alert("You have not tweeted the message yet.");
                }
            });
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },
    verRT: async (globalID: any) => {
        const navigate = useNavigate();

        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2-trt",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            window.addEventListener("message", (event) => {
                if (event.origin !== "https://do.konecta.one") return;

                const { result } = event.data;

                if (result) {
                    console.log("Mission 5: Retweet Verified");
                    popup?.close();
                    navigate("/");
                } else {
                    alert("You have not retweeted the message yet.");
                }
            });
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },
};

export default MissionFunctionsComponent;
