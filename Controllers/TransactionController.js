const { enquireRecipient, initiateTransfer, checkTransactionStatus } = require("../Services/TransferService");

const nameEnquiryController = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Account number is required",
      });
    }

    const result = await enquireRecipient(accountNumber);

    return res.status(200).json({
      success: true,
      message: "Recipient details retrieved",
      data: result,
    });
  } catch (error) {
    console.error("Name enquiry error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Name enquiry failed",
    });
  }
};

const transferFundsController = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { toAccountNumber, amount } = req.body;

    const result = await initiateTransfer({ customerId, toAccountNumber, amount });

    return res.status(200).json({
      success: true,
      message: "Transfer successful",
      data: result,
    });
  } catch (error) {
    console.error("Transfer error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Transfer failed",
    });
  }
};

const transactionStatusController = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { reference } = req.params;

    const transaction = await checkTransactionStatus({ customerId, reference });

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Transaction status error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Transaction not found",
    });
  }
};

module.exports = {
  nameEnquiryController,
  transferFundsController,
  transactionStatusController, 
};
