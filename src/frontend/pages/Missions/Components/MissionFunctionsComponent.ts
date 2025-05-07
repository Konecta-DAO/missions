import { Actor } from "@dfinity/agent";
import { canisterId, idlFactory } from "../../../../declarations/backend/index.js";
import { idlFactory as idlFactoryNFID, canisterId as canisterIdNFID } from '../../../../declarations/nfid/index.js';
import { idlFactory as idlFactoryDFINITY } from '../../../../declarations/dfinity_backend/index.js';
import { idlFactory as idlFactoryOisy } from '../../../../declarations/oisy_backend/index.js';
import { idlFactory as idlFactoryMP } from '../../../../declarations/mushroom_backend/index.js';
import { idlFactory as idlFactoryDiggy } from '../../../../declarations/diggy_backend/index.js';
import { idlFactory as idlFactoryICT } from '../../../../declarations/ictoolkit_backend/index.js';
import { Usergeek } from "usergeek-ic-js";
import { idlFactory as idlFactoryIndex, SerializedProjectMissions } from '../../../../declarations/index/index.did.js';
import { idlFactory as idlFactoryDefault } from '../../../../declarations/dfinity_backend/index.js';
import { Principal } from "@dfinity/principal";
import { IndexCanisterId } from "../../../main.tsx";
import { GlobalIDType } from "../../../../hooks/globalID.tsx";
import { toast } from 'react-hot-toast';
import { ICToolkitMissionType } from "../../../../declarations/ictoolkit_backend/ictoolkit_backend.did.js";

export const doAddress = "dotest.konecta.one";

function refreshAll(globalID: GlobalIDType, fetchData: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => void, setLoading: (loading: boolean) => void, closeModal: () => void) {
    // Create the actor for the index canister
    const actorIndex = Actor.createActor(idlFactoryIndex, {
        agent: globalID.agent!,
        canisterId: IndexCanisterId,
    });

    // Check if a new project has been added
    actorIndex.getAllProjectMissions().then((result: any) => {
        const projects: SerializedProjectMissions[] = result as SerializedProjectMissions[];
        const targets: string[] = projects.map(project => project.canisterId.toText());
        if (
            JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) &&
            globalID.canisterIds != null &&
            globalID.canisterIds.length > 0
        ) {
            toast('A new project has been added to Konecta! Refreshing the page...', { icon: '👀' });
            disconnect();
            window.location.href = '/konnect';
        }
    });

    // Create the mission actor
    const actor = Actor.createActor(idlFactory, {
        agent: globalID.agent!,
        canisterId,
    });

    // Create actors for each target canister
    const actors = globalID.canisterIds!.map((targetCanisterId: string) =>
        Actor.createActor(idlFactoryDefault, {
            agent: globalID.agent!,
            canisterId: targetCanisterId,
        })
    );

    // Fetch updated data
    fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds, globalID.principalId, setPlacestate, setPlacestate);

    // Final UI updates
    setLoading(false);
    closeModal();
}

interface TwitterAuthConfig {
    globalID: GlobalIDType;
    type: 'follow' | 'retweet' | 'tweet' | 'bio' | 'redditJoin' | 'discordMember';
    name: 'konecta' | 'diggy' | 'oisy' | 'mushroom' | 'dfinity';
    missionId: bigint;
    trackEventName: string;
    successMessage: string;
    notFoundMessage?: string;
    errorMessage: string;
    closeModal: () => void;
    setLoading: (loading: boolean) => void;
    fetchData: any;
    setPlacestate: React.Dispatch<React.SetStateAction<boolean>>;
    disconnect: () => void;
    extraAction?: () => void;
}

