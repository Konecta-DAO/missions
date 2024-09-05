import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { convertSecondsToHMS } from '../../../components/Utilities';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent';
import { useEncryption } from '../../../components/EncryptionProvider';
import useIsMobile from '../../hooks/useIsMobile';
import KonectaLogo from '../../../../public/assets/Konecta Logo.svg';
import TimeCapsule from '../../../../public/assets/Time Capsule.svg';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from '../../declarations/backend';

const Missions: React.FC = () => {

    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { decryptSession } = useEncryption();
    const [principalId, setPrincipalId] = useState<Principal | null>(null);
    const [timerText, setTimerText] = useState<string>('00:00:00');

    const agent = new HttpAgent();
    const backendActor = Actor.createActor(backend_idlFactory, {
        agent,
        canisterId: backend_canisterId,
    });

    useEffect(() => {
        const session = decryptSession();
        if (session?.principalId) {
            const userPrincipal = Principal.fromText(session.principalId);
            setPrincipalId(userPrincipal);

            // Call the backend function getTotalSecondsForUser
            backendActor.getTotalSecondsForUser(userPrincipal)
                .then((result: unknown) => {
                    const typedResult = result as [bigint] | null;
                    if (typedResult && typedResult.length > 0) {
                        const totalSeconds = Number(typedResult[0]);
                        setTimerText(convertSecondsToHMS(totalSeconds));
                    } else {
                        setTimerText('00:00:00');
                    }
                })
                .catch(error => {
                    console.error("Error fetching total seconds:", error);
                });
        } else {
            navigate('/');
        }
    }, [decryptSession, navigate]);


    return (
        <div className={styles.MissionsContainer}>

            <div className={styles.KonectaLogoWrapper}>
                <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
            </div>

            {!isMobile ? (
                <>
                    <div className={styles.TimeCapsuleWrapper}>
                        <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                        <div className={styles.TimerText}>{timerText}</div>
                    </div>
                    <div className={styles.OpenChatWrapper}>
                        <OpenChat />
                    </div>
                </>
            ) : (

                <OpenChat />

            )}
        </div>
    );
};

export default Missions;
