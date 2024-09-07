import { Principal } from "@dfinity/principal";
import { SerializedUser } from "../../../declarations/backend/backend.did";
import React, { useState } from 'react';
import axios from 'axios';

interface UserData {
    accessToken: string;
    accessSecret: string;
    userId: string;
    userHandle: string;
}

const MissionFunctionsComponent = {
    handleTwitterAuth: (principalId: Principal | null, backendActor: any) => {
        // 1. Fetch the Twitter OAuth URL from the backend
        fetch('https://do.konecta.one/requestTwitterAuth', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                const authURL = data.authURL;
                // 2. Open the Twitter OAuth URL in a new popup window
                const popup = window.open(authURL, 'TwitterLogin', 'width=500,height=600');

                // 3. Listen for the message from the popup after the user has followed @konecta_dao
                window.addEventListener('message', (event: MessageEvent) => {
                    if (event.origin !== 'https://do.konecta.one') return; // Ensure the message is from the backend domain

                    const { userId, userHandle } = event.data;

                    if (userId && userHandle) {
                        // Log the user details in the console
                        console.log(`Twitter User ID: ${userId}, Handle: ${userHandle}`);

                        backendActor.addTwitterInfo(principalId, BigInt(userId), userHandle)
                    }

                    // Cleanup the event listener after the message is received
                    window.removeEventListener('message', () => { });
                });
            })
            .catch(error => {
                console.error('Error during Twitter login initiation:', error);
            });
    },
    verifyFollowing: async (principalId: Principal | null, backendActor: any) => {
        // Fetch the Twitter OAuth URL from the backend
        fetch('https://do.konecta.one/requestTwitterAuth-v2', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                const authURL = data.authURL;

                // Open Twitter OAuth flow in a new popup window with the correct authURL
                const popup = window.open(authURL, 'TwitterAuth', 'width=600,height=400');

                // Listen for the postMessage event from the popup window
                window.addEventListener('message', async (event) => {
                    if (event.origin !== 'https://do.konecta.one') {
                        return;
                    }

                    const { accessToken, accessSecret, userId } = event.data as UserData;

                    // Call the verifyFollow function with the returned tokens and userId
                    const result = await verifyFollow(accessToken, accessSecret, userId);
                    console.log('Is following:', result);

                    // Close the popup once we have the necessary data
                    popup?.close();
                });
            })
            .catch(error => {
                console.error('Error fetching Twitter auth URL:', error);
            });
    },

};

async function verifyFollow(accessToken: string, accessSecret: string, userId: string): Promise<boolean> {
    try {
        const response = await axios.get('https://do.konecta.one/check-following', {
            params: { accessToken, accessSecret, userId },
        });
        return response.data.isFollowing;
    } catch (error) {
        console.error('Error checking follow status:', error);
        return false;
    }
}

export default MissionFunctionsComponent;