import React, { useEffect, useRef, useState } from 'react';
import styles from './ProfileModal.module.scss';
import { IcpWallet } from '@dfinity/oisy-wallet-signer/icp-wallet';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { Principal } from '@dfinity/principal';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { Actor } from '@dfinity/agent';
import { idlFactory as idlFactoryIndex } from '../../../../../declarations/index/index.did.js';
import { idlFactory, canisterId } from '../../../../../declarations/backend/index.js';
import { idlFactory as idlFactoryDefault } from '../../../../../declarations/dfinity_backend/index.js';

interface ProfileModalProps {
    closeModal: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ closeModal }) => {
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const globalID = useGlobalID();
    const fetchData = useFetchData();
    const [signerId, setSignerId] = useState<string | null>(null);
    const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
    const [placeState, setPlacestate] = useState<boolean>(false);

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

        const signerIdValue = localStorage.getItem('signerId');

        if (signerIdValue) {
            setSignerId(signerIdValue);
        }

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

    const formatCooldown = (ns: number): string => {
        const totalSeconds = Math.floor(ns / 1_000_000_000);
        const days = Math.floor(totalSeconds / (24 * 3600));
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${days}d:${hours}h:${minutes}m:${seconds}s`;
    };

    const handleInputChange = (walletType: string, value: string) => {
        globalID.setWalletLinkInfos((prev) =>
            prev.map((info) =>
                info.walletType === walletType ? { ...info, inputValue: value } : info
            )
        );
    };

    const handleInitiateLink = async (walletType: string) => {
        if (!globalID.principalId || !signerId) return;
        try {
            disableAllButtons(true);
            let response: string;
            // For Oisy, perform wallet connect; for others, use the input field value.
            const targetPrincipal = await (async () => {
                if (walletType === "Oisy") {
                    // Initiate wallet connection for Oisy
                    const connectedWallet = await IcpWallet.connect({
                        url: 'https://oisy.com/sign',
                        onDisconnect: () => {
                            // Optional disconnect handler
                        },
                    }) as any;
                    const accounts = await connectedWallet.accounts();
                    if (!accounts || accounts.length === 0) {
                        throw new Error("No wallet accounts found");
                    }
                    // Use the first account as the wallet principal
                    return Principal.fromText(accounts[0].owner);
                } else {
                    // For other wallet types, use the input value from the UI
                    const info = globalID.walletLinkInfos.find((i) => i.walletType === walletType);
                    if (!info || !info.inputValue) {
                        throw new Error("Please enter a valid principal ID.");
                    }
                    return Principal.fromText(info.inputValue);
                }
            })();

            // Now call the appropriate backend function:
            if (walletType === "Oisy") {
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent!,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });
                response = await actorIndex.linkOisyAccount(globalID.principalId, targetPrincipal) as string;
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent!,
                    canisterId,
                });

                const actors = globalID.canisterIds!.map(targetCanisterId => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent!,
                        canisterId: targetCanisterId,
                    });
                });

                await fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds!, globalID.principalId, setPlacestate, setPlacestate);
            } else {
                // For other wallet types, use the initiateLink function.
                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: globalID.agent!,
                    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
                });
                response = await actorIndex.initiateLink(globalID.principalId, signerId, targetPrincipal, walletType) as string;
                const actor = Actor.createActor(idlFactory, {
                    agent: globalID.agent!,
                    canisterId,
                });

                const actors = globalID.canisterIds!.map(targetCanisterId => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: globalID.agent!,
                        canisterId: targetCanisterId,
                    });
                });
                await fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds!, globalID.principalId, setPlacestate, setPlacestate);
            }
            alert(response);
        } catch (error: any) {
            console.error("Error initiating link:", error);
            alert("Error initiating link: " + error.message);
        } finally {
            disableAllButtons(false);
        }
    };


    const handleAcceptLink = async (walletType: string) => {
        if (!globalID.principalId) return;
        const info = globalID.walletLinkInfos.find((i) => i.walletType === walletType);
        if (!info || !info.pendingRequest) return;
        try {
            disableAllButtons(true);

            const actorIndex = Actor.createActor(idlFactoryIndex, {
                agent: globalID.agent!,
                canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
            });

            const canonicalUUID = await actorIndex.getUUID(globalID.principalId);
            const response = await actorIndex.acceptLink(Principal.fromText(info.pendingRequest.requester), globalID.principalId, canonicalUUID);
            const actor = Actor.createActor(idlFactory, {
                agent: globalID.agent!,
                canisterId,
            });

            const actors = globalID.canisterIds!.map(targetCanisterId => {
                return Actor.createActor(idlFactoryDefault, {
                    agent: globalID.agent!,
                    canisterId: targetCanisterId,
                });
            });

            await fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds!, globalID.principalId, setPlacestate, setPlacestate);
            alert(response);
        } catch (error) {
            console.error("Error accepting link:", error);
        } finally {
            disableAllButtons(false);
        }
    };

    // Reject a pending link.
    const handleRejectLink = async (walletType: string) => {
        if (!globalID.principalId) return;
        const info = globalID.walletLinkInfos.find((i) => i.walletType === walletType);
        if (!info || !info.pendingRequest) return;
        try {
            disableAllButtons(true);

            const actorIndex = Actor.createActor(idlFactoryIndex, {
                agent: globalID.agent!,
                canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
            });

            const response = await actorIndex.rejectLink(Principal.fromText(info.pendingRequest.requester), globalID.principalId);
            const actor = Actor.createActor(idlFactory, {
                agent: globalID.agent!,
                canisterId,
            });

            const actors = globalID.canisterIds!.map(targetCanisterId => {
                return Actor.createActor(idlFactoryDefault, {
                    agent: globalID.agent!,
                    canisterId: targetCanisterId,
                });
            });

            await fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds!, globalID.principalId, setPlacestate, setPlacestate);
            alert(response);
        } catch (error) {
            console.error("Error rejecting link:", error);
        } finally {
            disableAllButtons(false);
        }
    };

    // Unlink an already linked account.
    const handleUnlink = async (walletType: string) => {
        if (!globalID.principalId) return;
        const info = globalID.walletLinkInfos.find((i) => i.walletType === walletType);
        if (!info || !info.linkedPrincipal) return;
        try {
            disableAllButtons(true);

            const actorIndex = Actor.createActor(idlFactoryIndex, {
                agent: globalID.agent!,
                canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
            });

            const response = await actorIndex.unlinkPrincipal(
                Principal.fromText(info.linkedPrincipal)
            );
            const actor = Actor.createActor(idlFactory, {
                agent: globalID.agent!,
                canisterId,
            });

            const actors = globalID.canisterIds!.map(targetCanisterId => {
                return Actor.createActor(idlFactoryDefault, {
                    agent: globalID.agent!,
                    canisterId: targetCanisterId,
                });
            });

            await fetchData.fetchAll(actor, actors, actorIndex, globalID.canisterIds!, globalID.principalId, setPlacestate, setPlacestate);
            alert(response);
        } catch (error) {
            console.error("Error unlinking account:", error);
        } finally {
            disableAllButtons(false);
        }
    };



    return (
        <div className={styles.ModalOverlay}>
            <div
                ref={modalRef}
                className={`${styles.ModalContent2} ${isClosing ? styles.hide : ''}`}
            >
                <button
                    className={styles.CloseButton2}
                    onClick={handleCloseModal}
                    disabled={areButtonsDisabled}
                >
                    X
                </button>
                <div className={styles.ContentWrapper2}>
                    <h2 className={styles.ProfileTitleMobile}>Profile</h2>
                    <div className={styles.principalIdContainer}>
                        <p>
                            Your Principal ID:{' '}
                            {globalID.principalId?.toText() || 'Not available'}
                        </p>
                        <button
                            onClick={handleCopyPrincipalId}
                            className={styles.copyButton}
                            title="Copy Principal ID"
                        >
                            📋
                        </button>
                    </div>

                    {/* Render wallet linking sections */}
                    {!signerId ? (
                        <p>Loading accounts...</p>
                    ) : (
                        globalID.walletLinkInfos
                            .filter(info => info.walletType !== signerId)
                            .map((info) => (
                                <div key={info.walletType} className={styles.accountLinkContainer}>
                                    <h3>{info.walletType}</h3>
                                    {info.linkedPrincipal ? (
                                        <>
                                            <p>
                                                {info.walletType}: {info.linkedPrincipal}
                                            </p>
                                            <button
                                                onClick={() => handleUnlink(info.walletType)}
                                                disabled={areButtonsDisabled}
                                            >
                                                Unlink
                                            </button>
                                        </>
                                    ) : info.pendingRequest ? (
                                        <>
                                            <p>
                                                Pending link by<br />
                                                {info.pendingRequest.requester}<br />
                                                ({info.walletType})
                                            </p>
                                            <div className={styles.buttonColumn}>
                                                <button
                                                    onClick={() => handleAcceptLink(info.walletType)}
                                                    disabled={areButtonsDisabled}
                                                    className={styles.linkButton}
                                                >
                                                    Accept Link
                                                </button>
                                                <button
                                                    onClick={() => handleRejectLink(info.walletType)}
                                                    disabled={areButtonsDisabled}
                                                    className={styles.linkButton}
                                                >
                                                    Reject Link
                                                </button>
                                            </div>
                                        </>
                                    ) : info.cooldown > 0 ? (
                                        <p>
                                            You have to wait {formatCooldown(info.cooldown)} before linking
                                            another {info.walletType} account.
                                        </p>
                                    ) : (
                                        <>
                                            {info.walletType === "Oisy" ? (
                                                <button
                                                    onClick={() => handleInitiateLink(info.walletType)}
                                                    disabled={areButtonsDisabled}
                                                    className={styles.linkButton}
                                                >
                                                    Initiate Link
                                                </button>
                                            ) : (
                                                <>
                                                    <input
                                                        type="text"
                                                        className={styles.linkInput}
                                                        placeholder="Enter wallet principal"
                                                        value={info.inputValue}
                                                        onChange={(e) =>
                                                            handleInputChange(info.walletType, e.target.value)
                                                        }
                                                        disabled={areButtonsDisabled}
                                                    />
                                                    <button
                                                        onClick={() => handleInitiateLink(info.walletType)}
                                                        disabled={areButtonsDisabled}
                                                        className={styles.linkButton}
                                                    >
                                                        Initiate Link
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
