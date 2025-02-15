import { SerializedUser, SerializedMissionV2 } from "../../declarations/backend/backend.did.js";
import { ActorSubclass } from "@dfinity/agent";

// Function to format seconds into hours, minutes, and seconds
export const formatTime = (seconds: bigint): string => {
    const hours = Number(seconds / 3600n);
    const minutes = Number((seconds % 3600n) / 60n);
    const remainingSeconds = Number(seconds % 60n);
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}, and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  };
  
  // Function to format object details
  export const formatObjectDetails = async (mission: SerializedMissionV2, backend: ActorSubclass<any>): Promise<string> => {
    switch (BigInt(mission.mode)) {
      case 0n:
        return `Button Name: ${mission.obj1}, Button function: ${mission.functionName1}`;
      case 1n:
        return `First Button Name: ${mission.obj1}, function: ${mission.functionName1}<br />Second Button Name: ${mission.obj2}, function: ${mission.functionName1}`;
      case 2n:
        const codes = await backend.getCodes() as string[];
        return `Input Placeholder: ${mission.obj1}<br />Button Name: ${mission.obj2}, function: ${mission.functionName1}<br />Codes:<br />${codes?.map(code => `- ${code}`).join('<br />')}`;
      default:
        return "Unknown Object Details";
    }
  };
  
  // Function to handle sorting
  export const handleSort = (users: SerializedUser[], key: keyof SerializedUser, order: 'asc' | 'desc'): SerializedUser[] => {
    return [...users].sort((a, b) => {
      if (order === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
  };
  