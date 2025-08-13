import React, { FormEvent, useState } from 'react';
import styles from './EditProfileModal.module.scss';
import { formatDate } from '../../../../../../components/Utilities.tsx';
import { SerializedGlobalUser } from '../../../../../../declarations/index/index.did.js';
import useFetchData from '../../../../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../../../../hooks/globalID.tsx';

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
  const { principalId } = useGlobalID();
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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
  const [userName, setUserName] = useState<string>(getOptionalText(username) || '');
  const [firstName, setFirstName] = useState<string>(getOptionalText(firstname) || '');
  const [lastName, setLastName] = useState<string>(getOptionalText(lastname) || '');
  const [userBio, setUserBio] = useState<string>(getOptionalText(bio) || '');

  const {
    fetchUserGlobalProfileAndSet,
    updateUserProfile,
  } = useFetchData();

  const handleBackgroundClick = (e: FormEvent) => {
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

  const handleSaving = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (userName.trim() === "" || firstName.trim() === "" || lastName.trim() === "") {
      setIsSaving(false);
      return;
    };

    if (!principalId) {
      console.error("No principal ID found. Cannot update profile.");
      setIsSaving(false);
      return;
    };

    const updatedProfile: SerializedGlobalUser = {
      ...globalUser,
      username: [userName],
      firstname: [firstName],
      lastname: [lastName],
    };
    
    updateUserProfile(principalId, updatedProfile).then(() => {
      fetchUserGlobalProfileAndSet(principalId).then(() => {
        closeModal();
        setIsSaving(false);
        return
      });
    });
  };

  const displayProfilePic = getOptionalText(profilepic) || DEFAULT_PROFILE_PIC_URL;
  const displayCoverPhoto = getOptionalText(coverphoto) || DEFAULT_COVER_URL;

  return (
    <div className={styles.modalOverlay} onClick={handleBackgroundClick}>
      <form onSubmit={handleSaving} className={`${styles.modalContent} ${isClosing ? styles.hide : styles.show}`}>
        <button onClick={handleClose} className={styles.closeButton}>&times;</button>

        <div className={styles.profileHeader}>
          <img src={displayCoverPhoto} alt="Cover" className={styles.coverPhoto} />
          <div className={styles.avatarContainer}>
            <img src={displayProfilePic} alt="Profile" className={styles.profileAvatar} />
          </div>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.inputFieldContainer}>
            <input
              id="userName"
              placeholder="Username"
              className={styles.inputField}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <input
              id="firstName"
              placeholder="First Name"
              className={styles.inputField}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              id="lastName"
              placeholder="Last Name"
              className={styles.inputField}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

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
            <button type='submit' className={styles.editProfileButton} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProfileModal;