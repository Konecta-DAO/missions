import { ENV } from "../config/env";
import type { Request, Response } from 'express';
import type { BodyAuthenticate, QueryAuthenticate, QueryFollow } from "../types/TwitterController";
import { TwitterService } from "../services/twitter";
import { TwitterSession } from "../types/session";

const _doAddress = ENV.DO_ADDRESS;
const frontAddress = ENV.FRONT_ADDRESS;

export class TwitterController {
    private static instance: TwitterController;
    private twitterService: TwitterService;

    private constructor() {
        this.twitterService = TwitterService.getInstance();
    }

    static getInstance(): TwitterController {
        if (!TwitterController.instance) {
            TwitterController.instance = new TwitterController();
        }
        return TwitterController.instance;
    }

    async authenticate(req: Request<unknown, unknown, BodyAuthenticate, QueryAuthenticate>, res: Response): Promise<void> {
        const origin = req.get('origin') || req.get('referrer');
        if (origin !== frontAddress) {
            res.status(403).json({ message: 'Forbidden: Invalid Origin' });
            return
        }
        const { nextAction } = req.query
        const { principalStr, missionIdStr, actorName } = req.body;
        const result = await this.twitterService.authenticateUser(nextAction, principalStr, missionIdStr, actorName)
        if (result.isFailure()) {
            const error = result.getError();
            res.status(error.code).json({ error: error.reason });
            return
        }
        const success = result.getValue();
        const url = success.url;
        const data: TwitterSession = {
            state: success.state,
            codeVerifier: success.codeVerifier,
            userUUID: success.userUUID,
            missionId: success.missionId,
            actorName: success.actorName,
            nextAction: nextAction
        }
        req.session.twitter = data;
        res.redirect(url);
        return
    }

    async follow(req: Request<unknown, unknown, unknown, QueryFollow>, res: Response) {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
        console.log('Full URL:', fullUrl)
        const { code, state } = req.query;
        const data = req.session.twitter;
        if (!data || !code || !state) {
            res.status(400).json({ reason: 'Session data not found' });
            return
        }
        if (data.state !== state || data.nextAction !== 'follow') {
            res.status(400).json({ reason: 'Invalid request for session' });
            return
        }
        const result = await this.twitterService.followCallback(data, code, fullUrl)
        delete req.session.twitter;
        if (result.isFailure()) {
            this.sendFinalResponse(res, '', '', "fake");
            return
        }
        const value = result.getValue();
        this.sendFinalResponse(res, value.accessToken, value.refreshToken || '', "true");
        return
    }

    private sendFinalResponse(res: Response, accessToken: string, refreshToken: string, result: string): void {
        res.send(`
            <!DOCTYPE html>
            <html>
                <body>
                <script>
                    const script = document.createElement('script');
                    script.textContent = \`
                    window.opener.postMessage({
                        accessToken: '${accessToken}',
                        refreshToken: '${refreshToken}',
                        result: '${result}'
                    }, '${ENV.FRONT_ADDRESS}');
                    window.close();
                    \`;
                    document.body.appendChild(script);
                </script>
                </body>
            </html>
            `);
    }
}