import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from './AddMissionForm.module.scss';
import { SerializedMission } from '../declarations/backend/backend.did';

interface AddMissionFormProps {
    onAddMission: (mission: SerializedMission) => void;
    onImageUpload: (file: File) => Promise<string>;
}

const AddMissionForm: React.FC<AddMissionFormProps> = ({ onAddMission, onImageUpload }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [missionType, setMissionType] = useState<string>('1'); // Default to Single Button Mission
    const [newMission, setNewMission] = useState<SerializedMission>({
        id: BigInt(0),
        title: '',
        description: '',
        obj2: '',
        startDate: BigInt(0),
        endDate: BigInt(0),
        recursive: false,
        mintime: BigInt(0),
        maxtime: BigInt(0),
        functionName2: '',
        image: '',
        mode: BigInt(0),
        iconUrl: '',
        inputPlaceholder: [],
        obj1: [],
        secretCodes: [],
        requiredPreviousMissionId: [],
        functionName1: [],
    });


    const [imageFile, setImageFile] = useState<File | null>(null); // For storing the selected image file
    const [iconFile, setIconFile] = useState<File | null>(null); // For storing the selected icon file

    // Handle Modal Open/Close
    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    // Handle Image Selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    // Handle Icon Selection
    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIconFile(file);
        }
    };

    // Handle Dropdown Change for Mission Type
    const handleMissionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMissionType(e.target.value);
    };

    // Handle Add Mission
    const handleAddMission = async () => {
        let mode: bigint = BigInt(0);

        switch (missionType) {
            case '1': mode = BigInt(0); break; // Single Button Mission
            case '2': mode = BigInt(1); break; // Double Button Mission
            case '3': mode = BigInt(2); break; // Input + Button Mission
            case '4': mode = BigInt(3); break; // Secret Code Mission
        }

        try {

            let imageUrl = '';
            let iconUrl = '';

            // Upload image if an image file was selected
            if (imageFile) {
                imageUrl = await onImageUpload(imageFile);
            }

            // Upload icon if an icon file was selected
            if (iconFile) {
                iconUrl = await onImageUpload(iconFile);
            }

            // Ensure that all necessary fields are included, even if null or undefined
            const missionToAdd: SerializedMission = {
                id: newMission.id,
                title: newMission.title,
                description: newMission.description,
                obj2: newMission.obj2,
                startDate: newMission.startDate,
                endDate: newMission.endDate,
                recursive: newMission.recursive,
                mintime: newMission.mintime,
                maxtime: newMission.maxtime,
                functionName2: newMission.functionName2,
                image: imageUrl,
                iconUrl: iconUrl,
                mode: mode,
                // Explicitly set optional fields to `[]` (None) if they are not provided, or to the actual value
                requiredPreviousMissionId: newMission.requiredPreviousMissionId || [],
                obj1: newMission.obj1 || [], // Wrap value in array for Some, or [] for None
                inputPlaceholder: newMission.inputPlaceholder || [], // Wrap in array for Some, or [] for None
                secretCodes: newMission.secretCodes || [], // Wrap in array for Some, or [] for None
                functionName1: newMission.functionName1 || [], // Wrap in array for Some, or [] for None
            };

            onAddMission(missionToAdd);
            closeModal();
        } catch (error) {
            console.error('Error uploading files or adding mission:', error);
        }
    };

    return (
        <>
            <button onClick={openModal}>Add Mission</button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add Mission"
                className={styles.Modal}
                overlayClassName={styles.Overlay}
            >
                <h2>Add a New Mission</h2>

                <label>Mission Type:</label>
                <select value={missionType} onChange={handleMissionTypeChange}>
                    <option value="1">Single Button Mission</option>
                    <option value="2">Double Button Mission</option>
                    <option value="3">Input + Button Mission</option>
                    <option value="4">Secret Code Mission</option>
                </select>

                {/* Common Fields for all mission types */}
                <label>
                    ID:
                    <input
                        type="number"
                        value={newMission.id.toString()}
                        onChange={(e) => setNewMission({ ...newMission, id: BigInt(e.target.value) })}
                    />
                </label>
                <label>
                    Title:
                    <input
                        type="text"
                        value={newMission.title}
                        onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        value={newMission.description}
                        onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                    />
                </label>
                <label>
                    Start Date (Unix):
                    <input
                        type="number"
                        value={newMission.startDate.toString()}
                        onChange={(e) => setNewMission({ ...newMission, startDate: BigInt(e.target.value) })}
                    />
                </label>
                <label>
                    End Date (Unix):
                    <input
                        type="number"
                        value={newMission.endDate.toString()}
                        onChange={(e) => setNewMission({ ...newMission, endDate: BigInt(e.target.value) })}
                    />
                </label>
                <label>
                    Recursive:
                    <input
                        type="checkbox"
                        checked={newMission.recursive}
                        onChange={(e) => setNewMission({ ...newMission, recursive: e.target.checked })}
                    />
                </label>
                <label>
                    Min Time:
                    <input
                        type="number"
                        value={newMission.mintime.toString()}
                        onChange={(e) => setNewMission({ ...newMission, mintime: BigInt(e.target.value) })}
                    />
                </label>
                <label>
                    Max Time:
                    <input
                        type="number"
                        value={newMission.maxtime.toString()}
                        onChange={(e) => setNewMission({ ...newMission, maxtime: BigInt(e.target.value) })}
                    />
                </label>

                {/* Conditionally Render Fields Based on Mission Type */}
                {missionType === '1' && (
                    <>
                        <label>
                            Obj2:
                            <input
                                type="text"
                                value={newMission.obj2}
                                onChange={(e) => setNewMission({ ...newMission, obj2: e.target.value })}
                            />
                        </label>
                        <label>
                            Function Name 2:
                            <input
                                type="text"
                                value={newMission.functionName2}
                                onChange={(e) => setNewMission({ ...newMission, functionName2: e.target.value })}
                            />
                        </label>
                    </>
                )}

                {missionType === '2' && (
                    <>
                        <label>
                            Obj1:
                            <input
                                type="text"
                                value={newMission.obj1 || ''}
                                onChange={(e) => setNewMission({ ...newMission, obj1: [e.target.value] })}
                            />
                        </label>
                        <label>
                            Obj2:
                            <input
                                type="text"
                                value={newMission.obj2}
                                onChange={(e) => setNewMission({ ...newMission, obj2: e.target.value })}
                            />
                        </label>
                        <label>
                            Function Name 1:
                            <input
                                type="text"
                                value={newMission.functionName1 || ''}
                                onChange={(e) => setNewMission({ ...newMission, functionName1: [e.target.value] })}
                            />
                        </label>
                        <label>
                            Function Name 2:
                            <input
                                type="text"
                                value={newMission.functionName2}
                                onChange={(e) => setNewMission({ ...newMission, functionName2: e.target.value })}
                            />
                        </label>
                    </>
                )}

                {missionType === '3' && (
                    <>
                        <label>
                            Obj2:
                            <input
                                type="text"
                                value={newMission.obj2}
                                onChange={(e) => setNewMission({ ...newMission, obj2: e.target.value })}
                            />
                        </label>
                        <label>
                            Input Placeholder:
                            <input
                                type="text"
                                value={newMission.inputPlaceholder || ''}
                                onChange={(e) => setNewMission({ ...newMission, inputPlaceholder: [e.target.value] })}
                            />
                        </label>
                        <label>
                            Function Name 2:
                            <input
                                type="text"
                                value={newMission.functionName2}
                                onChange={(e) => setNewMission({ ...newMission, functionName2: e.target.value })}
                            />
                        </label>
                    </>
                )}

                {missionType === '4' && (
                    <>
                        <label>
                            Obj2:
                            <input
                                type="text"
                                value={newMission.obj2}
                                onChange={(e) => setNewMission({ ...newMission, obj2: e.target.value })}
                            />
                        </label>
                        <label>
                            Input Placeholder:
                            <input
                                type="text"
                                value={newMission.inputPlaceholder || ''}
                                onChange={(e) => setNewMission({ ...newMission, inputPlaceholder: [e.target.value] })}
                            />
                        </label>
                        <label>
                            Function Name 2:
                            <input
                                type="text"
                                value={newMission.functionName2}
                                onChange={(e) => setNewMission({ ...newMission, functionName2: e.target.value })}
                            />
                        </label>
                        <label>
                            Secret Codes:
                            <textarea
                                value={newMission.secretCodes || ''}
                                onChange={(e) => setNewMission({ ...newMission, secretCodes: [e.target.value] })}
                            />
                        </label>
                    </>
                )}

                <label>
                    Required Previous Mission ID:
                    <input
                        type="number"
                        value={newMission.requiredPreviousMissionId?.toString() || ''}
                        onChange={(e) => setNewMission({ ...newMission, requiredPreviousMissionId: [BigInt(e.target.value)] })}
                    />
                </label>

                <label>
                    Upload Image:
                    <input type="file" onChange={handleImageChange} />
                </label>

                <label>
                    Upload Icon:
                    <input type="file" onChange={handleIconChange} />
                </label>

                <button onClick={handleAddMission}>Add Mission</button>
            </Modal>
        </>
    );
};

export default AddMissionForm;
