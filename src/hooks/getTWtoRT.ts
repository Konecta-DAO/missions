const getTWtoRT = async (): Promise<string> => {
    const response = await fetch("https://do.konecta.one/getRToday", {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch tweet ID");
    }

    const data = await response.json();
    return data.retwId;
};

export default getTWtoRT;