export async function handleTwitterAuth(config: TwitterAuthConfig): Promise<void> {
    const { globalID, type, name, missionId, trackEventName, successMessage, notFoundMessage, errorMessage, closeModal, setLoading, fetchData, setPlacestate, disconnect, extraAction, } = config;
    const principal = globalID.principalId;

    const endpoint = type === 'follow' ? 'requestTwitterAuth-v2-follow' : type === 'retweet' ? 'requestTwitterAuth-v2-retweet' : type === 'tweet' ? 'requestTwitterAuth-v2-tweet' : type === 'bio' ? 'requestTwitterAuth-v2-bio' : type === 'redditJoin' ? 'requestRedditAuth' : type === 'discordMember' ? 'requestDiscordAuth' : '';

    try {
        const body = {
            principal,
            missionIdStr: missionId.toString(),
            name,
        };

        const res = await fetch(`https://${doAddress}/${endpoint}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const { authURL } = await res.json();

        let authHandled = false;
        let popup: Window | null = null;

        const handleEvent = (event: MessageEvent<any>) => {

            if (authHandled) return;
            if (event.origin !== `https://${doAddress}`) return;

            const { accessToken, refreshToken, result } = event.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            if (extraAction) extraAction();

            authHandled = true;
            window.removeEventListener('message', handleEvent);
            popup?.close();
            setLoading(false);

            if (result === 'true') {
                refreshAll(globalID, fetchData, setPlacestate, disconnect, setLoading, closeModal);
            }

            if (result === 'true') {
                toast.success(successMessage);
                trackEventName && Usergeek.trackEvent(trackEventName);
            } else if (result === 'fake') {
                toast.error("You can't use the same Twitter account in two different principals.");
            } else if (result === 'notfound') {
                toast.error(notFoundMessage!);
            } else {
                toast.error(errorMessage);
            }
        };

        window.addEventListener('message', handleEvent);
        popup = window.open(authURL, 'TwitterAuth', 'width=600,height=800');

        const checkClosed = setInterval(() => {
            if (popup && popup.closed && !authHandled) {
                clearInterval(checkClosed);
                window.removeEventListener('message', handleEvent);
                setLoading(false);
                toast.error('You closed the Twitter authorization window.');
            }
        }, 300);
    } catch (error) {
        console.error("Error fetching Twitter auth URL:", error);
        setLoading(false);
    }
};

