export type BodyAuthenticate = {
    principalStr: string;
    missionIdStr: string;
    actorName: string;
}

export type QueryAuthenticate = {
    nextAction: string;
}

export type QueryFollow = {
    code: string,
    state: string
}