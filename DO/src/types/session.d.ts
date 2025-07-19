import _session from "express-session";

type TwitterSession = {
    actorName: string;
    codeVerifier: string;
    missionId: bigint;
    state: string;
    userUUID: string;
    nextAction: string;
}

// Augment express-session with a custom SessionData object
declare module "express-session" {
  interface SessionData {
    twitter: TwitterSession;
  }
}