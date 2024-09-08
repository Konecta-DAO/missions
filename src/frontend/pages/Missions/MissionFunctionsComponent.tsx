import { Principal } from "@dfinity/principal";
import { SerializedProgress, SerializedMissionRecord, SerializedMission } from "../../../declarations/backend/backend.did";
import { randomBetween, getCurrentTimestampInNanoSeconds } from "../../../components/Utilities";
import { Usergeek } from "usergeek-ic-js";
import { Button, Modal } from "react-bootstrap";
import React, { useState } from "react";

interface UserData {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userHandle: string;
}

interface UserData2 {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userHandle: string;
    hasTweeted: boolean;
    tweetId: string;
}

const MissionFunctionsComponent = {
    followKonecta: async (principalId: Principal | null, backendActor: any, missions: SerializedMission[], navigate: (path: string) => void) => {
        try {
            const response = await fetch(
                "https://do.konecta.one/requestTwitterAuth-v2",
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

                const { userId, userHandle, accessToken, refreshToken } = event.data as UserData;

                backendActor.addTwitterInfo(principalId, BigInt(userId), userHandle);

                const missionRecord: SerializedMissionRecord = {
                    pointsEarned: randomBetween(Number(missions[1].mintime), Number(missions[1].maxtime)),
                    timestamp: getCurrentTimestampInNanoSeconds(),
                    tweetId: [], // Empty tweet ID
                };

                const serializedProgress: SerializedProgress = {
                    usedCodes: [],
                    completionHistory: [missionRecord],
                };

                Usergeek.trackEvent("Mission 1: Konecta Followed");
                await backendActor.updateUserProgress(principalId, 1n, serializedProgress);

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                popup?.close();
                navigate('/Missions');
            });
        } catch (error) {
            console.error("Error fetching Twitter auth URL:", error);
        }
    },

    sendKamiDM: (principalId: Principal | null, backendActor: any, missions: SerializedMission[], navigate: (path: string) => void) => {
        backendActor.setUserPicture(principalId, false);
        const twitterUsername = "kami_kta";
        const twitterDMUrl = `https://twitter.com/intent/follow?screen_name=${twitterUsername}`;

        window.open(twitterDMUrl, "_blank");
    },

    verifyPFP: async (principalId: Principal | null, backendActor: any, missions: SerializedMission[], navigate: (path: string) => void) => {
        if (backendActor.getUserPicture(principalId, true)) {
            const missionRecord: SerializedMissionRecord = {
                pointsEarned: randomBetween(Number(missions[2].mintime), Number(missions[2].maxtime)),
                timestamp: getCurrentTimestampInNanoSeconds(),
                tweetId: [], // Empty tweet ID
            };

            const serializedProgress: SerializedProgress = {
                usedCodes: [],
                completionHistory: [missionRecord],
            };

            Usergeek.trackEvent("Mission 2: PFP Verified");
            await backendActor.updateUserProgress(principalId, 2n, serializedProgress);
            navigate('/Missions');
        } else {
            const [showModal, setShowModal] = useState(true);

            const handleClose = () => setShowModal(false);

            return (
                <>
                    <Modal show={showModal} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Not verified yet!</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            If you already did set the Profile Picture, you will be verified soon.
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
    },
    verifyPFPTW: async (principalId: Principal | null, backendActor: any, missions: SerializedMission[], navigate: (path: string) => void) => {
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

                const { userId, userHandle, accessToken, refreshToken, hasTweeted } = event.data as UserData2;

                    if (hasTweeted) {

                        const missionRecord: SerializedMissionRecord = {
                            pointsEarned: randomBetween(Number(missions[3].mintime), Number(missions[3].maxtime)),
                            timestamp: getCurrentTimestampInNanoSeconds(),
                            tweetId: [userId],
                        };

                        const serializedProgress: SerializedProgress = {
                            usedCodes: [],
                            completionHistory: [missionRecord],
                        };

                        Usergeek.trackEvent("Mission 3: PFP Verified (Twitter)");
                        await backendActor.updateUserProgress(principalId, 3n, serializedProgress);

                        localStorage.setItem("accessToken", accessToken);
                        localStorage.setItem("refreshToken", refreshToken);

                        popup?.close();
                        navigate('/Missions');
                    }else{
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