const MissionFunctionsComponent = {
    followKonecta: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            name: "konecta",
            type: "follow",
            missionId: missionid,
            trackEventName: "Mission 1: Follow",
            successMessage: "Success!",
            errorMessage: "We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.",
            closeModal,
            setLoading,
            fetchData,
            setPlacestate,
            disconnect,
        });
    },

    verifyPFP: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, _missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent!,
            canisterId,
        })
        if (globalID.userPFPstatus !== "loading") {
            globalID.setPFPstatus = await fetchData.fetchUserPFPstatus(actor, globalID.principalId);
            toast.error("PFP status not verified. Please upload your updated profile picture to your twitter profile or wait for manual verification if you already did.");
        } else {
            toast("PFP status already set successfully. You will soon be manually verified", { icon: '👀' });
        }

        refreshAll(globalID, fetchData, setPlacestate, disconnect, setLoading, closeModal);
    },

    verifyPFPTW: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            type: "tweet",
            name: "konecta",
            missionId: missionid,
            trackEventName: "Mission 3: PFP Tweet",
            successMessage: "Success!",
            notFoundMessage: "No Tweet Found!",
            errorMessage: "We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.",
            closeModal, setLoading, fetchData, setPlacestate, disconnect,
        });
    },

    vfTweet: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            type: "tweet",
            name: "konecta",
            missionId: missionid,
            trackEventName: "Mission 4: Tweet",
            successMessage: "Success!",
            notFoundMessage: "No Tweet Found!",
            errorMessage: "We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.",
            closeModal, setLoading, fetchData, setPlacestate, disconnect,
        });
    },

    verRT: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            name: "konecta",
            type: "retweet",
            missionId: missionid,
            trackEventName: "Mission 5: Retweet",
            successMessage: "Success!",
            errorMessage: "We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.",
            closeModal,
            setLoading,
            fetchData,
            setPlacestate,
            disconnect,
        });
    },

    sendKamiDM: async (globalID: GlobalIDType, _fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, _closeModal: () => void, missionid: bigint, _input: any, _setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, _disconnect: () => Promise<void>) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent!,
            canisterId,
        })
        await actor.setPFPProgressLoading(globalID.principalId);
        const url = 'https://x.com/messages/compose?recipient_id=1828134613375488000&text=Kami%2C%20I%27m%20on%20a%20mission%20for%20a%20killer%20profile%20pic.%20Let%E2%80%99s%20make%20it%20happen!';
        window.open(url, '_blank');
        setLoading(false);
    },

    twPFP: async (_globalID: GlobalIDType, _fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, _closeModal: () => void, missionid: bigint, _input: any, _setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, _disconnect: () => Promise<void>) => {
        const url = 'https://twitter.com/intent/tweet?text=Leveling%20up%20my%20profile%20with%20%23KonectaPFP%21%20Time%E2%80%99s%20on%20my%20side%20now.%20%24ICP%20%E2%8F%B3';
        window.open(url, '_blank');
        setLoading(false);
    },

    gTW: async (_globalID: GlobalIDType, _fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, _closeModal: () => void, missionid: bigint, _input: any, _setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, _disconnect: () => Promise<void>) => {
        const url = 'https://twitter.com/intent/tweet';
        window.open(url, '_blank');
        setLoading(false);
    },

    submitCode: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent!,
            canisterId,
        })

        const a = await actor.followKonectaNuanceMission(globalID.principalId) as string;
        if (a === "Success") {
            refreshAll(globalID, fetchData, setPlacestate, disconnect, setLoading, closeModal);
            toast.success(a);
        } else {
            toast.error(a);
            setLoading(false);
        }
    },

    nuanceMission: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        const actor = Actor.createActor(idlFactory, {
            agent: globalID.agent!,
            canisterId,
        })
        const a = await actor.missionOne(globalID.principalId, input) as string;
        if (a === "Success") {
            Usergeek.trackEvent("Dfinity Mission One: Hello World");
            refreshAll(globalID, fetchData, setPlacestate, disconnect, setLoading, closeModal);
            toast.success(a);
        } else {
            toast.error(a);
            setLoading(false);
        }
    },

    // DISABLED
    dfinityFollowTW: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            name: "dfinity",
            type: "follow",
            missionId: missionid,
            trackEventName: "DFINITY Mission: Retweet",
            successMessage: "Success!",
            errorMessage: "We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.",
            closeModal,
            setLoading,
            fetchData,
            setPlacestate,
            disconnect,
        });
    },

    verifyOisyICP: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        const actor = Actor.createActor(idlFactoryOisy, {
            agent: globalID.agent!,
            canisterId: "eyark-fqaaa-aaaag-qm7oa-cai",
        })
        const a = await actor.verifyOisyICP(globalID.principalId) as string;
        if (a === "Success") {
            Usergeek.trackEvent("Oisy Mission One: Have ICP on Oisy");
            refreshAll(globalID, fetchData, setPlacestate, disconnect, setLoading, closeModal);
            toast.success(a);
        } else {
            toast.error(a);
            setLoading(false);
        };
    },

    verifyOisyOG: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        const actor = Actor.createActor(idlFactoryOisy, {
            agent: globalID.agent!,
            canisterId: "eyark-fqaaa-aaaag-qm7oa-cai",
        })
        const a = await actor.verifyOisyOG(globalID.principalId) as string;
        if (a === "Success") {
            Usergeek.trackEvent("Oisy Mission Two: Be an Oisy OG");
            refreshAll(globalID, fetchData, setPlacestate, disconnect, setLoading, closeModal);
            toast.success(a);
        } else {
            toast.error(a);
            setLoading(false);
        };
    },


    goICPandaMission: async (_globalID: GlobalIDType, _fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, _closeModal: () => void, missionid: bigint, _input: any) => {
        const url = 'https://twitter.com/intent/tweet?in_reply_to=1890856928701460621';
        window.open(url, '_blank');
        setLoading(false);
    },

    verifyICPandaMission: async (_globalID: GlobalIDType, _fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any) => {
        toast('You will be verified soon. Please wait for the manual verification process to complete.', { icon: '👀' });
        setLoading(false);
        closeModal();
    },


    preVerifyDiggy: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {

        const validateInput = (input: string): string | null => {
            const sanitized = input.replace(/\s+/g, '').toLowerCase();
            const regex = /^(?:[a-z0-9]{5}-){10}[a-z0-9]{3}$/;
            return regex.test(sanitized) ? sanitized : null;
        };

        const validInput = validateInput(input);
        if (!validInput) {
            toast.error("Invalid Diggy Principal.");
            setLoading(false);
            return;
        }

        const actor = Actor.createActor(idlFactoryDiggy, {
            agent: globalID.agent!,
            canisterId: "sixqu-5iaaa-aaaag-qngwa-cai",
        })
        const a = await actor.preRegisterMission(globalID.principalId, Principal.fromText(validInput)) as string;

        if (a === "Success") {
            Usergeek.trackEvent("Diggy Mission One: PreRegister Validation");
            refreshAll(globalID, fetchData, setPlacestate, disconnect, setLoading, closeModal);
            toast.success(a);
        } else {
            toast.error(a);
            setLoading(false);
        };
    },
    tweetDiggy: async (_globalID: GlobalIDType, _fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, _closeModal: () => void, _missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        window.open("https://x.com/intent/tweet?text=%F0%9F%9A%A8EXCLUSIVE%20ACCESS%20%2B%20FREE%20GOLD%F0%9F%9A%A8%0A%0AI%20pre-registered%20at%20%40diggycoin_%20and%20earned%20%23GOLD%F0%9F%AA%99%0A%0ANow%20I%E2%80%99ll%20play%20the%20exclusive%20game%20launch%20and%20earn%20$DIGGY%20%F0%9F%8E%AE%0A%0AYou%20can%20too!%20Pre-register%20now%2C%20claim%2050%20FREE%20GOLD%2C%20and%20unlock%20up%20to%20200%20GOLD!%F0%9F%AB%B5%0A%0ALimited%20spots%20available%20%F0%9F%98%B1%20%F0%9F%91%87%0Ahttps%3A%2F%2Ftz5ol-faaaa-aaaag-qngtq-cai.icp0.io%2Ffree-gold", '_blank');
        setLoading(false);
    },
    preVerifyDiggyTweet: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            name: "diggy",
            type: "tweet",
            missionId: missionid,
            trackEventName: "DIGGY Mission 1: Tweet",
            successMessage: "Success!",
            notFoundMessage: "No Tweet Found!",
            errorMessage: "We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.",
            closeModal, setLoading, fetchData, setPlacestate, disconnect,
        });
    },
    oisyDiscord: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            name: "oisy",
            type: "discordMember",
            missionId: missionid,
            trackEventName: "Oisy Mission: Discord Member",
            successMessage: "Success! You are a member of the Oisy Discord.",
            notFoundMessage: "User is not a member of the Discord server.",
            errorMessage: "Discord verification error. Please try again later.",
            closeModal,
            setLoading,
            fetchData,
            setPlacestate,
            disconnect,
        });
    },
    followOisyTW: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            name: "oisy",
            type: "follow",
            missionId: missionid,
            trackEventName: "Oisy Mission: Follow",
            successMessage: "Success! You now follow Oisy on Twitter.",
            errorMessage: "Twitter API error. Please try again later.",
            closeModal,
            setLoading,
            fetchData,
            setPlacestate,
            disconnect,
        });
    },
    tweetOisy: async (_globalID: GlobalIDType, _fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, _closeModal: () => void, missionid: bigint, _input: any) => {
        window.open("https://x.com/intent/tweet?text=@oisy", '_blank');
        setLoading(false);
    },
    verifyOisyTweet: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            type: 'tweet',
            name: 'oisy',
            missionId: missionid,
            trackEventName: "Oisy Mission: Verify Tweet",
            successMessage: "Tweet verified successfully!",
            notFoundMessage: "No valid tweet found. Please tweet with @oisy and at least 20 words.",
            errorMessage: "Verification failed. Please try again later.",
            closeModal, setLoading, fetchData, setPlacestate, disconnect,
        });
    },
    goTWProfile: async (_globalID: GlobalIDType, _fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, _closeModal: () => void, missionid: bigint, _input: any) => {
        window.open("https://x.com/settings/profile", '_blank');
        setLoading(false);
    },
    verifyOisyBio: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            name: "oisy",
            type: "bio",
            missionId: missionid,
            trackEventName: "Oisy Mission: Verified Twitter Bio Emoji",
            successMessage: "Success! Twitter bio contains the 🪙 emoji.",
            notFoundMessage: "Twitter bio does not contain the required 🪙 emoji. Please update your bio and try again.",
            errorMessage: "We broke the roof! Twitter API has reached its limit for our Dev account. Please try again later.",
            closeModal,
            setLoading,
            fetchData,
            setPlacestate,
            disconnect,
        });
    },
    goOisyReddit: async (_globalID: GlobalIDType, _fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, _closeModal: () => void, missionid: bigint, _input: any) => {
        window.open("https://www.reddit.com/r/OISY/", '_blank');
        setLoading(false);
    },
    verifyOisyReddit: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        handleTwitterAuth({
            globalID,
            name: "oisy",
            type: "redditJoin",           // new unified endpoint
            missionId: missionid,
            trackEventName: "Oisy Mission: Join Reddit",
            successMessage: "Success! You have joined r/OISY on Reddit.",
            notFoundMessage: "Verification failed: you haven't joined r/OISY.",
            errorMessage: "Reddit verification error. Please try again later.",
            closeModal,
            setLoading,
            fetchData,
            setPlacestate,
            disconnect,
        });
    },
    goICT6: async (globalID: GlobalIDType, fetchData: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, closeModal: () => void, missionid: bigint, _input: any, setPlacestate: React.Dispatch<React.SetStateAction<boolean>>, disconnect: () => Promise<void>) => {
        const actor = Actor.createActor(idlFactoryICT, {
            agent: globalID.agent!,
            canisterId: "rye2s-biaaa-aaaag-qng6a-cai",
        });

        const payload: [ICToolkitMissionType, [] | [string[]]][] = [
            [{ PointsVote: null }, [["jfnic-kaaaa-aaaaq-aadla-cai", "3143"]]],
            [{ RewardVoteOnToolkit: null }, [["jfnic-kaaaa-aaaaq-aadla-cai", "3143"]]],
        ];

        const results = await actor.missionsMainEndpoint(
            payload,
            globalID.principalId
        ) as boolean[];

        // show the raw true/false array
        toast.success(`Results: ${results.map(r => r.toString()).join(", ")}`);

        if (results.every(r => r)) {
            Usergeek.trackEvent("Oisy Mission Two: Be an Oisy OG");
            refreshAll(globalID, fetchData, setPlacestate, disconnect, setLoading, closeModal);
            toast.success("All missions succeeded!");
        } else {
            toast.error("Some missions failed.");
            setLoading(false);
        }
    },
};

export default MissionFunctionsComponent;