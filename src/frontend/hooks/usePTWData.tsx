import { useState, useEffect } from 'react';

const usePTWData = (missionId: number) => {
    const [ptwData, setPtwData] = useState({
        words: [],
        mentions: [],
        hashtags: [],
        cashtags: [],
    });

    useEffect(() => {
        if (missionId === 4) {
            const fetchPTW = async () => {
                try {
                    const response = await fetch("https://do.konecta.one/getPTW", {
                        method: "GET",
                        credentials: "include",
                    });
                    const data = await response.json();
                    setPtwData(data);
                } catch (error) {
                    console.error('Error fetching PTW data:', error);
                }
            };

            fetchPTW();
        }
    }, [missionId]);

    // Function to render PTW content
    const renderPTWContent = () => {
        const { words, mentions, hashtags, cashtags } = ptwData;

        let ptwContent = "Make sure to use:";

        if (words.length > 0) {
            ptwContent += ` The words: ${words.join(", ")}`;
        }

        if (mentions.length > 0) {
            ptwContent += ` The mentions: ${mentions.join(", ")}`;
        }

        if (hashtags.length > 0 || cashtags.length > 0) {
            ptwContent += ` The tags: ${[...hashtags, ...cashtags].join(", ")}`;
        }

        return ptwContent !== "Make sure to use:" ? <p>{ptwContent}</p> : null;
    };

    return { ptwData, renderPTWContent };
};

export default usePTWData;
