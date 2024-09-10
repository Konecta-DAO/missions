import { SerializedProgress, SerializedMissionRecord } from "../../../declarations/backend/backend.did.js";
import { randomBetween, getCurrentTimestampInNanoSeconds } from "../../../components/Utilities.tsx";
import { Usergeek } from "usergeek-ic-js";
import { Button, Modal } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalID } from "../../../hooks/globalID.tsx";
import { useMissionAssistant } from "../../../hooks/missionAssistant.tsx";
import { useFetchData } from "../../../hooks/fetchData.tsx";

const navigate = useNavigate();

interface UserData {
    userId: string;
    userHandle: string;
    accessToken: string;
    refreshToken: string;
}

interface UserData3 {

    result: boolean;
}

const MissionFunctionsComponent = {
    followKonecta: async () => {
        const principal = useGlobalID().principalId;
        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2/",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        principal,
                    }),

                }
            );

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, "TwitterAuth", "width=600,height=800");

            window.addEventListener("message", async (event) => {
                if (event.origin !== "https://do.konecta.one") {
                    return;
                }

                const { userId, userHandle, accessToken, refreshToken } = event.data as UserData;

                //useMissionAssistant().addTwitterInfo(BigInt(userId), userHandle);

                //const missionRecord: SerializedMissionRecord = {
                //  pointsEarned: randomBetween(Number(useGlobalID().missions[1].mintime), Number(useGlobalID().missions[1].maxtime)),
                //timestamp: getCurrentTimestampInNanoSeconds(),
                //tweetId: [], // Empty tweet ID
                //};

                //const serializedProgress: SerializedProgress = {
                //  usedCodes: [],
                //completionHistory: [missionRecord],
                //};

                Usergeek.trackEvent("Mission 1: Konecta Followed");
                //await backendActor.updateUserProgress(principalId, 1n, serializedProgress);

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();
                navigate('/');
            });
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    sendKamiDM: () => {
        useMissionAssistant().setUserPFPLoading();
        const twitterUsername = "kami_kta";
        const twitterDMUrl = `https://twitter.com/intent/follow?screen_name=${twitterUsername}`;

        window.open(twitterDMUrl, "_blank");
    },

    verifyPFP: async () => {
        let didhe = await useFetchData().fetchUserPFPstatus();
        if (useGlobalID().userPFPstatus === "verified") {
            alert("Success");

            Usergeek.trackEvent("Mission 2: PFP Verified");

            navigate('/');
        } else {
            if (useGlobalID().userPFPstatus === "loading") {
                alert("Loading");
            }
        }
    },
    verifyPFPTW: async () => {
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

            window.addEventListener("message", async (event) => {
                if (event.origin !== "https://do.konecta.one") {
                    return;
                }

                const { result } = event.data as UserData3;

                if (result) {

                    Usergeek.trackEvent("Mission 3: PFP Verified (Twitter)");

                    popup?.close();
                    navigate('/');
                } else {
                    const [showModal, setShowModal] = useState(true);

                    const handleClose = () => setShowModal(false);

                    return (
                        <>
                            <Modal show={showModal} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>No tweet!</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    You have not tweeted the message yet.
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClose}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    );
                }

            });
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },
    vfTweet: async () => {
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

            window.addEventListener("message", async (event) => {
                if (event.origin !== "https://do.konecta.one") {
                    return;
                }

                const { result } = event.data as UserData3;

                if (result) {

                    Usergeek.trackEvent("Mission 4: PFP Verified (Twitter)");

                    popup?.close();
                    navigate('/');
                } else {
                    const [showModal, setShowModal] = useState(true);

                    const handleClose = () => setShowModal(false);

                    return (
                        <>
                            <Modal show={showModal} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>No tweet!</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    You have not tweeted the message yet.
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClose}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    );
                }

            });
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    verRT: async () => {
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

            window.addEventListener("message", async (event) => {
                if (event.origin !== "https://do.konecta.one") {
                    return;
                }

                const { result } = event.data as UserData3;

                if (result) {

                    Usergeek.trackEvent("Mission 5: PFP Verified (Twitter)");
                    popup?.close();
                    navigate('/');
                } else {
                    const [showModal, setShowModal] = useState(true);

                    const handleClose = () => setShowModal(false);

                    return (
                        <>
                            <Modal show={showModal} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>No tweet!</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    You have not tweeted the message yet.
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClose}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    );
                }

            });
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },
};

export default MissionFunctionsComponent;
