import React, { useState, useEffect } from 'react';
import styles from './AdminPanel.module.scss';
import { Principal } from '@dfinity/principal';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from '../declarations/backend/index.js';
import { Actor, HttpAgent } from "@dfinity/agent";

interface AdminPanelProps {
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
    const [adminList, setAdminList] = useState<string[]>([]);
    const [newAdminId, setNewAdminId] = useState<string>('');

    const agent = new HttpAgent();
    const backendActor = Actor.createActor(backend_idlFactory, {
        agent,
        canisterId: backend_canisterId,
    });

    const fetchAdminList = async () => {
        try {
            const admins: Principal[] = await backendActor.getAdminIds() as Principal[];
            const adminStrings = admins?.map((admin) => admin.toText());
            setAdminList(adminStrings);
        } catch (error) {
            console.error('Error fetching admin list:', error);
        }
    };

    const handleAddAdmin = async () => {
        try {
            const newAdminPrincipal = Principal.fromText(newAdminId);
            await backendActor.addAdminId(newAdminPrincipal);
            setNewAdminId(''); // Clear input
            fetchAdminList(); // Update the list after adding a new admin
        } catch (error) {
            alert('Failed to add admin');
        }
    };

    return (
        <div className={styles.AdminPanel}>
            <h2>Admin Panel</h2>
            <div className={styles.AdminList}>
                <h3>Admin List</h3>
                <ul>
                    {adminList?.map((adminId, index) => (
                        <li key={index}>{adminId}</li>
                    ))}
                </ul>
            </div>

            <div className={styles.AddAdminSection}>
                <input
                    type="text"
                    value={newAdminId}
                    onChange={(e) => setNewAdminId(e.target.value)}
                    placeholder="Enter Principal ID"
                    className={styles.Input}
                />
                <button onClick={handleAddAdmin} className={styles.AddAdminButton}>
                    Add Admin
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;
