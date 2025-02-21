import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './AccessOisyModal.module.scss';
import OisyLogo from '../../../../../../public/assets/oisy.svg';
import { IcpWallet } from '@dfinity/oisy-wallet-signer/icp-wallet';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { Principal } from '@dfinity/principal';
import { Actor } from '@dfinity/agent';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { idlFactory } from '../../../../../declarations/index/index.did.js';

interface AccessOisyModalProps {
    closeModal: () => void;
}

const AccessOisyModal: React.FC<AccessOisyModalProps> = ({ closeModal }) => {
    const [signerId, setSignerId] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const globalID = useGlobalID();
    const fetchData = useFetchData();
    const [isLoadingWallet, setIsLoadingWallet] = useState(false);
    const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

    const isOisyWalletValid = useMemo(() => globalID.walletLinkInfos.some(
        (info) =>
            info.walletType === 'Oisy' &&
            info.linkedPrincipal !== undefined &&
            info.linkedPrincipal.trim() !== ''
    ), [globalID.walletLinkInfos]);

    // Function to disable or enable buttons
    const disableAllButtons = (disable: boolean) => {
        setAreButtonsDisabled(disable);
    };

    // Handle closing the modal with animation
    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 500); // Duration should match the CSS animation duration
    };

    // Close modal when clicking outside of it
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

    // Function to handle wallet connection
    const handleConnectWallet = async () => {
        setIsLoadingWallet(true);
        disableAllButtons(true);
        try {
            const onDisconnect = () => {
                //
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
                if (!isOisyWalletValid) {
                    const walletPrincipal = Principal.fromText(ownerId);
                    const actorIndex = Actor.createActor(idlFactory, {
                        agent: globalID.agent!,
                        canisterId: "tui2b-giaaa-aaaag-qnbpq-cai",
                    });
                    const response = await actorIndex.linkOisyAccount(globalID.principalId, walletPrincipal) as string;
                    fetchData.fetchWalletLinkInfo(signerId!, actorIndex, globalID.principalId!);
                    alert(response);
                }
            }

        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        } finally {
            setIsLoadingWallet(false);
            disableAllButtons(false);
        }
    };

    return (
        <div className={styles.ModalOverlay}>
            <div ref={modalRef} className={`${styles.ModalContent} ${isClosing ? styles.hide : ''}`}>
                {/* Close button */}
                <button className={styles.CloseButton} onClick={handleCloseModal} disabled={areButtonsDisabled}>
                    &times;
                </button>
                {/* Content */}
                <div className={styles.ContentWrapper}>
                    {/* Heading */}
                    <h2 className={styles.ModalTitle}>Connect your Oisy Wallet to access these missions</h2>

                    {/* Oisy Wallet Connection */}
                    {!isOisyWalletValid && (
                        <button
                            onClick={handleConnectWallet}
                            disabled={areButtonsDisabled}
                            className={styles.connectButton}
                        >
                            {isLoadingWallet ? "Loading..." : (
                                <>
                                    <img src={OisyLogo} alt="Oisy Logo" className={styles.oisyLogo} />
                                    Connect Oisy Wallet
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccessOisyModal;
