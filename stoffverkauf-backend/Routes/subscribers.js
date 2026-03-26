const express = require("express");
const { Subscribers, getSubscribers, sendCampaign } = require("../Controllers/Subscribers/subscribers");

const router = express.Router();

router.post("/add-subscribers", Subscribers);

router.get("/get-subscribers", getSubscribers);

router.post("/send-campaign", sendCampaign);

module.exports = router;