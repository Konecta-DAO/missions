import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import './NFIDVerification.css';
import { SerializedUser as SerializedUserNFID } from '../../../../../declarations/nfid/nfid.did.js';
import { Principal } from '@dfinity/principal';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { canisterId as canistedIdNFID, idlFactory as idlFactoryNFID } from '../../../../../declarations/nfid/index.js';
import { Actor, HttpAgent } from '@dfinity/agent';
import missionFunctions from '../MissionFunctionsComponent.ts';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { useMediaQuery } from 'react-responsive';

interface NFIDVerificationProps {
    isVisible: boolean;
    identity: any;
    setIsVisible: any;
    setIsVerified: any;
}

const NFIDVerification: React.FC<NFIDVerificationProps> = ({ isVisible, identity, setIsVisible, setIsVerified }) => {

    const globalID = useGlobalID();
    const fetchData = useFetchData();
    const [user, setUser] = useState<SerializedUserNFID | null>(null);
    const minForm = useMediaQuery({ query: '(max-width: 950px)' });
    const [telegramUser, setTelegramUser] = useState<string>('');
    const [openChatUser, setOpenChatUser] = useState<string>('');
    const [nnsPrincipal, setNnsPrincipal] = useState<string>('');

    const [twitterVerified, setTwitterVerified] = useState<boolean>(false);
    const [discordVerified, setDiscordVerified] = useState<boolean>(false);
    const [twitterLoading, setTwitterLoading] = useState<boolean>(false);
    const [discordLoading, setDiscordLoading] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [placestate, setPlacestate] = useState<boolean>(false);

    const [nnsValid, setNnsValid] = useState<boolean>(false);
    const [nnsContainsSpaces, setNnsContainsSpaces] = useState<boolean>(false);



    const setData = async () => {
        if (globalID.principalId != null) {
            const agent = HttpAgent.createSync({ identity });
            const actorNfid = Actor.createActor(idlFactoryNFID, {
                agent: agent,
                canisterId: canistedIdNFID,
            });

            const placeHolderUserArray = await actorNfid.getPlaceholderUser(globalID.principalId) as SerializedUserNFID[];

            let placeHolderUser: SerializedUserNFID;
            if (placeHolderUserArray && placeHolderUserArray.length > 0) {
                placeHolderUser = placeHolderUserArray[0];
            } else {
                // Initialize an empty SerializedUser with the globalID.principalId as id
                placeHolderUser = {
                    id: globalID.principalId,
                    ocCompleted: false,
                    telegramUser: [],
                    ocProfile: [],
                    discordUser: [],
                    creationTime: BigInt(Date.now()),
                    twitterhandle: [],
                    pfpProgress: "",
                    twitterid: [],
                    nnsPrincipal: [],
                    totalPoints: BigInt(0),
                };
            }

            // Check Twitter and Discord verification status
            const verifiedTw = await actorNfid.isTwitterVerifiedNFID(globalID.principalId);
            if (verifiedTw) {
                setTwitterVerified(true);
            }

            const verifiedDc = await actorNfid.isDCVerifiedNFID(globalID.principalId);
            if (verifiedDc) {
                setDiscordVerified(true);
            }

            setUser(placeHolderUser);
        }
    };


    useEffect(() => {
        setData();
    }, [globalID.principalId]);

    useEffect(() => {
        if (user) {
            setTelegramUser(user.telegramUser?.[0] ?? '');
            setOpenChatUser(user.ocProfile?.[0] ?? '');
            setNnsPrincipal(user.nnsPrincipal?.[0]?.toText() ?? '');
        }
    }, [user]);

    if (!isVisible) {
        return null;
    }

    if (!user || globalID.principalId == null) {
        return null;
    }

    // Handler for Telegram User input
    const handleTelegramChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTelegramUser(e.target.value);
    };

    // Handler for OpenChat User input
    const handleOpenChatChange = (e: ChangeEvent<HTMLInputElement>) => {
        setOpenChatUser(e.target.value);
    };

    // Handler for NNS Principal input
    const handleNnsPrincipalChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNnsPrincipal(value);

        // Check if it contains spaces
        const containsSpaces = /\s/.test(value);
        setNnsContainsSpaces(containsSpaces);

        // Validate NNS Principal
        const regex = /^([a-z0-9]{5}-){10}[a-z0-9]{3}$/;
        setNnsValid(regex.test(value) && !containsSpaces);
    };


    // Handler for Verify Twitter button
    const handleVerifyTwitter = async () => {
        setTwitterLoading(true);
        try {
            await missionFunctions.followNFIDTwitter(globalID, fetchData, setTwitterLoading, setPlacestate, setTwitterVerified);
        } catch (error) {
            console.error(`Error verifying Twitter`, error);
            setTwitterLoading(false);
        }
    };


    // Handler for Verify Discord button
    const handleVerifyDiscord = async () => {
        setDiscordLoading(true);
        try {
            await missionFunctions.discordMission(globalID, fetchData, setDiscordLoading, setPlacestate, setDiscordVerified);
        } catch (error) {
            console.error(`Error verifying Discord`, error);
            setDiscordLoading(false);
        }
    };


    // Handler for form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        if (!nnsValid) {
            if (nnsContainsSpaces) {
                alert("NNS can't contain spaces.");
            } else {
                alert('Please enter a valid NNS Principal.');
            }
            setSubmitLoading(false);
            return;
        }

        let principal: Principal;
        try {
            principal = Principal.fromText(nnsPrincipal.trim());
        } catch (error) {
            alert('Invalid NNS Principal format.');
            return;
        }

        if (!user) {
            alert('User data not loaded yet.');
            return;
        }

        // Construct the updated SerializedUser object
        const updatedUser: SerializedUserNFID = {
            ...user,
            telegramUser: telegramUser.trim() !== '' ? [telegramUser.trim()] : [],
            ocProfile: openChatUser.trim() !== '' ? [openChatUser.trim()] : [],
            nnsPrincipal: [principal],
        };

        try {
            await missionFunctions.nfidMain(globalID, fetchData, setSubmitLoading, setPlacestate, updatedUser, setIsVisible, setIsVerified);
        } catch (error) {
            console.error(`Error verifying Discord`, error);
        }
    };



    let buttonDisabled = true;
    let buttonText = '';

    if (submitLoading) {
        buttonText = 'Loading...';
        buttonDisabled = true;
    } else if (!nnsPrincipal.trim() || !nnsValid) {
        buttonText = 'Enter a valid NNS Principal to Join';
    } else if (!twitterVerified) {
        buttonText = 'Verify Twitter to Join';
    } else if (!discordVerified) {
        buttonText = 'Verify Discord to Join';
    } else {
        buttonDisabled = false;
        buttonText = 'Submit';
    }

    return (
        <div className="overlayV">
            <div className="formWrapper">
                <form onSubmit={handleSubmit} className="form">
                    {/*<div className="closeButton" onClick={() => (globalID.setCurrentMissionPage(globalID.previousMissionPage), setIsVisible(false))}>X</div>*/}
                    {/* SVG Horizontal Line */}
                    <svg className="horizontalLineF" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="horizontalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(45, 212, 191, 0)" />
                                <stop offset="50%" stopColor="#0D9948" />
                                <stop offset="100%" stopColor="rgba(45, 212, 191, 0)" />
                            </linearGradient>
                        </defs>
                        <line x1="0" y1="0" x2="100%" y2="2" stroke="url(#horizontalGradient)" strokeWidth="2" />
                    </svg>

                    {/* SVG Radial Gradients */}
                    <svg className="radialGradient topGradient" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="topRadialGradient" cx="50%" cy="0%" r="100%">
                                <stop offset="0%" stopColor="#223e30" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                        </defs>
                        <rect width="100%" height="57%" fill="url(#topRadialGradient)" />
                    </svg>

                    <svg className="radialGradient bottomGradient" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="bottomRadialGradient" cx="50%" cy="100%" r="100%">
                                <stop offset="0%" stopColor="#223e30" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                        </defs>
                        <rect y="43%" width="100%" height="57%" fill="url(#bottomRadialGradient)" />
                    </svg>

                    {/*  SVG Path */}
                    <svg
                        className="customPath"
                        viewBox="0 0 600 4000"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="customPathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0D9948" />
                                <stop offset="100%" stopColor="#2DD4BF" />
                            </linearGradient>
                            <filter id="blurFilter" x="-5%" y="-5%" width="110%" height="110%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
                            </filter>
                            <filter id="superblurFilter" x="-5%" y="-5%" width="110%" height="110%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                            </filter>
                        </defs>
                        {/* Super Blurred Rectangle */}
                        <rect
                            x="25"
                            y="0"
                            width="550"
                            height="3975"
                            rx="10"
                            ry="10"
                            stroke="url(#customPathGradient)"
                            strokeWidth="4"
                            fill="none"
                            filter="url(#superblurFilter)"
                        />
                        {/* Blurred Rectangle */}
                        <rect
                            x="25"
                            y="0"
                            width="550"
                            height="3975"
                            rx="10"
                            ry="10"
                            stroke="url(#customPathGradient)"
                            strokeWidth="4"
                            fill="none"
                            filter="url(#blurFilter)"
                        />
                        {/* Original Rectangle */}
                        <rect
                            x="25"
                            y="0"
                            width="550"
                            height="3975"
                            rx="10"
                            ry="10"
                            stroke="url(#customPathGradient)"
                            strokeWidth="4"
                            fill="none"
                        />
                    </svg>

                    <div className="formGroup">
                        <h2 className="formT">NFID Wallet Airdrop Form</h2>
                    </div>
                    {/* NFID Principal Id (Non-editable) */}
                    <div className="formGroup">
                        <label className="label">NFID Wallet Principal Address</label>
                        <span className="readOnly">
                            {user.id ? user.id.toText() : 'Adress not available'}
                        </span>
                    </div>

                    {/* Telegram User */}
                    <div className="formGroup">
                        <label htmlFor="telegramUser" className="label">
                            Telegram User (Optional)
                        </label>
                        <input
                            type="text"
                            id="telegramUser"
                            value={telegramUser}
                            onChange={handleTelegramChange}
                            className="input"
                            placeholder="Enter Telegram username"
                        />
                    </div>

                    {/* OpenChat User */}
                    <div className="formGroup">
                        <label htmlFor="openChatUser" className="label">
                            OpenChat User (Optional)
                        </label>
                        <input
                            type="text"
                            id="openChatUser"
                            value={openChatUser}
                            onChange={handleOpenChatChange}
                            className="input"
                            placeholder="Enter OpenChat username"
                        />
                    </div>

                    {/* NNS Principal */}
                    <div className="formGroup">
                        <label htmlFor="nnsPrincipal" className="label">
                            NNS Principal <span className="requiredNFID">*</span>
                        </label>
                        <textarea
                            id="nnsPrincipal"
                            value={nnsPrincipal}
                            onChange={handleNnsPrincipalChange}
                            className="input"
                            placeholder="Enter NNS Principal"
                        />
                        {!nnsValid && nnsPrincipal.length > 0 && (
                            <span className="error">
                                {nnsContainsSpaces
                                    ? "NNS can't contain spaces."
                                    : "Invalid NNS Principal format."}
                            </span>
                        )}

                    </div>
                    {/* Verification Buttons */}
                    <div className="verificationSection">
                        {/* Verify Twitter */}
                        <div className="verificationGroup">
                            <button
                                type="button"
                                onClick={handleVerifyTwitter}
                                disabled={twitterVerified || twitterLoading}
                                className={twitterVerified || twitterLoading ? 'buttonFFDisabled' : 'buttonFF'}
                            >
                                {twitterLoading
                                    ? 'Loading...'
                                    : twitterVerified
                                        ? 'X Verified'
                                        : 'Verify X'}
                            </button>

                            {(!minForm) &&
                                <small className="description">
                                    Click to verify your X account. It will confirm that you follow the{' '}
                                    <a
                                        href="https://x.com/IdentityMaxis/status/1846577159235588270"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="linkForm"
                                    >
                                        Mission 1
                                    </a>{' '}
                                    accounts and have retweeted. If not, these steps will be done automatically.
                                </small>
                            }
                        </div>

                        {/* Verify Discord */}
                        <div className="verificationGroup">
                            <button
                                type="button"
                                onClick={handleVerifyDiscord}
                                disabled={discordVerified || discordLoading}
                                className={discordVerified || discordLoading ? 'buttonFFDisabled' : 'buttonFF'}
                            >
                                {discordLoading
                                    ? 'Loading...'
                                    : discordVerified
                                        ? 'Discord Verified'
                                        : 'Verify Discord'}
                            </button>
                            {(!minForm) &&
                                <small className="description">
                                    Click to verify your Discord account. It will also verify that you're on the NFID Labs Discord Channel.{' '}
                                    <a
                                        href="https://discord.gg/a9BFNrYJ99"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="linkForm"
                                    >
                                        Click here
                                    </a>{' '}
                                    to join in case you haven't yet.
                                </small>
                            }
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="formGroup">
                        <button
                            type="submit"
                            disabled={buttonDisabled}
                            className={
                                buttonDisabled
                                    ? 'submitButtonDisabled'
                                    : 'submitButton'
                            }
                        >
                            {buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NFIDVerification;
