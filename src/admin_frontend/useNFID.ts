import { useState, useEffect } from 'react';
import { NFID } from '@nfid/embed';

const NFID_PROVIDER_URL = 'https://nfid.one'; // NFID provider URL

export const useNFID = () => {
  const [nfid, setNfid] = useState<any>(null);
  const [isNfidIframeInstantiated, setIsNfidIframeInstantiated] = useState<boolean>(false);

  useEffect(() => {
    const initNFID = async () => {
      const nfidInstance = await NFID.init({
        origin: NFID_PROVIDER_URL,
        application: {
          name: 'Konectª Pre-Register',
          logo: 'https://dev.nfid.one/static/media/id.300eb72f3335b50f5653a7d6ad5467b3.svg',
        },
      });
      setNfid(nfidInstance);
      setIsNfidIframeInstantiated(true); // Set the iframe instantiation status
    };
    initNFID();
  }, []);

  return { nfid, isNfidIframeInstantiated };
};
