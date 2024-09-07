import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from './ModifyMissionModal.module.scss';
import { SerializedMission } from '../declarations/backend/backend.did';

interface ModifyMissionModalProps {
    mission: SerializedMission;
    onUpdateMission: (mission: SerializedMission) => void;
    onClose: () => void;
    onImageUpload: (file: File) => Promise<string>;
}

const ModifyMissionModal: React.FC<ModifyMissionModalProps> = ({ mission, onUpdateMission, onClose, onImageUpload }) => {
    const [updatedMission, setUpdatedMission] = useState<SerializedMission>(mission);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [newIcon, setNewIcon] = useState<File | null>(null);

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImage(file); // Set the new image file
        }
    };

    // Handle icon selection
    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewIcon(file); // Set the new icon file
        }
    };

    const handleSubmit = async () => {
        try {
            // Upload the image and icon if they were changed
            let imageUrl = mission.image;
            let iconUrl = mission.iconUrl;

            if (newImage) {
                imageUrl = await onImageUpload(newImage);
            }

            if (newIcon) {
                iconUrl = await onImageUpload(newIcon);
            }

            const missionToUpdate: SerializedMission = {
                ...updatedMission,
                image: imageUrl,
                iconUrl: iconUrl,
            };

            // Call the update mission function
            onUpdateMission(missionToUpdate);
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error updating mission:', error);
        }
    };

    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            contentLabel="Modify Mission"
            className={styles.Modal}
            overlayClassName={styles.Overlay}
        >
            <h2>Modify Mission</h2>

            {/* Display fields based on the current mode */}
            <label>Title:</label>
            <input
                type="text"
                value={updatedMission.title}
                onChange={(e) => setUpdatedMission({ ...updatedMission, title: e.target.value })}
            />

            <label>Description:</label>
            <textarea
                value={updatedMission.description}
                onChange={(e) => setUpdatedMission({ ...updatedMission, description: e.target.value })}
            />

            {/* Show obj1 and functionName1 only if the mode supports it */}
            {mission.mode === BigInt(1) && (
                <>
                    <label>Obj1:</label>
                    <input
                        type="text"
                        value={updatedMission.obj1?.[0] || ''}
                        onChange={(e) => setUpdatedMission({ ...updatedMission, obj1: [e.target.value] })}
                    />

                    <label>Function Name 1:</label>
                    <input
                        type="text"
                        value={updatedMission.functionName1?.[0] || ''}
                        onChange={(e) => setUpdatedMission({ ...updatedMission, functionName1: [e.target.value] })}
                    />
                </>
            )}

            <label>Obj2:</label>
            <input
                type="text"
                value={updatedMission.obj2}
                onChange={(e) => setUpdatedMission({ ...updatedMission, obj2: e.target.value })}
            />

            <label>Function Name 2:</label>
            <input
                type="text"
                value={updatedMission.functionName2}
                onChange={(e) => setUpdatedMission({ ...updatedMission, functionName2: e.target.value })}
            />

            {/* Image Upload */}
            <label>Upload Image:</label>
            <input type="file" onChange={handleImageChange} />

            {/* Icon Upload */}
            <label>Upload Icon:</label>
            <input type="file" onChange={handleIconChange} />

            <button onClick={handleSubmit}>Update Changes</button>
        </Modal>
    );
};

export default ModifyMissionModal;
