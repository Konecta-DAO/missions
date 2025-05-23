/* import React, { useEffect, useState } from 'react';
import { fetchPTWData, generatePTWContent, PTWData } from '../../../../../hooks/ptwUtils.ts';
import styles from './MissionModal.module.scss';

interface PTWContentProps {
    missionId: number;
}

const PTWContent: React.FC<PTWContentProps> = ({ missionId }) => {
    const [ptwContent, setPtwContent] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (missionId !== 4) return;

        const fetchAndSetPTWContent = async () => {
            setLoading(true);
            try {
                const data: PTWData | null = await fetchPTWData(missionId);
                if (data) {
                    const content = generatePTWContent(data);
                    setPtwContent(content);
                } else {
                    setError('Not available.');
                }
            } catch (err) {
                console.error('Error fetching PTW data:', err);
                setError('Failed to load PTW content.');
            } finally {
                setLoading(false);
            }
        };

        fetchAndSetPTWContent();
    }, [missionId]);

    if (missionId !== 4) return null;

    return (
        <div className={styles.ptwContent}>
            {loading && <p>Loading PTW content...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {ptwContent && <p>{ptwContent}</p>}
        </div>
    );
};

export default React.memo(PTWContent);
 */