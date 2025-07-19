export const buildSearchQuery = (receivedTexts: Map<string, string[]>) => {
    const queryParts = [];

    // Process words (no parentheses, AND logic)
    const words = receivedTexts.get('words') || [];
    if (words.length > 0) {
        queryParts.push(words.join(" "));
    }
    console.log(words);


    // Process hashtags (no parentheses, AND logic)
    const hashtags = receivedTexts.get('hashtags') || [];
    if (hashtags.length > 0) {
        const hashtagsQuery = hashtags.map(ht => {
            return ht.startsWith('#') ? ht : `#${ht}`;
        }).join(" ");
        queryParts.push(hashtagsQuery);
    }
    console.log(hashtags);


    // Process cashtags (no parentheses, AND logic)
    const cashtags = receivedTexts.get('cashtags') || [];
    if (cashtags.length > 0) {
        const cashtagsQuery = cashtags.map(ct => {
            return ct.startsWith('$') ? ct : `$${ct}`;
        }).join(" ");
        queryParts.push(cashtagsQuery);
    }
    console.log(cashtags);


    // Process mentions (no parentheses, AND logic)
    const mentions = receivedTexts.get('mentions') || [];
    if (mentions.length > 0) {
        const mentionsQuery = mentions.map(m => {
            return m.startsWith('@') ? m : `@${m}`;
        }).join(" ");
        queryParts.push(mentionsQuery);
    }
    console.log(mentions);
    const finalQuery = queryParts.join(" ");
    console.log(finalQuery); // Ensure the query is built correctly
    return finalQuery;
}


export const getRandomBigInt = (min: bigint, max: bigint) => {
    const range = max - min + 1n;
    const randomValue = BigInt(Math.floor(Math.random() * Number(range)));
    return min + randomValue;
}

