import { useState, useEffect } from 'react';
import { NFID } from '@nfid/embed';

const NFID_PROVIDER_URL = 'https://nfid.one'; // NFID provider URL

export const useNFID = (onNfidIframeInstantiated: () => void) => {
  const [nfid, setNfid] = useState<any>(null);

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
      onNfidIframeInstantiated(); // Call the callback function
    };
    initNFID();
  }, [onNfidIframeInstantiated]);

  return { nfid };
};
