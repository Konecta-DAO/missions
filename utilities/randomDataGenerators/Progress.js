const { Ed25519KeyIdentity } = require('@dfinity/identity');
const fs = require('fs');

// Set the number of entries you want to generate
const NUM_ENTRIES = 10000;

// Function to generate a unique Principal from Ed25519KeyIdentity
function generatePrincipal(existingSet) {
    // Generate a new identity, which has a unique Principal
    const identity = Ed25519KeyIdentity.generate();
    const principal = identity.getPrincipal().toText();

    // Ensure this Principal is unique
    if (!existingSet.has(principal)) {
        existingSet.add(principal);
        return principal;
    } else {
        return generatePrincipal(existingSet); // Retry if not unique
    }
}

// Function to generate a 6-character uppercase alphanumeric string (usedCode)
function generateUsedCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

// Function to generate a 19-digit timestamp string
function generateTimestamp() {
    return Math.floor(Math.random() * Math.pow(10, 19)).toString().padStart(19, '0');
}

// Function to generate a 5-digit points earned string
function generatePointsEarned() {
    return Math.floor(Math.random() * Math.pow(10, 5)).toString().padStart(5, '0');
}

// Function to generate a 19-digit tweet ID string (converted to text as required)
function generateTweetId() {
    return Math.floor(Math.random() * Math.pow(10, 19)).toString(); // Return as string
}

// Function to generate completion history entries
function generateCompletionHistory(entryCount = 1) {
    const history = [];

    for (let i = 0; i < entryCount; i++) {
        const entry = {
            pointsEarned: generatePointsEarned(),
            timestamp: generateTimestamp(),
            tweetId: [] // Optional tweetId, initially an empty array
        };

        // 50% chance to include a tweetId (as a valid string wrapped in an array)
        if (Math.random() >= 0.5) {
            entry.tweetId = [generateTweetId()];
        }

        history.push(entry);
    }

    return history;
}

// Function to generate an entry with usedCodes and completionHistory
function generateEntry(isExtended = false) {
    const usedCodes = [[generateUsedCode(), true]];
    const completionHistory = generateCompletionHistory(isExtended ? 20 : 1);

    return {
        usedCodes: usedCodes,
        completionHistory: completionHistory
    };
}

// Function to generate the JSON data with the specified number of Principals
function generateJson(numPrincipals) {
    const data = [];
    const existingPrincipals = new Set();

    for (let i = 0; i < numPrincipals; i++) {
        console.log(`Generating Principal ${i + 1}/${numPrincipals}`);

        const principal = generatePrincipal(existingPrincipals);

        // Generate keys "0" to "9"
        const keys = Array.from({ length: 10 }, (_, idx) => idx.toString());

        // Randomly select 2 unique keys to have extended completion history
        const extendedKeys = new Set();
        while (extendedKeys.size < 2) {
            extendedKeys.add(keys[Math.floor(Math.random() * keys.length)]);
        }

        const entries = keys.map((key) => {
            const isExtended = extendedKeys.has(key);
            return [key, generateEntry(isExtended)];
        });

        data.push([
            { __principal__: principal },
            entries
        ]);
    }

    return data;
}

// Main function to run the generator and save the output to a JSON file
function main() {
    // Generate the JSON data
    const jsonData = generateJson(NUM_ENTRIES);

    // Save the generated data to a file
    fs.writeFileSync('generated_data.json', JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`JSON data generation complete. Saved to 'generated_data.json' with ${NUM_ENTRIES} principals.`);
}

// Run the main function
main();
