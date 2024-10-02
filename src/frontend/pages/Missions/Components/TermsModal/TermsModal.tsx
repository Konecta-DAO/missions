import React, { useState } from 'react';
import styles from './TermsModal.module.scss';

interface TermsModalProps {
    isVisible: boolean;
    onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isVisible, onAccept }) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleAccept = () => {
        setIsLoading(true);
        onAccept();
    };

    if (!isVisible) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Konecta Platform Disclaimer & Terms of Use</h2>
                <p><strong>Last Updated:</strong> September 26, 2024</p>

                <p>
                    By accessing or using the Konecta Protocol, including any services, features, or dApps provided through the Konecta platform (collectively referred to as "Konecta"), you acknowledge that you have read, understood, and agreed to the following terms. These terms apply to your use of the platform both before and after the creation of the Konecta DAO. If you do not agree to these terms, you must immediately stop using the platform.
                </p>

                <ol>
                    <li>
                        <strong>Decentralized Nature of the Platform</strong><br />
                        Konecta Protocol is in a development phase where decisions and governance are currently managed by the Konecta team. Upon the creation of the Konecta Decentralized Autonomous Organization (DAO), governance and decision-making will be transferred to token holders through a decentralized voting process. While the platform transitions to full decentralization, you agree that neither the Konecta team nor the DAO (once established) will be liable for any damages, errors, or losses you may experience. You use the platform at your own risk, both before and after the DAO's creation.
                    </li>
                    <li>
                        <strong>User Responsibilities</strong><br />
                        You are solely responsible for your use of the platform, including the creation, management, and participation in events. You must ensure that your actions comply with all applicable laws and regulations.
                        As a user, you own and manage your own "canister" (a decentralized smart contract). All data stored in your canister, such as calendars, events, and personal information, is your responsibility.
                        You must ensure that your account credentials, including those linked via third-party authentication (e.g., NFID, Twitter), remain secure. Konecta will not be responsible for any unauthorized access to your account resulting from your failure to protect your credentials.
                    </li>
                    <li>
                        <strong>Limitation of Liability</strong><br />
                        Konecta and its contributors, including developers, token holders, affiliates, and service providers, are not liable for any damages arising from the use or inability to use the platform. This includes, but is not limited to, loss of data, errors in event scheduling, or disruptions caused by technical issues within the decentralized network.
                        The transition to DAO governance means that decisions regarding platform upgrades, features, and protocol changes will eventually be made through community voting. You acknowledge that such decisions may impact your experience or access to certain features, and Konecta cannot be held liable for the outcomes of these decisions.
                    </li>
                    <li>
                        <strong>Data Privacy and Storage</strong><br />
                        While Konecta aims to provide a secure decentralized environment for event management, all data is stored on-chain through your personal canister. Konecta cannot access, alter, or delete any of your data without your direct authorization.
                        Your data may be visible to third parties if you choose to share it across integrated apps or services. By using Konecta, you consent to any cross-app data sharing that you initiate.
                        Given the decentralized nature of the Internet Computer Protocol, Konecta cannot guarantee the same privacy controls as traditional Web 2.0 services. Your interactions with the platform are governed by the public nature of blockchain technologies.
                    </li>
                    <li>
                        <strong>Third-Party Services</strong><br />
                        Konecta integrates several third-party services, including but not limited to payments, NFTs, and video on demand. You acknowledge that these services are governed by their own terms and that Konecta is not responsible for any issues arising from their use. Any disputes or claims regarding third-party services must be directed to those service providers.
                    </li>
                    <li>
                        <strong>Tokens and Governance</strong><br />
                        By participating in the Konecta platform and, after the creation of the DAO, in the Konecta DAO, including holding or transacting KTA tokens, you agree to abide by the governance rules as established by token holders.
                        Once established, Konecta's DAO will be governed through a decentralized voting process where token holders propose and vote on changes to the protocol. You understand and accept that the outcome of such votes may affect the operation of your canister or the services provided to you by the platform.
                    </li>
                    <li>
                        <strong>No Warranties</strong><br />
                        Konecta is provided "as-is" without any warranties, express or implied. While the community strives to maintain a functional and reliable protocol, no guarantees are made regarding the platform's performance, security, or availability.
                        Konecta disclaims any responsibility for interruptions or issues that may arise from the use of its open-source code, decentralized infrastructure, or ICP network.
                    </li>
                    <li>
                        <strong>Indemnification</strong><br />
                        You agree to indemnify and hold harmless Konecta, its contributors, token holders, affiliates, and service providers from any claims, damages, losses, or legal actions that may arise from your use of the platform or your violation of these terms.
                    </li>
                    <li>
                        <strong>Amendments</strong><br />
                        As a DAO, any changes to these terms, once the DAO is established, will be subject to governance voting by KTA token holders. You are responsible for staying informed about updates to the platform and its governance rules.
                        By continuing to use the platform after such changes, whether before or after the DAO’s creation, you agree to be bound by the revised terms.
                    </li>
                    <li>
                        <strong>Governing Law</strong><br />
                        As Konecta operates in a decentralized, permissionless environment, legal disputes arising from your use of the platform shall be resolved in accordance with the laws and regulations governing decentralized applications and DAOs, where applicable.
                    </li>
                    <li>
                        <strong>Acceptance</strong><br />
                        By clicking “Accept” and logging into the Konecta platform, you acknowledge that you have read, understood, and agreed to these terms, both during the platform’s development and once the Konecta DAO is established.
                    </li>
                </ol>

                <div className={styles.buttonContainer}>
                    <button
                        className={styles.acceptButton}
                        onClick={handleAccept}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'I Accept'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
