
// Start the server


// const dataFilePath = path.join(__dirname, 'receivedTexts.json');

// type TweetMetadata = {
//   words: string[];
//   mentions: string[];
//   hashtags: string[];
//   cashtags: string[];
//   retwId: string | null;
// };

// function loadData(): TweetMetadata {
//   if (fs.existsSync(dataFilePath)) {
//     const data = fs.readFileSync(dataFilePath, 'utf8');
//     const parsedData : TweetMetadata = JSON.parse(data);
//     return {
//       words: parsedData.words ?? [],
//       mentions: parsedData.mentions ?? [],
//       hashtags: parsedData.hashtags ?? [],
//       cashtags: parsedData.cashtags ?? [],
//       retwId: parsedData.retwId ?? null,
//     };
//   } else {
//     return {
//       words: [],
//       mentions: [],
//       hashtags: [],
//       cashtags: [],
//       retwId: null,
//     };
//   }
// }

// function saveData(data: TweetMetadata) {
//   fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
// }

// loadData();


// async function updateUserProgress(actor, userUUID, missionId, pointsEarned, tweetId = []) {
//     const timestamp = BigInt(Date.now() * 1_000_000); // Current time in nanoseconds
//     const serializedMissionRecord = {
//         pointsEarned: pointsEarned,
//         timestamp: timestamp,
//         tweetId: tweetId // Optional empty field
//     };

//     const serializedProgress = {
//         usedCodes: [], // Empty array
//         completionHistory: [serializedMissionRecord] // Array with the record
//     };

//     await actor.updateUserProgress(userUUID, missionId, serializedProgress);
// }

// function sendFinalResponse(res, accessToken, refreshToken, result) {
//     const html = `
//     <script>
//       window.opener.postMessage({
//         accessToken: '${accessToken}',
//         refreshToken: '${refreshToken}',
//         result: '${result}'
//       }, '${frontAddress}');
//       window.close();
//     </script>
//   `;
//     res.send(html);
// }

// // TWITTER MISC

// app.post('/twitterstuff', (req, res) => {
//     // Get the JSON payload from the request body
//     const textArray = req.body;

//     // Check if the payload is a valid array
//     if (Array.isArray(textArray)) {
//         // Load existing data
//         const dataMap = loadData();

//         // Initialize arrays to categorize texts
//         let words = [];
//         let mentions = [];
//         let hashtags = [];
//         let cashtags = [];

//         textArray.forEach(text => {
//             if (text.startsWith('@')) {
//                 mentions.push(text);
//             } else if (text.startsWith('#')) {
//                 hashtags.push(text);
//             } else if (text.startsWith('$')) {
//                 cashtags.push(text);
//             } else {
//                 words.push(text);
//             }
//         });

//         // Create a map to hold categorized data
//         dataMap.set('words', words);
//         dataMap.set('mentions', mentions);
//         dataMap.set('hashtags', hashtags);
//         dataMap.set('cashtags', cashtags);

//         // Save the data
//         saveData(dataMap);

//         // Send a success response with the processed data
//         res.status(200).send({ message: 'Array replaced successfully', data: Object.fromEntries(dataMap) });
//     } else {
//         // Send an error response if the payload is not an array
//         res.status(400).send({ message: 'Invalid data format. Expected an array of texts.' });
//     }
// });


// app.post('/storeRetweetId', (req, res) => {
//     const { id } = req.body;

//     if (id) {
//         // Load existing data
//         const dataMap = loadData();

//         // Update the retwId in the dataMap
//         dataMap.retwId = id;

//         // Save the updated map to the file
//         saveData(dataMap);

//         res.status(200).send({ message: 'Retweet ID stored successfully', retwId: id });
//     } else {
//         res.status(400).send({ message: 'Invalid data format. Expected a retweet ID.' });
//     }
// });

// app.post('/refresh-token', async (req, res) => {
//     const { refreshToken } = req.body;

//     try {
//         const newTokens = await twitterClient.refreshOAuth2Token(refreshToken);
//         res.json(newTokens);
//     } catch (error) {
//         console.error('Error refreshing token:', error);
//         res.status(500).json({ error: 'Failed to refresh token' });
//     }
// });

// // TWITTER GENERAL

// async function handleTwitterAuthRequest(req, res, callbackUrl) {

