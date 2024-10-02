// ptwUtils.ts
export interface PTWData {
    words: string[];
    mentions: string[];
    hashtags: string[];
    cashtags: string[];
}

/**
 * Fetches PTW data based on the missionId.
 * @param missionId - The ID of the mission.
 * @returns The PTW data or null if missionId is not 4 or an error occurs.
 */
export const fetchPTWData = async (missionId: number): Promise<PTWData | null> => {
    if (missionId !== 4) {
        return null;
    }

    try {
        const response = await fetch("https://dotest.konecta.one/getPTW", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PTWData = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching PTW data:', error);
        return null;
    }
};

/**
 * Generates PTW content as a string based on the PTW data.
 * @param ptwData - The PTW data fetched from the API.
 * @returns A string with the PTW content or null if there's nothing to display.
 */
export const generatePTWContent = (ptwData: PTWData | null): string | null => {
    if (!ptwData) return null;

    const { words, mentions, hashtags, cashtags } = ptwData;
    let ptwContent = "Make sure to use";

    if (words.length > 0) {
        ptwContent += ` the words: ${words.join(", ")},`;
    }

    if (mentions.length > 0) {
        ptwContent += ` the mentions: ${mentions.join(", ")},`;
    }

    if (hashtags.length > 0 || cashtags.length > 0) {
        ptwContent += ` and the tags: ${[...hashtags, ...cashtags].join(", ")}`;
    }

    return ptwContent !== "Make sure to use" ? ptwContent : null;
};
