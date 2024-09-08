const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;
const { TwitterApi } = require('twitter-api-v2');
const codeVerifierStore = {};

// Twitter API credentials
const TWITTER_CONSUMER_KEY = '1Qeq53xpftIDxtvHObGK0iCYt';
const TWITTER_CONSUMER_SECRET = 'wa94qepFkS43DkQJzxDzzAPZ76HazvZFbRfXRgik7EMDSOsCTF';
const callbackURL = 'https://do.konecta.one/twitter-callback-v2';
const KONECT_DAO_USER_ID = '1747568601706496000';

const twitterClient = new TwitterApi({
    clientId: 'bnZQOWlVTGpLY1QyMWg0cnlyOXU6MTpjaQ',
    clientSecret: 'AK7LdE7FobvlJSJJU9VDbm-eHPKKl83K8aZh-0HbsjyU-PAT5G',
});

app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: 'https://pre.konecta.one', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'], credentials: true }));
app.use(express.json());

app.get('/requestTwitterAuth-v2', async (req, res) => {
    try {
        const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(callbackURL, {
            scope: ['tweet.read', 'users.read', 'follows.read', 'follows.write', 'offline.access'],
        });

        codeVerifierStore[state] = codeVerifier;

        console.log('Generated state:', state);
        console.log('Generated codeVerifier:', codeVerifier);

        res.status(200).send({ authURL: url });
    } catch (error) {
        console.error('Error generating auth link:', error);
        res.status(500).send({ error: 'Failed to generate Twitter auth link' });
    }
});

app.get('/twitter-callback-v2', async (req, res) => {
    const { code, state } = req.query;

    console.log('Received state:', state);
    console.log('Received code:', code);

    const codeVerifier = codeVerifierStore[state];
    delete codeVerifierStore[state];

    if (!codeVerifier) {
        return res.status(400).json({ error: 'Code verifier missing. Please retry the authentication flow.' });
    }

    if (!code) {
        return res.status(400).send({ error: 'Missing code in callback' });
    }

    try {
        const { client: loggedClient, accessToken, refreshToken, expiresIn, scopes } = await twitterClient.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: callbackURL,
        });

        const user = await loggedClient.v2.me();
        console.log('User logged in:', user.data.username);
        console.log('Access Token:', accessToken);
        console.log('Token Scopes:', scopes);

        // Send tokens and user data to the frontend
        res.send(`
        <script>
            window.opener.postMessage({
                accessToken: '${accessToken}',
                refreshToken: '${refreshToken}',
                userId: '${user.data.id}',
                userHandle: '${user.data.username}'
            }, 'https://pre.konecta.one');
            window.close();
        </script>
        `);
    } catch (error) {
        console.error('Error during Twitter OAuth2:', error.message);
        res.status(500).json({ error: 'Failed to authenticate with Twitter' });
    }
});

app.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const newTokens = await twitterClient.refreshOAuth2Token(refreshToken);
        res.json(newTokens);
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

app.post('/get-twitter-user', async (req, res) => {
    let { accessToken, refreshToken } = req.body;

    try {
        let userClient = new TwitterApi({ accessToken });

        // Test the token by making an API call
        try {
            const user = await userClient.v2.me(); // Check if the access token is still valid
            res.json(user);
        } catch (error) {
            if (error.code === 401 && refreshToken) {
                // Refresh the token if expired
                console.log('Access token expired, refreshing token...');
                const newTokens = await twitterClient.refreshOAuth2Token(refreshToken);
                accessToken = newTokens.accessToken;
                refreshToken = newTokens.refreshToken;
                console.log('New access token:', accessToken);

                userClient = new TwitterApi({ accessToken });
                const user = await userClient.v2.me();
                res.json(user);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error fetching Twitter user:', error);
        res.status(500).json({ error: 'Failed to fetch Twitter user' });
    }
});

app.post('/follow-konecta', async (req, res) => {
    let { accessToken, refreshToken, userId } = req.body;

    try {
        let userClient = new TwitterApi({ accessToken });

        // Test the token by making an API call
        try {
            await userClient.v2.me(); // Check if the access token is still valid
        } catch (error) {
            if (error.code === 401 && refreshToken) {
                // Refresh the token if expired
                console.log('Access token expired, refreshing token...');
                const newTokens = await twitterClient.refreshOAuth2Token(refreshToken);
                accessToken = newTokens.accessToken;
                refreshToken = newTokens.refreshToken;
                console.log('New access token:', accessToken);

                userClient = new TwitterApi({ accessToken });
            } else {
                throw error;
            }
        }

        // Use the correct endpoint and parameters to follow @konecta_dao
        const followResponse = await userClient.v2.follow(userId, {
            target_user_id: '1747568601706496000' // Replace with the actual user ID of @konecta_dao
        });

        console.log('Follow response:', followResponse);

        if (followResponse.data.following) {
            res.json({ success: true, message: 'Successfully followed the account.' });
        } else {
            res.json({ success: false, message: 'Failed to follow the account.' });
        }
    } catch (error) {
        console.error('Error following account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