//     const origin = req.get('origin') || req.get('referrer');
//     if (origin !== frontAddress) {
//         return res.status(403).json({ message: 'Forbidden: Invalid Origin' });
//     }
//     try {
//         const { principal, missionIdStr, name } = validateRequestBody(req);
//         const missionId = BigInt(missionIdStr);

//         const actor = await getActorByName(name);
//         const principalObj = Principal.fromText(principal.__principal__);

//         const actorIndex = await createActorWithIndexIdentity();
//         const userUUID = await actorIndex.getUUID(principalObj);
//         // Check if the user is allowed to perform the mission
//         const canDoMission = await actor.canUserDoMission(userUUID, missionId);
//         if (!canDoMission) {
//             return res.status(403).send({ error: 'Not authorized for this mission' });
//         }

//         // Generate the OAuth2 link using the provided callback URL
//         const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(callbackUrl, {
//             scope: ['tweet.read', 'users.read', 'follows.read', 'tweet.write', 'follows.write', 'offline.access'],
//         });

//         // Store additional parameters for later processing
//         codeVerifierStore[state] = { codeVerifier, userUUID, missionId, name };

//         res.status(200).send({ authURL: url });
//     } catch (error) {
//         res.status(error.status || 500).send({ error: error.error || 'Failed to generate Twitter auth link' });
//     }
// }

// // A helper function to handle the common Twitter OAuth2 callback logic
// async function handleTwitterCallback(req, res, redirectUri) {
//     const { code, state } = req.query;
//     const codeData = codeVerifierStore[state];
//     delete codeVerifierStore[state];

//     if (!codeData) {
//         throw new Error('Code verifier missing. Please retry the authentication flow.');
//     }
//     const { codeVerifier, userUUID, missionId, name } = codeData;

//     if (!code) {
//         throw new Error('Missing code in callback');
//     }

//     // Authenticate with Twitter using OAuth2
//     const { client: loggedClient, accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
//         code,
//         codeVerifier,
//         redirectUri,
//     });

//     // Get Twitter user info
//     const user = await loggedClient.v2.me({
//         'user.fields': ['description']
//     });
//     const userId = user.data.id;         // Twitter ID
//     const userHandle = user.data.username;  // Twitter handle
//     const bio = user.data.description || '';
//     const optUserId = userId ? BigInt(userId) : null;

//     // Get the actor and actorIndex
//     const actor = await getActorByName(name);
//     const actorIndex = await createActorWithIndexIdentity();
//     const didhe = await actorIndex.isTwitterIdUsed(userUUID, userHandle);

//     return {
//         loggedClient,
//         accessToken,
//         refreshToken,
//         user,
//         userId,
//         userHandle,
//         bio,
//         optUserId,
//         actor,
//         actorIndex,
//         didhe,
//         userUUID,
//         missionId,
//         name
//     };
// }

// // TWITTER FOLLOW

// async function followUser(client, userId, targetId) {
//     try {
//         await client.v2.follow(userId, targetId);
//     } catch (error) {
//         if (
//             error.code === 400 &&
//             error.data &&
//             error.data.errors &&
//             error.data.errors[0] &&
//             error.data.errors[0].message === 'You cannot follow a user that you are already following.'
//         ) {
//             return;
//         }
//         console.error(`Error following target ${targetId}:`, error);
//         throw error;
//     }
// }

// app.post('/requestTwitterAuth-v2-follow', async (req, res) => {
//     await handleTwitterAuthRequest(req, res, `https://${doAddress}/twitter-callback-v2-follow`);
// });

// app.get('/twitter-callback-v2-follow', async (req, res) => {

//     try {
//         const redirectUri = `https://${doAddress}/twitter-callback-v2-follow`;
//         const result = await handleTwitterCallback(req, res, redirectUri);
//         const { loggedClient, accessToken, refreshToken, userId, userHandle, bio, optUserId, actor, actorIndex, didhe, userUUID, missionId, name } = result;

//         if (!didhe) {

//             async function processMission({ followIds, missionType }) {
//                 for (const id of followIds) {
//                     await followUser(loggedClient, userId, id);
//                 }

//                 await actorIndex.addTwitterInfo(userUUID, optUserId, userHandle);

//                 const missionData = await actor.getMissionById(missionId);
//                 const mission = missionData[0];

