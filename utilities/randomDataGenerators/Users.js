const { Ed25519KeyIdentity } = require('@dfinity/identity');
const fs = require('fs');

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

// **Updated Function: Returns [] or [string] to match SerializedUser type**
function generateOcProfile() {
    const statuses = ["active", "inactive", "pending", "suspended", "verified"];
    // 50% chance to return an empty array or an array with one status
    if (Math.random() >= 0.5) {
        return [statuses[Math.floor(Math.random() * statuses.length)]];
    } else {
        return [];
    }
}

// Generates a 19-digit timestamp string
function generateCreationTime() {
    return Math.floor(Math.random() * Math.pow(10, 19)).toString().padStart(19, '0');
}

// Returns an empty list or a list with one random string (5-15 characters)
function generateTwitterHandle() {
    if (Math.random() >= 0.5) {
        const length = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
        let handle = '';
        for (let i = 0; i < length; i++) {
            handle += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return [handle];
    } else {
        return [];
    }
}

// Randomly returns "false", "loading", or "true"
function generatePfpProgress() {
    const options = ["false", "loading", "true"];
    return options[Math.floor(Math.random() * options.length)];
}

// Returns an empty list or a list with one string of 9 or 19 digits
function generateTwitterId() {
    if (Math.random() >= 0.5) {
        const length = Math.random() >= 0.5 ? 9 : 19;
        let id = '';
        for (let i = 0; i < length; i++) {
            id += Math.floor(Math.random() * 10);
        }
        return [id];
    } else {
        return [];
    }
}

// Generates a string representing a number with up to 6 digits
function generateTotalPoints() {
    const points = Math.floor(Math.random() * 1000000); // Up to 6 digits
    return points.toString();
}

// Function to generate a single entry
function generateEntry(existingSet) {
    const principal = generatePrincipal(existingSet);
    const entry = {
        id: {
            __principal__: principal
        },
        ocProfile: generateOcProfile(), // Now returns [] or [string]
        creationTime: generateCreationTime(),
        twitterhandle: generateTwitterHandle(),
        pfpProgress: generatePfpProgress(),
        twitterid: generateTwitterId(),
        totalPoints: generateTotalPoints()
    };
    return entry;
}

// Function to generate the JSON data with a specified number of entries
function generateJson(numEntries = 10000) {
    const data = [];
    const existingPrincipals = new Set();

    for (let i = 0; i < numEntries; i++) {
        if ((i + 1) % 1000 === 0 || i === numEntries - 1) {
            console.log(`Generating entry ${i + 1}/${numEntries}`);  // Log progress every 1000 entries
        }
        const entry = generateEntry(existingPrincipals);
        data.push(entry);
    }

    return data;
}

// Main function to run the generator and save the output to a JSON file
function main() {
    const NUM_ENTRIES = 10000;  // Set the number of entries you want to generate
    const jsonData = generateJson(NUM_ENTRIES);

    // Save the generated data to a file
    fs.writeFileSync('generated_entries.json', JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`\nJSON data generation complete. Saved to 'generated_entries.json' with ${NUM_ENTRIES} entries.`);
}

// Run the main function
main();
