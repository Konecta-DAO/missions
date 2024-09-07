import { Principal } from "@dfinity/principal";
import axios from 'axios';

interface UserData {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userHandle: string;
}

const MissionFunctionsComponent = {
    handleTwitterAuth: async (principalId: Principal | null, backendActor: any) => {
        let accessToken = localStorage.getItem('accessToken');
        let refreshToken = localStorage.getItem('refreshToken');


        console.log('Access Token Retrieved:', accessToken);
        console.log('Refresh Token Retrieved:', refreshToken);

        if (!accessToken || !refreshToken) {
            console.error('Access token or refresh token is missing.');
            return;
        }

        // Check if the access token is valid
        try {
            const response = await fetch('https://do.konecta.one/get-twitter-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessToken, refreshToken }),
            });

            if (response.status === 401) {
                // Access token expired, refresh it
                const newTokens = await refreshDToken(refreshToken); // Call the function correctly
                accessToken = newTokens.accessToken;
                refreshToken = newTokens.refreshToken;

                // Save new tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
            }

            // Now you can use the access token to follow @konecta_dao
            const followResponse = await fetch('https://do.konecta.one/follow-konecta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ userId: 'YOUR_USER_ID' }), // Replace with the authenticated user ID
            });

            const followData = await followResponse.json();
            console.log('Follow response:', followData);
        } catch (error) {
            console.error('Error following @konecta_dao:', error);
        }
    },
    verifyFollowing: async (principalId: Principal | null, backendActor: any) => {
        try {
            const response = await fetch('https://do.konecta.one/requestTwitterAuth-v2', {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();
            const authURL = data.authURL;

            const popup = window.open(authURL, 'TwitterAuth', 'width=600,height=400');

            window.addEventListener('message', async (event) => {
                if (event.origin !== 'https://do.konecta.one') {
                    return;
                }

                const { userId, userHandle, accessToken, refreshToken } = event.data as UserData;

                console.log('User ID:', userId);
                console.log('User Handle:', userHandle);
                console.log('Access Token:', accessToken);
                console.log('Refresh Token:', refreshToken);
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                popup?.close();
            });
        } catch (error) {
            console.error('Error fetching Twitter auth URL:', error);
        }
    },
};

async function refreshDToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
        const response = await fetch('https://do.konecta.one/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
}

export default MissionFunctionsComponent;