//                 // Calculate points based on mission type
//                 let pointsEarned;
//                 if (missionType === 'konecta') {
//                     const mintime = mission.mintime;
//                     const maxtime = mission.maxtime;
//                     pointsEarned = getRandomBigInt(BigInt(mintime), BigInt(maxtime));
//                 } else {
//                     pointsEarned = mission.points;
//                 }

//                 await updateUserProgress(actor, userUUID, missionId, pointsEarned);
//                 sendFinalResponse(res, accessToken, refreshToken, 'true');
//             }

//             if (name === 'konecta' && missionId === 1n) { // Konecta Mission 1: Follow
//                 await processMission({
//                     followIds: ['1747568601706496000', '1828134613375488000'], // Konecta & Kami
//                     missionType: name
//                 });
//             } else if (name === 'oisy' && missionId === 3n) {// Oisy Mission 3: Follow Oisy
//                 await processMission({
//                     followIds: ['1850812475312115712'],
//                     missionType: name
//                 });
//             }
//         } else {
//             sendFinalResponse(res, '', '', 'fake');
//         }
//     } catch (error) {
//         console.error('Error during Twitter OAuth2 or Motoko interaction:', error.message);
//         sendFinalResponse(res, '', '', 'false');
//     }
// });

// // TWITTER VERIFY TWEET

// app.post('/requestTwitterAuth-v2-tweet', async (req, res) => {
//     await handleTwitterAuthRequest(req, res, `https://${doAddress}/twitter-callback-v2-tweet`);
// });

// app.get('/twitter-callback-v2-tweet', async (req, res) => {
//     try {
//         const redirectUri = `https://${doAddress}/twitter-callback-v2-tweet`;
//         const result = await handleTwitterCallback(req, res, redirectUri);
//         const { loggedClient, accessToken, refreshToken, userId, userHandle, bio, optUserId, actor, actorIndex, didhe, userUUID, missionId, name } = result;

//         if (!didhe) {

//             async function processTweetMission({ query, maxResults = 10, tweetFields, tweetValidator, pointsCalculation }) {
//                 const response = await loggedClient.v2.search(query, {
//                     max_results: maxResults,
//                     'tweet.fields': tweetFields
//                 });

//                 const { valid, tweetId } = tweetValidator(response);
//                 if (valid) {
//                     await actorIndex.addTwitterInfo(userUUID, optUserId, userHandle);
//                     const missionData = await actor.getMissionById(missionId);
//                     const mission = missionData[0];
//                     const pointsEarned = pointsCalculation === 'random'
//                         ? getRandomBigInt(BigInt(mission.mintime), BigInt(mission.maxtime))
//                         : mission.points;
//                     await updateUserProgress(actor, userUUID, missionId, pointsEarned, [tweetId]);
//                     sendFinalResponse(res, accessToken, refreshToken, 'true');
//                 } else {
//                     sendFinalResponse(res, '', '', 'notfound');
//                 }
//             }

//             if (name === 'konecta' && missionId === 3n) {
//                 await processTweetMission({
//                     query: `#KonectaPFP from:${userHandle}`,
//                     tweetFields: 'created_at',
//                     pointsCalculation: 'random',
//                     tweetValidator: (response) => {
//                         if (response && response.data && response.data.data && response.data.data.length > 0) {
//                             const tweet = response.data.data[0];
//                             const tweetText = tweet.text;
//                             const strippedText = tweetText.replace(/#KonectaPFP/gi, '').trim();
//                             if (strippedText && strippedText !== '') {
//                                 return { valid: true, tweetId: tweet.id };
//                             }
//                         }
//                         return { valid: false };
//                     }
//                 });
//             }
//             // Mission: Recursive mission: Tweet with specific words (Konecta, missionId 4)
//             else if (name === 'konecta' && missionId === 4n) {
//                 let receivedTexts = loadData();

//                 let searchQuery = buildSearchQuery(receivedTexts);
//                 if (searchQuery.length === 0) {
//                     console.error('No query terms to search for');
//                     return res.status(400).json({ error: 'No query terms to search for.' });
//                 }

