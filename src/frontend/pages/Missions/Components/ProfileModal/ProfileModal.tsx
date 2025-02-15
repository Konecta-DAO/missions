import React, { use, useEffect, useRef, useState } from 'react';
import styles from './ProfileModal.module.scss';
import OisyLogo from '../../../../../../public/assets/oisy.svg';
import { IcpWallet } from '@dfinity/oisy-wallet-signer/icp-wallet';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { Principal } from '@dfinity/principal';
import { Actor } from '@dfinity/agent';
import { canisterId, idlFactory } from '../../../../../declarations/backend/index.js';
import useFetchData from '../../../../../hooks/fetchData.tsx';

interface ProfileModalProps {
    closeModal: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ closeModal }) => {
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const globalID = useGlobalID();
    const fetchData = useFetchData();
    const [wallet, setWallet] = useState<any | null>(null);
    const [signerId, setSignerId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [internetIdentityValue, setInternetIdentityValue] = useState<string>("");
    const [nfidValue, setNfidValue] = useState<string>("");

    const [isLoadingWallet, setIsLoadingWallet] = useState(false);
    const [isLoadingII, setIsLoadingII] = useState(false);
    const [isLoadingNFID, setIsLoadingNFID] = useState(false);
    const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

    const disableAllButtons = (disable: boolean) => {
        setAreButtonsDisabled(disable);
    };


    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            handleCloseModal();
        }
    };

    useEffect(() => {

        const connectedValue = localStorage.getItem('connected');
        const signerIdValue = localStorage.getItem('signerId');

        if (signerIdValue) {
            setSignerId(signerIdValue);
        }
        setIsConnected(connectedValue === "1");

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCopyPrincipalId = () => {
        const principalText = globalID.principalId!.toText();
        navigator.clipboard.writeText(principalText)
            .then(() => alert('Principal ID copied to clipboard!'))
    };

    const handleLinkAsNFIDToII = async () => {
        setIsLoadingII(true);
        disableAllButtons(true);
        try {

            const actor = Actor.createActor(idlFactory, {
                agent: globalID.agent!,
                canisterId,
            });

            // The user is NFID, so we linkAsNFIDToII(nfidUser, iiUser)
            const result = await actor.linkAsNFIDToII(
                globalID.principalId,              // NFID principal
                Principal.fromText(internetIdentityValue) // The II principal typed by user
            ) as String;
            alert(result);

            if (result.toLowerCase().includes("success")) {
                globalID.setNfidToIIStatus([true, [Principal.fromText(internetIdentityValue)]] as unknown as [boolean, Principal]);
                if (result === "Success") {
                    globalID.setLinkedAccount([Principal.fromText(internetIdentityValue)] as unknown as Principal);
                    fetchData.fetchUserOisy(actor, globalID.principalId!);
                };
            }

        } catch (error) {
            console.error('Error linking as NFID to II:', error);
        } finally {
            setIsLoadingII(false);
            disableAllButtons(false);
        }
    };

    const handleLinkAsIIToNFID = async () => {
        setIsLoadingNFID(true);
        disableAllButtons(true);
        try {

            const actor = Actor.createActor(idlFactory, {
                agent: globalID.agent!,
                canisterId,
            });

            // The user is II, so we linkAsIIToNFID(iiUser, nfidUser)
            const result = await actor.linkAsIIToNFID(
                globalID.principalId,         // II principal
                Principal.fromText(nfidValue) // The NFID principal typed by user
            ) as String;
            alert(result);

            if (result.toLowerCase().includes("success")) {
                globalID.setIIToNFIDStatus([true, [Principal.fromText(nfidValue)]] as unknown as [boolean, Principal]);
                if (result === "Success") {
                    globalID.setLinkedAccount([Principal.fromText(nfidValue)] as unknown as Principal);
                    fetchData.fetchUserOisy(actor, globalID.principalId!);
                };
            };

        } catch (error) {
            console.error('Error linking as II to NFID:', error);
        } finally {
            setIsLoadingNFID(false);
            disableAllButtons(false);
        }
    };

    // -- Connect Wallet logic
    const connectWallet = async () => {
        setIsLoadingWallet(true);
        disableAllButtons(true);
        try {
            const onDisconnect = () => {
                //setWallet(null);
                //  alert('Wallet has been disconnected.');
            };

            // Initialize the wallet connection
            const connectedWallet = await IcpWallet.connect({
                url: 'https://oisy.com/sign',
                onDisconnect,
            }) as any;

            const { allPermissionsGranted } = await connectedWallet.requestPermissionsNotGranted();
            if (!allPermissionsGranted) {
                alert('All permissions are required to continue.');
                return;
            }

            const accounts = await connectedWallet.accounts();
            if (accounts && accounts.length > 0) {
                const ownerId = accounts[0].owner;
                if (globalID.oisyWallet === undefined) {
                    const walletPrincipal = Principal.fromText(ownerId);
                    const userPrincipal = globalID.principalId;

                    const actor = Actor.createActor(idlFactory, {
                        agent: globalID.agent!,
                        canisterId,
                    })

                    const response = await actor.addOisyWallet(userPrincipal, walletPrincipal);
                    alert(response);
                    if (response === "Success") {
                        globalID.setOisyWallet(walletPrincipal);
                    };
                };
            };

            setWallet(connectedWallet);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setIsLoadingWallet(false);
            disableAllButtons(false);
        };
    };



    return (
        <div className={styles.ModalOverlay}>
            <div ref={modalRef} className={`${styles.ModalContent2} ${isClosing ? styles.hide : ''}`}>
                {/* Close button */}
                <button className={styles.CloseButton2} onClick={handleCloseModal} disabled={areButtonsDisabled}>X</button>
                {/* Content */}
                <div className={styles.ContentWrapper2}>
                    {/* Heading */}
                    <h2 className={styles.ProfileTitleMobile}>Profile</h2>

                    <div className={styles.principalIdContainer}>
                        <p>Your Principal ID: {globalID.principalId?.toText() || 'Not available'}</p>
                        <button onClick={handleCopyPrincipalId} className={styles.copyButton} title="Copy Principal ID">
                            📋
                        </button>
                    </div>


                    {/* Oisy */}
                    {globalID.oisyWallet === undefined ? (
                        <button onClick={connectWallet} disabled={areButtonsDisabled}>
                            {isLoadingWallet ? "Loading..." : (
                                <>
                                    <img src={OisyLogo} alt="Oisy Logo" className={styles.oisyLogo} />
                                    Connect Oisy Wallet
                                </>
                            )}
                        </button>
                    ) : (
                        <>
                            <p>Connected Oisy Wallet:</p> {globalID.oisyWallet!.toText()}
                        </>
                    )}

                    {signerId === "NFIDW" && isConnected && (
                        <>
                            {(globalID.linkedAccount as any)[0] instanceof Principal ? (
                                <p className={styles.linkInProgress}>
                                    You already have a linked account: {(globalID.linkedAccount as any)[0].toText()} (II).
                                </p>
                            ) : globalID.nfidToIIStatus[0] === true ? (
                                <p className={styles.linkInProgress}>
                                    Internet Identity link in progress, now login with your Internet Identity Account ({(globalID.nfidToIIStatus[1] as any)[0].toText()}) to complete the process
                                </p>
                            ) : (
                                <div className={styles.accountLinkContainer}>
                                    <label>Link Konecta II Account:</label>
                                    <input
                                        type="text"
                                        value={internetIdentityValue}
                                        className={styles.linkInput}
                                        onChange={(e) => setInternetIdentityValue(e.target.value)}
                                        disabled={areButtonsDisabled}
                                    />
                                    <button
                                        className={styles.connectSignerButton}
                                        onClick={handleLinkAsNFIDToII}
                                        disabled={areButtonsDisabled}
                                    >
                                        {isLoadingII ? "Loading..." : "Connect"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {signerId === "InternetIdentity" && isConnected && (
                        <>
                            {(globalID.linkedAccount as any)[0] instanceof Principal ? (
                                <p className={styles.linkInProgress}>
                                    You already have a linked account: {(globalID.linkedAccount as any)[0].toText()} (NFID).
                                </p>
                            ) : globalID.iiToNFIDStatus[0] === true ? (
                                <p className={styles.linkInProgress}>
                                    NFID link in progress, now login with your NFID Account ({(globalID.iiToNFIDStatus[1] as any)[0].toText()}) to complete the process
                                </p>
                            ) : (
                                <div className={styles.accountLinkContainer}>
                                    <label>Link NFID Account:</label>
                                    <input
                                        type="text"
                                        value={nfidValue}
                                        className={styles.linkInput}
                                        onChange={(e) => setNfidValue(e.target.value)}
                                        disabled={areButtonsDisabled}
                                    />
                                    <button
                                        className={styles.connectSignerButton}
                                        onClick={handleLinkAsIIToNFID}
                                        disabled={areButtonsDisabled}
                                    >
                                        {isLoadingNFID ? "Loading..." : "Connect"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
