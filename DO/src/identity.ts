import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { ENV } from "./config/env";

// Completely insecure seed phrase. Do not use for any purpose other than testing.
const seed = ENV.SEED_PHRASE;

if (!seed) {
    throw new Error('Seed phrase not defined in environment variables');
}

// Function to generate identity from seed phrase
export const getIdentity = () => {
    return Secp256k1KeyIdentity.fromSeedPhrase(seed);
};