//                 // Assuming you want to use userHandle for the query; adjust if needed
//                 await processTweetMission({
//                     query: `from:${userHandle} ${searchQuery}`,
//                     tweetFields: 'text,created_at',
//                     pointsCalculation: 'random',
//                     tweetValidator: (response) => {
//                         if (response && response.data && response.data.data && response.data.data.length > 0) {
//                             const tweet = response.data.data[0];
//                             return { valid: true, tweetId: tweet.id };
//                         }
//                         return { valid: false };
//                     }
//                 });
//             }
//             // Mission: Diggy PreRegister Tweet (Diggy, missionId 1)
//             else if (name === 'diggy' && missionId === 1n) {
//                 await processTweetMission({
//                     query: `from:${userHandle} @diggycoin_ pre-registered GOLD`,
//                     tweetFields: 'created_at',
//                     pointsCalculation: 'fixed',
//                     tweetValidator: (response) => {
//                         if (response && response.data && response.data.data && response.data.data.length > 0) {
//                             for (let tweet of response.data.data) {
//                                 const tweetText = tweet.text;
//                                 if (
//                                     tweetText.includes('@diggycoin_') &&
//                                     tweetText.toLowerCase().includes('pre-registered') &&
//                                     tweetText.includes('GOLD')
//                                 ) {
//                                     return { valid: true, tweetId: tweet.id };
//                                 }
//                             }
//                         }
//                         return { valid: false };
//                     }
//                 });
//             }
//             // Mission: Tweet tagging oisy with at least 20 words (Oisy, missionId 4)
//             else if (name === 'oisy' && missionId === 4n) {
//                 await processTweetMission({
//                     query: `from:${userHandle} "@oisy"`,
//                     tweetFields: 'text',
//                     pointsCalculation: 'fixed',
//                     tweetValidator: (response) => {
//                         if (response && response.data && response.data.data && response.data.data.length > 0) {
//                             for (const tweet of response.data.data) {
//                                 const wordCount = tweet.text.split(/\s+/).filter(Boolean).length;
//                                 if (wordCount >= 20) {
//                                     return { valid: true, tweetId: tweet.id };
//                                 }
//                             }
//                         }
//                         return { valid: false };
//                     }
//                 });
//             }
//         } else {
//             sendFinalResponse(res, '', '', 'fake');
//         }
//     } catch (error) {
//         console.error('Error during Twitter OAuth2 or Motoko interaction:', error.message);
//         sendFinalResponse(res, '', '', 'false');
//     }
// });

// // TWITTER RETWEET

// app.post('/requestTwitterAuth-v2-retweet', async (req, res) => {
//     await handleTwitterAuthRequest(req, res, `https://${doAddress}/twitter-callback-v2-retweet`);
// });

// app.get('/twitter-callback-v2-retweet', async (req, res) => {
//     try {
//         const redirectUri = `https://${doAddress}/twitter-callback-v2-retweet`;
//         const result = await handleTwitterCallback(req, res, redirectUri);
//         const { loggedClient, accessToken, refreshToken, userId, userHandle, bio, optUserId, actor, actorIndex, didhe, userUUID, missionId, name } = result;

//         if (!didhe) {
//             if (name === 'konecta' && missionId === 5n) { // Retweet Konecta recursive mission
//                 const receivedTexts = loadData();
//                 const retwId = receivedTexts.get('retwId');

//                 if (!retwId) {
//                     return res.status(400).json({ error: 'No tweet ID available for retweeting.' });
//                 }

//                 let followSuccess = false;

//                 try {
//                     await loggedClient.v2.retweet(userId, retwId);
//                     followSuccess = true;
//                 } catch (retweetError) {
//                     if (
//                         retweetError.code === 400 &&
//                         retweetError.data &&
//                         retweetError.data.errors &&
//                         retweetError.data.errors[0] &&
//                         retweetError.data.errors[0].message === 'You cannot retweet a Tweet that you have already retweeted.'
//                     ) {
//                         followSuccess = true;
//                     } else {
//                         throw error;
//                     }
//                 }

