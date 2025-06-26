const express = require("express");
const {
  handleAccessToken,
  handlePaymentNotification,
} = require("../controllers/dokuController");

const router = express.Router();

router.post(
  "/authorization/v1/access-token/b2b",
  express.json(),
  handleAccessToken
);
router.post(
  "/v1/transfer-va/payment",
  express.json(),
  handlePaymentNotification
);

module.exports = router;
