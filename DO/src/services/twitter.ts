import { TwitterApi } from 'twitter-api-v2';
import type { IParsedOAuth2TokenResult, UserV2Result } from 'twitter-api-v2';
import { Result } from '../utils/Result';
import { ENV } from '../config/env';
import { getContractActorByName } from './actor-factory';
import { Principal } from '@dfinity/principal';
import { getIndexActor } from './index-actor';
import { HttpStatusCode } from 'axios';
import { TwitterSession } from '../types/session';

type AuthResultTwitter = {
  missionId: bigint,
  userUUID: string,
  actorName: string,
  url: string,
  codeVerifier: string,
  state: string
}

type TwitterTokens = {
  accessToken: string,
  refreshToken?: string,
  expiresIn: number
}

export class TwitterService {
  private static instance: TwitterService;
  private client: TwitterApi;

  private constructor() {
    this.client = new TwitterApi({
      appKey: ENV.TWITTER_CLIENT_ID,
      appSecret: ENV.TWITTER_CLIENT_SECRET,
    });
  }

  static getInstance(): TwitterService {
    if (!TwitterService.instance) {
      TwitterService.instance = new TwitterService();
    }
    return TwitterService.instance;
  }

  async authenticateUser(nextAction: string, principalStr: string, missionIdStr: string, actorName: string): Promise<Result<AuthResultTwitter, SimpleError>> {
    try {
      const missionId = BigInt(missionIdStr);

      const _actor = await getContractActorByName(actorName);
      const principalObj = Principal.fromText(principalStr);

      const actorIndex = await getIndexActor();
      const userUUID = await actorIndex.getUUID(principalObj);
      // Check if the user is allowed to perform the mission
      const canDoMission: boolean = true//await actor.canUserDoMission(userUUID, missionId);
      if (!canDoMission) {
        return Result.fail({
          code: HttpStatusCode.Unauthorized,
          reason: 'Not authorized for this mission'
        });
      }
      const callbackUrl = `${ENV.DO_ADDRESS}/${nextAction}`;

      const { url, codeVerifier, state } = this.client.generateOAuth2AuthLink(
        callbackUrl, {
        scope: ['tweet.read', 'users.read', 'follows.read', 'tweet.write', 'follows.write', 'offline.access'],
      });

      return Result.ok({ missionId, userUUID, actorName, url, codeVerifier, state });
    } catch (err) {
      console.error('Error iniciando auth:', err);
      return Result.fail({
        code: HttpStatusCode.InternalServerError,
        reason: 'Error iniciando autenticación'
      });
    }
  }

  async followCallback(data: TwitterSession, code: string, redirectUri: string): Promise<Result<TwitterTokens, SimpleError>> {
    const { userUUID, actorName, codeVerifier } = data; // This contains missionId and maybe stepId
    let clientTwitter: IParsedOAuth2TokenResult
    let accountUser: UserV2Result
    try {
      clientTwitter = await this.getLoggingClient(code, codeVerifier, redirectUri)
      accountUser = await clientTwitter.client.v2.me()
    } catch (err) {
      console.error('Error in followCallback:', err);
      return Result.fail({
        code: HttpStatusCode.InternalServerError,
        reason: 'Error when accessing the Twitter account'
      });
    }
    const { username, id: userTwitterId } = accountUser.data
    const actorIndex = await getIndexActor();
    const isNotOwnerTwitterAccount = await actorIndex.isTwitterIdUsed(data.userUUID, username);
    if (isNotOwnerTwitterAccount) {
      return Result.fail({
        code: HttpStatusCode.Unauthorized,
        reason: 'This Twitter account is already linked to another user'
      });
    }

    const _actor = await getContractActorByName(actorName); // Assuming this actor has methods to interact with the mission and user progress
    const followIds: string[] = ['1747568601706496000', '1828134613375488000'] //await actor.getTwitterFollowIds(missionId, stepId); teorically function for this

    for (const targetId of followIds) {
      try {
        let _isFollowing = false
        const result = await clientTwitter.client.v2.follow(userTwitterId, targetId);
        const data = result.data;
        if (data?.following) {
          _isFollowing = true;
        } else if (data?.pending_follow) {
          _isFollowing = true
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error following target ${targetId}, reason: ${error.message}`);
        } else {
          console.error(`Error following target ${targetId}, reason: ${error}`);
        }
      }
    }

    actorIndex.addTwitterInfo(userUUID, BigInt(userTwitterId), username).then(() => { }).catch((err: unknown) => {
      if (err instanceof Error) {
        console.error('Error adding Twitter info to index:', err.message);
      } else {
        console.error('Error adding Twitter info to index:', err);
      }
    })
    //const stepId = BigInt(1); // Assuming stepId is 1 for this example
    const isUpdatedUserProgress = true // await actor.updateUserProgress(userUUID, missionId, stepId);
    if (!isUpdatedUserProgress) {
      return Result.fail({
        code: HttpStatusCode.InternalServerError,
        reason: 'Error updating user progress'
      });
    }
    const answer: TwitterTokens = { accessToken: clientTwitter.accessToken, refreshToken: clientTwitter.refreshToken, expiresIn: clientTwitter.expiresIn };
    return Result.ok(answer);
  }

  private async getLoggingClient(code: string, codeVerifier: string, redirectUri: string): Promise<IParsedOAuth2TokenResult> {
    const clientLoggingTwitter = await this.client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri,
    });
    return clientLoggingTwitter;
  }

}