//                 if (followSuccess) {
//                     await actorIndex.addTwitterInfo(userUUID, optUserId, userHandle);
//                     const missionData = await actor.getMissionById(missionId);
//                     const mission = missionData[0];
//                     const pointsEarned = getRandomBigInt(
//                         BigInt(mission.mintime),
//                         BigInt(mission.maxtime)
//                     );
//                     await updateUserProgress(actor, userUUID, missionId, pointsEarned, [retwId]);
//                     sendFinalResponse(res, accessToken, refreshToken, 'true');
//                 } else {
//                     sendFinalResponse(res, '', '', 'notfound');
//                 }
//             }
//         } else {
//             sendFinalResponse(res, '', '', 'fake');
//         }
//     } catch (error) {
//         console.error('Error during authentication or retweeting:', error);
//         sendFinalResponse(res, '', '', 'false');
//     }
// });

// // TWITTER CHECK BIO

// app.post('/requestTwitterAuth-v2-bio', async (req, res) => {
//     await handleTwitterAuthRequest(req, res, `https://${doAddress}/twitter-callback-v2-bio`);
// });

// app.get('/twitter-callback-v2-bio', async (req, res) => {
//     try {
//         const redirectUri = `https://${doAddress}/twitter-callback-v2-bio`;
//         const result = await handleTwitterCallback(req, res, redirectUri);
//         const { loggedClient, accessToken, refreshToken, userId, userHandle, bio, optUserId, actor, actorIndex, didhe, userUUID, missionId, name } = result;
//         if (!didhe) {

//             if (name === 'oisy' && missionId === 5n) {
//                 if (bio.includes('🪙')) {
//                     await actorIndex.addTwitterInfo(userUUID, optUserId, userHandle);
//                     const [mission] = await actor.getMissionById(missionId);
//                     const pointsEarned = mission.points;
//                     await updateUserProgress(actor, userUUID, missionId, pointsEarned);
//                     sendFinalResponse(res, accessToken, refreshToken, 'true');
//                 } else {
//                     sendFinalResponse(res, '', '', 'notfound');
//                 }
//             }

//         } else {
//             sendFinalResponse(res, '', '', 'fake');
//         }
//     } catch (error) {
//         console.error('Error during authentication or checking profile:', error);
//         sendFinalResponse(res, '', '', 'false');
//     }
// });

// app.post('/requestDiscordAuth', async (req, res) => {
//     const origin = req.get('origin') || req.get('referrer');
//     if (origin !== frontAddress) {
//         return res.status(403).json({ message: 'Forbidden: Invalid Origin' });
//     }

//     try {
//         const { principal, missionIdStr, name } = validateRequestBody(req);
//         const missionId = BigInt(missionIdStr);

//         const actor = await getActorByName(name);
//         const principalObj = Principal.fromText(principal.__principal__);

//         const actorIndex = await createActorWithIndexIdentity();
//         const userUUID = await actorIndex.getUUID(principalObj);

//         // Check if the user is allowed to perform the mission
//         const canDoMission = await actor.canUserDoMission(userUUID, missionId);
//         if (!canDoMission) {
//             return res.status(403).send({ error: 'Not authorized for this mission' });
//         }

//         // Store state and principal in codeVerifierStore

//         const state = crypto.randomBytes(16).toString('hex');
//         codeVerifierStore[state] = { userUUID, missionId, name };

//         const params = new URLSearchParams({
//             client_id: ENV.DISCORD_CLIENT_ID,
//             redirect_uri: `https://${doAddress}/discord-callback`,
//             response_type: 'code',
//             scope: 'identify guilds',
//             state: state,
//         });

//         const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

//         res.status(200).send({ authURL: discordAuthUrl });

//     } catch (error) {
//         console.error('Error initiating Discord OAuth2 flow:', error);
//         res.status(500).send({ error: 'Failed to generate Discord auth link' });
//     }
// });

// app.get('/discord-callback', async (req, res) => {

//     const { code, state } = req.query;
//     const codeData = codeVerifierStore[state];
//     delete codeVerifierStore[state];

//     if (!codeData) {
//         throw new Error('Code verifier missing. Please retry the authentication flow.');
//     }
//     const { userUUID, missionId, name } = codeData;

//     if (!code) {
//         throw new Error('Missing code in callback');
//     }

//     try {
//         const tokenResponse = await axios.post(
//             'https://discord.com/api/oauth2/token',
//             querystring.stringify({
//                 client_id: ENV.DISCORD_CLIENT_ID,
//                 client_secret: ENV.DISCORD_CLIENT_SECRET,
//                 grant_type: 'authorization_code',
//                 code: code,
//                 redirect_uri: `https://${doAddress}/discord-callback`,
//             }),
//             {
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//             }
//         );

