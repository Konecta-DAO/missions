import { useState, useEffect } from 'react';

const useTWtoRT = () => {
    const [tweetId, setTweetId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getTWtoRT = async () => {
            try {
                const response = await fetch("https://do.konecta.one/getRToday", {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch tweet ID");
                }

                console.log(response);
                const data = await response.json();
                setTweetId(data.id);
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        getTWtoRT();
    }, []);

    return { tweetId, loading, error };
};

export default useTWtoRT;
