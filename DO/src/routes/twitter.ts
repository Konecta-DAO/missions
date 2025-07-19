import { Router } from "express";
import { TwitterController } from "../controllers/twitter";

export const createTwitterRouter = () => {
    const twitterRouter = Router()

    const twitterController = TwitterController.getInstance();

    twitterRouter.post('/request-auth', twitterController.authenticate)
    twitterRouter.get('/follow', twitterController.follow)

    return twitterRouter
}