//         const accessToken = tokenResponse.data.access_token;
//         const refreshToken = tokenResponse.data.refresh_token || '';

//         // Fetch user's guilds
//         const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//         });

//         const guilds = guildsResponse.data;

//         const userResponse = await axios.get('https://discord.com/api/users/@me', {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//         });

//         const { username, discriminator } = userResponse.data;

//         const fullUsername = `${username}#${discriminator}`;

//         const actor = await getActorByName(name);

//         const actorIndex = await createActorWithIndexIdentity();

//         const didhe = await actorIndex.isDiscordUsed(userUUID, fullUsername);

//         if (!didhe) {
//             if (name === 'oisy' && missionId === 2n) {
//                 const isMember = guilds.some(guild => guild.id === "1306209157279645776");

//                 if (isMember) {

//                     await actorIndex.addDiscordInfo(userUUID, fullUsername);

//                     const missionData = await actor.getMissionById(missionId);
//                     const pointsEarned = missionData[0].points;
//                     await updateUserProgress(actor, userUUID, missionId, pointsEarned);
//                     sendFinalResponse(res, accessToken, refreshToken, 'true');

//                 } else {
//                     sendFinalResponse(res, '', '', 'notfound');
//                 }
//             }
//         } else {
//             sendFinalResponse(res, '', '', 'fake');
//         }
//     } catch (error) {
//         console.error('Error during authentication or checking discord:', error);
//         sendFinalResponse(res, '', '', 'false');
//     }
// });

// app.post('/requestRedditAuth', async (req, res) => {
//     const origin = req.get('origin') || req.get('referrer');
//     if (origin !== frontAddress) {
//         return res.status(403).json({ message: 'Forbidden: Invalid Origin' });
//     }

//     try {
//         // 1. Validate body & look‑up mission / actor
//         const { principal, missionIdStr, name } = validateRequestBody(req);
//         const missionId = BigInt(missionIdStr);
//         const actor = await getActorByName(name);

//         // 2. Map principal → UUID and permission‑check mission
//         const principalObj = Principal.fromText(principal.__principal__);
//         const actorIndex = await createActorWithIndexIdentity();
//         const userUUID = await actorIndex.getUUID(principalObj);

//         const canDoMission = await actor.canUserDoMission(userUUID, missionId);
//         if (!canDoMission) {
//             return res.status(403).send({ error: 'Not authorized for this mission' });
//         }

//         // 3. Build Reddit OAuth2 URL (store state → user data)
//         const state = crypto.randomBytes(16).toString('hex');
//         codeVerifierStore[state] = { userUUID, missionId, name };

//         const params = new URLSearchParams({
//             client_id: ENV.REDDIT_CLIENT_ID,
//             response_type: 'code',
//             state,
//             redirect_uri: `https://${doAddress}/reddit-callback`,
//             duration: 'permanent',            // refresh_token wanted
//             scope: 'identity mysubreddits'
//         });

//         res.status(200).send({ authURL: `https://www.reddit.com/api/v1/authorize?${params}` });
//     } catch (err) {
//         console.error('Error generating Reddit auth link:', err);
//         res.status(err.status || 500).send({ error: err.error || 'Failed to generate Reddit auth link' });
//     }
// });


// app.get('/reddit-callback', async (req, res) => {
//     const { code, state } = req.query;

//     try {
//         // 1. Recover mission context
//         const codeData = codeVerifierStore[state];
//         delete codeVerifierStore[state];
//         if (!codeData) throw new Error('Invalid state parameter');

//         const { userUUID, missionId, name } = codeData;
//         if (!code) throw new Error('Missing code in callback');

//         // 2. Exchange code → tokens
//         const tokenParams = new URLSearchParams({
//             grant_type: 'authorization_code',
//             code,
//             redirect_uri: `https://${doAddress}/reddit-callback`,
//         });

//         const tokenResponse = await axios.post(
//             'https://www.reddit.com/api/v1/access_token',
//             tokenParams.toString(),
//             {
//                 auth: { username: ENV.REDDIT_CLIENT_ID, password: ENV.REDDIT_CLIENT_SECRET },
//                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//             }
//         );

//         const accessToken = tokenResponse.data.access_token;
//         const refreshToken = tokenResponse.data.refresh_token || '';

