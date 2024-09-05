import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import CryptoJS from 'crypto-js';

// Encryption key
const phrase = 'Awesome-Ultra-Secret-Key';
const key = CryptoJS.enc.Utf8.parse(phrase.padEnd(32));

interface EncryptionContextProps {
    principalId: string | null;
    saveSession: (principalId: string) => void;
    clearSession: () => void;
    decryptSession: () => { principalId: string, expirationTime: number } | null;
    decrypting: boolean;
}

interface EncryptionProviderProps {
    children: ReactNode;
}

// Create the Encryption Context
const EncryptionContext = createContext<EncryptionContextProps>({
    principalId: null,
    saveSession: () => { },
    clearSession: () => { },
    decryptSession: () => null,
    decrypting: true,
});

// Encryption function
function encrypt(text: string): { iv: string, encryptedData: string } {
    const iv = CryptoJS.lib.WordArray.random(16); // Generate random IV
    const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return { iv: iv.toString(CryptoJS.enc.Hex), encryptedData: encrypted.toString() };
}

// Decryption function
function decrypt(encryptedText: string, iv: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
        throw new Error('Decryption resulted in an empty string.');
    }
    return decryptedText;
}

export const EncryptionProvider: React.FC<EncryptionProviderProps> = ({ children }) => {
    const [principalId, setPrincipalId] = useState<string | null>(null);
    const [decrypting, setDecrypting] = useState<boolean>(true);

    useEffect(() => {
        // Decrypt session on initial load
        const session = decryptSession();
        if (session) {
            setPrincipalId(session.principalId);
        }
        setDecrypting(false); // End decrypting state after check
    }, []);

    // Save the principalId and session expiration in localStorage
    const saveSession = (principalId: string) => {
        const expirationTime = Date.now() + 3600000; // 1 hour from now
        const dataToEncrypt = JSON.stringify({ principalId, expirationTime });
        const { iv, encryptedData } = encrypt(dataToEncrypt);

        localStorage.setItem('encryptedData', encryptedData);
        localStorage.setItem('iv', iv);
        setPrincipalId(principalId);
    };

    // Clear the session
    const clearSession = () => {
        localStorage.removeItem('encryptedData');
        localStorage.removeItem('iv');
        setPrincipalId(null);
    };

    // Decrypt the session manually (can be reused in components)
    const decryptSession = (): { principalId: string, expirationTime: number } | null => {
        const encryptedData = localStorage.getItem('encryptedData');
        const iv = localStorage.getItem('iv');

        if (encryptedData && iv) {
            try {
                const decryptedData = decrypt(encryptedData, iv);
                const parsedData = JSON.parse(decryptedData);
                const { principalId, expirationTime } = parsedData;

                if (Date.now() < expirationTime) {
                    return parsedData; // Return session if not expired
                } else {
                    clearSession(); // Clear session if expired
                }
            } catch (error) {
                console.error('Failed to decrypt session data:', error);
                clearSession(); // Clear session if there's an error
            }
        }

        return null; // Return null if no valid session
    };

    return (
        <EncryptionContext.Provider value={{ principalId, saveSession, clearSession, decryptSession, decrypting }}>
            {!decrypting && children} {/* Only render children after decryption */}
        </EncryptionContext.Provider>
    );
};

// Custom hook to use encryption context
export const useEncryption = () => useContext(EncryptionContext);
