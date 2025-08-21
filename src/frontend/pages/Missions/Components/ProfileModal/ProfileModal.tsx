import React, { useState, useEffect } from 'react';
import styles from './ProfileModal.module.scss';
import { formatDate } from '../../../../../components/Utilities.tsx';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { IcpWallet } from '@dfinity/oisy-wallet-signer/icp-wallet';
import { Principal } from '@dfinity/principal';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { Actor } from '@dfinity/agent';
import { idlFactory as idlFactoryIndex } from '../../../../../declarations/index/index.did.js';
import { IndexCanisterId } from '../../../../main.tsx';
import { toast } from 'react-hot-toast';
import { SerializedGlobalUser } from '../../../../../declarations/index/index.did.js';

// Default assets
const DEFAULT_COVER_URL = '/assets/KonectaIconPB.webp';
const DEFAULT_PROFILE_PIC_URL = '/assets/KBanner.webp';

interface ProfileModalProps {
    closeModal: () => void;
}

const getOptionalText = (field: string[] | undefined | null): string | null => {
    return (field && field.length > 0) ? field[0] : null;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ closeModal }) => {
    const { userGlobalProfile, principalId, agent, walletLinkInfos, setWalletLinkInfos } = useGlobalID();
    const fetchData = useFetchData();

    // --- MODIFIED: State for inline editing ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // --- MODIFIED: State for form fields ---
    const [userName, setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userBio, setUserBio] = useState('');

    // --- State for Wallet Linking ---
    const [signerId, setSignerId] = useState<string | null>(null);
    const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

    // --- NEW: Populate form fields when user profile loads or edit mode starts ---
    useEffect(() => {
        if (userGlobalProfile) {
            setUserName(getOptionalText(userGlobalProfile.username) || '');
            setFirstName(getOptionalText(userGlobalProfile.firstname) || '');
            setLastName(getOptionalText(userGlobalProfile.lastname) || '');
            setUserBio(getOptionalText(userGlobalProfile.bio) || '');
        }
    }, [userGlobalProfile, isEditMode]);


    // --- NEW: useEffect to fetch wallet link info when the modal opens ---
    useEffect(() => {
        if (principalId) {
            fetchData.fetchWalletLinkInfoAndSet(principalId);
        }
        const signerIdValue = localStorage.getItem('signerId');
        if (signerIdValue) {
            setSignerId(signerIdValue);
        }
    }, [principalId]);

    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 300);
    };

    // --- MODIFIED: Save handler ---
    const handleSaveChanges = async () => {
        if (!principalId || !userGlobalProfile) {
            toast.error("User profile not loaded.");
            return;
        }
        if (userName.trim() === "" || firstName.trim() === "" || lastName.trim() === "") {
            toast.error("Username, First Name, and Last Name cannot be empty.");
            return;
        }

        setIsSaving(true);

        const updatedProfile: SerializedGlobalUser = {
            ...userGlobalProfile,
            username: [userName],
            firstname: [firstName],
            lastname: [lastName],
            bio: [userBio],
        };

        try {
            await fetchData.updateUserProfile(principalId, updatedProfile);
            await fetchData.fetchUserGlobalProfileAndSet(principalId); // Re-fetch to get latest data
            toast.success("Profile updated successfully!");
            setIsEditMode(false); // Exit edit mode
        } catch (error) {
            toast.error("Failed to update profile.");
            console.error("Error saving profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Wallet Linking Logic (Integrated) ---
    const disableAllButtons = (disable: boolean) => setAreButtonsDisabled(disable);
    const handleCopyPrincipalId = () => {
        navigator.clipboard.writeText(principalId!.toText()).then(() => toast.success('Principal ID copied!'));
    };
    const formatCooldown = (ns: number) => {
        const totalSeconds = Math.floor(ns / 1_000_000_000);
        const d = Math.floor(totalSeconds / 86400);
        const h = Math.floor((totalSeconds % 86400) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    };
    const handleInputChange = (walletType: string, value: string) => {
        setWalletLinkInfos(prev => prev.map(info => info.walletType === walletType ? { ...info, inputValue: value } : info));
    };
    const refreshDataAfterAction = async () => {
        if (principalId) {
            await fetchData.fetchWalletLinkInfoAndSet(principalId);
            await fetchData.fetchUserGlobalProfileAndSet(principalId);
        }
    };
    const handleInitiateLink = async (walletType: string) => {
        if (!principalId || !signerId || !agent) return;
        disableAllButtons(true);
        try {
            const actorIndex = Actor.createActor(idlFactoryIndex, { agent, canisterId: IndexCanisterId });
            const targetPrincipal = await (async () => {
                if (walletType === "Oisy") {
                    const wallet = await IcpWallet.connect({ url: 'https://oisy.com/sign' }) as any;
                    const accs = await wallet.accounts();
                    if (!accs?.[0]) throw new Error("No Oisy accounts found");
                    return Principal.fromText(accs[0].owner);
                }
                const info = walletLinkInfos.find(i => i.walletType === walletType);
                if (!info?.inputValue) throw new Error("Principal ID is required.");
                return Principal.fromText(info.inputValue);
            })();
            const response = walletType === "Oisy"
                ? await actorIndex.linkOisyAccount(principalId, targetPrincipal) as string
                : await actorIndex.initiateLink(principalId, signerId, targetPrincipal, walletType) as string;
            await refreshDataAfterAction();
            toast.success(response);
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        } finally {
            disableAllButtons(false);
        }
    };
    const handleAcceptLink = async (walletType: string) => {
        if (!principalId || !agent) return;
        const info = walletLinkInfos.find(i => i.walletType === walletType);
        if (!info?.pendingRequest) return;
        disableAllButtons(true);
        try {
            const actorIndex = Actor.createActor(idlFactoryIndex, { agent, canisterId: IndexCanisterId });
            const uuid = await actorIndex.getUUID(principalId) as string;
            const response = await actorIndex.acceptLink(Principal.fromText(info.pendingRequest.requester), principalId, uuid) as string;
            await refreshDataAfterAction();
            toast.success(response);
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        } finally {
            disableAllButtons(false);
        }
    };
    const handleRejectLink = async (walletType: string) => {
        if (!principalId || !agent) return;
        const info = walletLinkInfos.find((i) => i.walletType === walletType);
        if (!info?.pendingRequest) return;
        disableAllButtons(true);
        try {
            const actorIndex = Actor.createActor(idlFactoryIndex, { agent, canisterId: IndexCanisterId });
            const response = await actorIndex.rejectLink(Principal.fromText(info.pendingRequest.requester), principalId) as string;
            await refreshDataAfterAction();
            toast.success(response);
        } catch (e: any) {
            toast.error("Error rejecting link: " + e.message);
        } finally {
            disableAllButtons(false);
        }
    };
    const handleUnlink = async (walletType: string) => {
        if (!principalId || !agent) return;
        const info = walletLinkInfos.find((i) => i.walletType === walletType);
        if (!info?.linkedPrincipal) return;
        disableAllButtons(true);
        try {
            const actorIndex = Actor.createActor(idlFactoryIndex, { agent, canisterId: IndexCanisterId });
            const response = await actorIndex.unlinkPrincipal(Principal.fromText(info.linkedPrincipal)) as string;
            await refreshDataAfterAction();
            toast.success(response);
        } catch (e: any) {
            toast.error("Error unlinking account: " + e.message);
        } finally {
            disableAllButtons(false);
        }
    };

    if (!userGlobalProfile) {
        return (
            <div className={styles.modalOverlay} onClick={handleBackgroundClick}>
                <div className={`${styles.modalContent} ${isClosing ? styles.hide : styles.show}`}>
                    <button onClick={handleClose} className={styles.closeButton}>&times;</button>
                    <p>Loading profile information...</p>
                </div>
            </div>
        );
    }

    const {
        profilepic, coverphoto, username, firstname, lastname, bio,
        deducedPoints, creationTime, twitterhandle, discordUser, telegramUser,
        ocProfile, nuanceUser, nnsPrincipal, country,
    } = userGlobalProfile;

    const displayProfilePic = getOptionalText(profilepic) || DEFAULT_PROFILE_PIC_URL;
    const displayCoverPhoto = getOptionalText(coverphoto) || DEFAULT_COVER_URL;
    const displayUsername = getOptionalText(username) || 'Anonymous User';
    const displayName = [getOptionalText(firstname), getOptionalText(lastname)].filter(Boolean).join(' ') || displayUsername;

    return (
        <div className={styles.modalOverlay} onClick={handleBackgroundClick}>
            <div className={`${styles.modalContent} ${isClosing ? styles.hide : styles.show}`}>
                <button onClick={handleClose} className={styles.closeButton}>&times;</button>

                <div className={styles.profileHeader}>
                    <img src={displayCoverPhoto} alt="Cover" className={styles.coverPhoto} />
                    <div className={styles.avatarContainer}>
                        <img src={displayProfilePic} alt="Profile" className={styles.profileAvatar} />
                    </div>
                </div>

                <div className={styles.profileInfo}>
                    {isEditMode ? (
                        <div className={styles.formFieldsContainer}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel} htmlFor="username">Username</label>
                                <input id="username" className={styles.inputField} value={userName} onChange={(e) => setUserName(e.target.value)} />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel} htmlFor="firstName">First Name</label>
                                <input id="firstName" className={styles.inputField} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel} htmlFor="lastName">Last Name</label>
                                <input id="lastName" className={styles.inputField} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel} htmlFor="bio">Bio</label>
                                <textarea id="bio" className={styles.textAreaField} value={userBio} onChange={(e) => setUserBio(e.target.value)} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className={styles.displayName}>{displayName}</h2>
                            {getOptionalText(username) && displayName !== getOptionalText(username) && (
                                <p className={styles.username}>@{getOptionalText(username)}</p>
                            )}
                            {bio && bio.length > 0 && <p className={styles.bio}>{bio[0]}</p>}
                        </>
                    )}

                    <div className={styles.statsSection}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{deducedPoints.toString()}</span>
                            <span className={styles.statLabel}>Points</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{formatDate(creationTime)}</span>
                            <span className={styles.statLabel}>Member Since</span>
                        </div>
                        {getOptionalText(country) && (
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{getOptionalText(country)}</span>
                                <span className={styles.statLabel}>Country</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.socialLinks}>
                        {getOptionalText(twitterhandle) && <a href={`https://twitter.com/${getOptionalText(twitterhandle)}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>X (Twitter)</a>}
                        {getOptionalText(discordUser) && <span className={styles.socialLink}>Discord: {getOptionalText(discordUser)}</span>}
                        {getOptionalText(telegramUser) && <a href={`https://t.me/${getOptionalText(telegramUser)}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Telegram</a>}
                        {getOptionalText(ocProfile) && <span className={styles.socialLink}>OpenChat: {getOptionalText(ocProfile)}</span>}
                        {getOptionalText(nuanceUser) && <span className={styles.socialLink}>Nuance: {getOptionalText(nuanceUser)}</span>}
                    </div>

                    <div className={styles.principalIdContainer}>
                        <p>Principal: {principalId?.toText() || 'Not available'}</p>
                        <button onClick={handleCopyPrincipalId} className={styles.copyButton} title="Copy Principal ID">📋</button>
                    </div>

                    <div className={styles.walletLinkingSection}>
                        <h3>Link Other Wallets</h3>
                        {!signerId ? (
                            <p>Loading accounts...</p>
                        ) : (
                            walletLinkInfos
                                .filter(info => info.walletType !== signerId)
                                .map((info) => (
                                    <div key={info.walletType} className={styles.accountLinkContainer}>
                                        <h4>{info.walletType}</h4>
                                        {info.linkedPrincipal ? (
                                            <>
                                                <p>{info.linkedPrincipal}</p>
                                                {info.walletType === "Oisy" ? (
                                                    <button onClick={() => navigator.clipboard.writeText(info.linkedPrincipal!)} disabled={areButtonsDisabled} title="Copy linked principal" className={styles.copyButton}>📋</button>
                                                ) : (
                                                    <button onClick={() => handleUnlink(info.walletType)} disabled={areButtonsDisabled} className={styles.linkButton}>Unlink</button>
                                                )}
                                            </>
                                        ) : info.pendingRequest ? (
                                            <>
                                                <p>Pending link from<br />{info.pendingRequest.requester}</p>
                                                <div className={styles.buttonColumn}>
                                                    <button onClick={() => handleAcceptLink(info.walletType)} disabled={areButtonsDisabled} className={styles.linkButton}>Accept</button>
                                                    <button onClick={() => handleRejectLink(info.walletType)} disabled={areButtonsDisabled} className={styles.linkButton}>Reject</button>
                                                </div>
                                            </>
                                        ) : info.cooldown > 0 ? (
                                            <p>Cooldown: {formatCooldown(info.cooldown)}</p>
                                        ) : (
                                            <>
                                                {info.walletType !== "Oisy" && (
                                                    <input
                                                        type="text"
                                                        className={styles.linkInput}
                                                        placeholder={`Enter ${info.walletType} Principal`}
                                                        value={info.inputValue}
                                                        onChange={(e) => handleInputChange(info.walletType, e.target.value)}
                                                        disabled={areButtonsDisabled}
                                                    />
                                                )}
                                                <button onClick={() => handleInitiateLink(info.walletType)} disabled={areButtonsDisabled} className={styles.linkButton}>
                                                    {info.walletType === "Oisy" ? 'Connect & Link Oisy' : 'Initiate Link'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))
                        )}
                    </div>

                    <div className={styles.editProfileContainer}>
                        {isEditMode ? (
                            <>
                                <button onClick={() => setIsEditMode(false)} className={styles.cancelButton} disabled={isSaving}>Cancel</button>
                                <button onClick={handleSaveChanges} className={styles.saveButton} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditMode(true)} className={styles.editProfileButton}>Edit Profile</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;