//         // 3. Pull user info + subscribed subreddits
//         const redditHeaders = {
//             Authorization: `Bearer ${accessToken}`,
//             'User-Agent': 'KonectaRedditApp/0.1 by Konecta',
//         };

//         // handle & basic profile
//         const meRes = await axios.get('https://oauth.reddit.com/api/v1/me', { headers: redditHeaders });
//         const redditHandle = meRes.data.name;

//         // list subscriptions (may paginate with `after`)
//         let after = null, joinedOISY = false;
//         do {
//             const url = `https://oauth.reddit.com/subreddits/mine/subscriber?limit=100${after ? `&after=${after}` : ''}`;
//             const subs = await axios.get(url, { headers: redditHeaders });
//             joinedOISY = subs.data.data.children.some(s => s.data.display_name.toLowerCase() === 'oisy');
//             after = subs.data.data.after;
//         } while (after && !joinedOISY);

//         const actor = await getActorByName(name);
//         const actorIndex = await createActorWithIndexIdentity();

//         // 4. Duplicate‑check
//         const already = await actorIndex.isRedditUsed(userUUID, redditHandle);
//         if (already) {
//             return sendFinalResponse(res, '', '', 'fake');
//         }

//         // 5. Mission‑specific logic (currently only Oisy)
//         if (name === 'oisy' && missionId === 6n && joinedOISY) {
//             await actorIndex.addRedditInfo(userUUID, redditHandle);

//             const missionData = await actor.getMissionById(missionId);
//             const pointsEarned = missionData[0].points;

//             await updateUserProgress(actor, userUUID, missionId, pointsEarned);
//             return sendFinalResponse(res, accessToken, refreshToken, 'true');
//         }

//         // Not joined or mission mismatch
//         return sendFinalResponse(res, '', '', 'notfound');

//     } catch (err) {
//         console.error('Error during Reddit OAuth flow:', err);
//         return sendFinalResponse(res, '', '', 'false');
//     }
// });

// const mailgun = new Mailgun(formData);

// const mg = mailgun.client({
//     username: 'api',
//     key: ENV.MAILGUN_API_KEY,
// });

// app.post('/send-email', async (req, res) => {
//     const { name, email, message } = req.body;

//     try {
//         const mgResponse = await mg.messages.create(ENV.MAILGUN_DOMAIN, {
//             from: `${name} <mailgun@${ENV.MAILGUN_DOMAIN}>`,
//             'h:Reply-To': email,
//             to: [ENV.EMAIL],
//             subject: `${name} wants an awesome Web3 Game!`,
//             text: message,
//             html: `
//               <html>
//                 <head>
//                   <meta charset="UTF-8">
//                   <title>New Web3 Game Request</title>
//                 </head>
//                 <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
//                   <table width="100%" cellpadding="0" cellspacing="0" border="0">
//                     <tr>
//                       <td align="center" style="padding: 20px 0;">
//                         <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
//                           <tr>
//                             <td style="background-color:#333333; padding: 20px; text-align:center;">
//                               <h1 style="color:#ffffff; margin:0; font-size:24px;">New Web3 Game Request</h1>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td style="padding: 20px; color:#333333;">
//                               <p>You have received a new message from:</p>
//                               <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
//                                 <tr>
//                                   <td style="padding:8px; border:1px solid #dddddd;"><strong>Name:</strong></td>
//                                   <td style="padding:8px; border:1px solid #dddddd;">${name}</td>
//                                 </tr>
//                                 <tr>
//                                   <td style="padding:8px; border:1px solid #dddddd;"><strong>Email:</strong></td>
//                                   <td style="padding:8px; border:1px solid #dddddd;">${email}</td>
//                                 </tr>
//                               </table>
//                               <p><strong>Message:</strong></p>
//                               <p>${message}</p>
//                             </td>
//                           </tr>
//                         </table>
//                       </td>
//                     </tr>
//                   </table>
//                 </body>
//               </html>
//             `,
//         });

//         console.log('Mailgun Response:', mgResponse);
//         res.status(200).json({ success: true, message: 'Email sent successfully!' });
//     } catch (err) {
//         console.error('Error sending email:', err);
//         res.status(500).json({ success: false, message: 'Failed to send email.', error: err.message });
//     }
// });

