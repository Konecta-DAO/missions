import { useCallback, useState } from 'react';
import { SerializedUser, SerializedProgress } from '../../declarations/backend/backend.did.js';
import { ActorSubclass } from "@dfinity/agent";

export const useFetchUserDetails = (backend: ActorSubclass<any>) => {
  const [userProgress, setUserProgress] = useState<Array<any>>([]);
  const [userTweets, setUserTweets] = useState<Array<any>>([]);
  const [userUsedCodes, setUserUsedCodes] = useState<Array<{ code: string; isUsed: boolean }>>([]);

  const fetchUserDetails = useCallback(async (user: SerializedUser) => {
    const numberOfMissions = await backend.getNumberOfMissions() as number;
    const progressList: Array<{
      missionId: number;
      done: boolean | null;
      totalearned: bigint | null;
      amountOfTimes: bigint | null;
      timestamp: bigint | null;
    }> = [];

    let usedCodesMap: Record<string, boolean> = {};

    for (let i = 0; i < numberOfMissions; i++) {
      const progressArray = await backend.getProgress(user.id, BigInt(i)) as SerializedProgress[] | null;

      if (progressArray && progressArray.length > 0) {
        const progress = progressArray[0]; // Extract the first (and only) item
        // progressList.push({
        //   usedCodes = progress.usedCodes ?? false,

        // });

        // Build the used codes map from this mission's progress
        if (progress.usedCodes && Array.isArray(progress.usedCodes)) {
          progress.usedCodes.forEach(([code, isUsed]) => {
            usedCodesMap[code] = isUsed;
          });
        }
      } else {
        progressList.push({
          missionId: i,
          done: null,
          totalearned: null,
          amountOfTimes: null,
          timestamp: null
        });
      }
    }
    setUserProgress(progressList);

    const tweets = await backend.getTweets(user.id);
    if (tweets && Array.isArray(tweets)) {
      setUserTweets(tweets);
    } else {
      setUserTweets([]);  // If tweets is not an array or is null, set to an empty array
    }

    const allCodes = await backend.getCodes() as string[];
    const usedCodesList = allCodes.map(code => ({
      code,
      isUsed: usedCodesMap[code] ?? false,  // Check if the code is used; default to false
    }));
    setUserUsedCodes(usedCodesList);

  }, [backend]);

  return { userProgress, userTweets, userUsedCodes, fetchUserDetails };
};
