import { Principal } from "@dfinity/principal";
import axios from 'axios';

interface UserData {
    accessToken: string;
    refreshToken: string;
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

                const { userId, userHandle } = event.data as UserData;

                console.log('User ID:', userId);
                console.log('User Handle:', userHandle);

                popup?.close();
            });
        } catch (error) {
            console.error('Error fetching Twitter auth URL:', error);
        }
    },

};

export default MissionFunctionsComponent;