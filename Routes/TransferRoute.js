const express = require("express");
const { nameEnquiryController, transferFundsController, transactionStatusController } = require("../Controllers/TransactionController");
const { protect } = require("../Middleware/auth");

const router = express.Router();

router.get("/name-enquiry/:accountNumber", protect, nameEnquiryController);
router.post("/fundstransfer", protect, transferFundsController);
router.get("/status/:reference", protect, transactionStatusController);

module.exports = router;

