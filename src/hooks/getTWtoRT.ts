/* import { doAddress } from "../frontend/pages/Missions/Components/MissionFunctionsComponent.ts";

const getTWtoRT = async (): Promise<string> => {
    const response = await fetch(`https://${doAddress}/getRToday`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch tweet ID");
    }

    const data = await response.json();
    return data.retwId;
};

export default getTWtoRT; */