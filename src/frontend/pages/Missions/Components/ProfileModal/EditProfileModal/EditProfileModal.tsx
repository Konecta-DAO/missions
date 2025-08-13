import React, { useState } from 'react';
import styles from './EditProfileModal.module.scss';
import { formatDate } from '../../../../../../components/Utilities.tsx';
//import { useGlobalID } from '../../../../../../hooks/globalID.tsx';
import { SerializedGlobalUser } from '../../../../../../declarations/index/index.did.js';

// Default assets
const DEFAULT_COVER_URL = '/assets/KonectaIconPB.webp'; // Create a generic cover
const DEFAULT_PROFILE_PIC_URL = '/assets/KBanner.webp'; // Create a generic avatar

interface EditProfileModalProps {
  globalUser: SerializedGlobalUser
  closeModal: () => void;
}

// Helper function to safely access optional text array values
const getOptionalText = (field: string[] | undefined | null): string | null => {
  return (field && field.length > 0) ? field[0] : null;
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({ globalUser, closeModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeModal();
      setIsClosing(false); // Reset for next open
    }, 300); // Match animation duration
  };

  if (!globalUser) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackgroundClick}>
        <div className={`${styles.modalContent} ${isClosing ? styles.hide : ''}`}>
          <button onClick={handleClose} className={styles.closeButton}>&times;</button>
          <p>Loading profile information...</p>
        </div>
      </div>
    );
  }

  const {
    profilepic,
    coverphoto,
    username,
    firstname,
    lastname,
    bio,
    deducedPoints,
    creationTime,
    twitterhandle,
    discordUser,
    telegramUser,
    ocProfile,
    nuanceUser,
    nnsPrincipal,
    country,
    // categories, // Example: display as tags
    // email, // Consider privacy if displaying email
  } = globalUser;

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
          <h2 className={styles.displayName}>{displayName}</h2>
          {getOptionalText(username) && displayName !== getOptionalText(username) && (
            <p className={styles.username}>@{getOptionalText(username)}</p>
          )}

          {bio && bio.length > 0 && <p className={styles.bio}>{bio[0]}</p>}

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

          {nnsPrincipal && nnsPrincipal.length > 0 && (
            <div className={styles.linkedAccounts}>
              <h4>Linked NNS:</h4>
              <p>{nnsPrincipal[0]?.toText()}</p>
            </div>
          )}

          <div className={styles.editProfileContainer}>
            <button onClick={handleClose} className={styles.cancelButton}>Cancel</button>
            <button className={styles.editProfileButton}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;