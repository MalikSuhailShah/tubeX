import { Router } from 'express';
import {
    getUserSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)// Pass your id to see the subcriber of yours , or someone else's to see theirs
    .post(toggleSubscription); // in this pass id of channel other than user logged in

router.route("/u/:subscriberId").get(getUserSubscribedChannels);// Pass your id to see the channels you follow, or someone else's to see theirs

export default router