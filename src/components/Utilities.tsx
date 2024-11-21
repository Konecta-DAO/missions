export const convertSecondsToHMS = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = secs.toString().padStart(2, '0');

    if (days > 0) {
        return `${days}d:${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
};


export const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1e6); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
};


export const generateCodeVerifier = (): string => {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
};

const sha256 = async (plain: string): Promise<ArrayBuffer> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
};
const base64UrlEncode = (arrayBuffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const hashed = await sha256(verifier);
    return base64UrlEncode(hashed);
};

export const randomBetween = (min: number, max: number): bigint => {
    return BigInt(Math.floor(Math.random() * (max - min + 1) + min));
}

export const getCurrentTimestampInNanoSeconds = (): bigint => {
    return BigInt(Date.now()) * BigInt(1_000_000);
}

export function formatTimeRemaining(endDateNano: bigint) {
    const currentTimeNano = BigInt(Date.now()) * BigInt(1_000_000); // Convert ms to ns
    const timeRemainingNano = endDateNano - currentTimeNano;

    if (timeRemainingNano <= 0) {
        return '00:00:00'; // No time left
    }

    // Convert nanoseconds to seconds
    const timeRemainingSeconds = Math.floor(Number(timeRemainingNano) / 1_000_000_000);

    // Convert seconds to HH:MM:SS
    const hours = Math.floor(timeRemainingSeconds / 3600);
    const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
    const seconds = timeRemainingSeconds % 60;

    // Return formatted time as HH:MM:SS
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function isMissionAvailable(startDateNano: bigint, endDateNano: bigint) {
    const currentTimeNano = Date.now() * 1_000_000;
    return (startDateNano === BigInt(0) && endDateNano === BigInt(0)) || (currentTimeNano >= Number(startDateNano) && currentTimeNano <= Number(endDateNano));
}