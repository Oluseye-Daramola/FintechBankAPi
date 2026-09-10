const Account = require("../Models/Accounts");
const Transaction = require("../Models/Transactions");
const { nameEnquiry, transferFunds, getNibssBalance } = require("./nibssclient");

const enquireRecipient = async (accountNumber) => {
  if (!accountNumber) {
    throw new Error("Recipient account number is required");
  }
  return await nameEnquiry(accountNumber);
};

const initiateTransfer = async ({ customerId, toAccountNumber, amount }) => {
  if (!toAccountNumber || !amount) {
    throw new Error("Recipient account number and amount are required");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const senderAccount = await Account.findOne({ customerId });

  if (!senderAccount) {
    throw new Error("Sender account not found");
  }

  if (senderAccount.accountNumber === toAccountNumber) {
    throw new Error("Cannot transfer to your own account");
  }

  if (senderAccount.balance < amount) {
    throw new Error("Insufficient balance");
  }

  // Check if the recipient is also a local customer (intra) or not (inter)
  const receiverAccount = await Account.findOne({ accountNumber: toAccountNumber });
  const type = receiverAccount ? "intra" : "inter";

  // Step 1: Name Enquiry before initiating
  const recipient = await nameEnquiry(toAccountNumber);

  // Step 2: Create a local "pending" transaction record first
  const localReference = `TXN-${Date.now()}-${customerId.toString().slice(-6)}`;

  const transaction = await Transaction.create({
    reference: localReference,
    type,
    fromAccount: senderAccount._id,
    toAccount: receiverAccount ? receiverAccount._id : undefined,
    toAccountNumber,
    amount,
    status: "pending",
    initiatedBy: customerId,
  });

  try {
    // Step 3: Execute the transfer via NIBSS
    const transferResult = await transferFunds({
      from: senderAccount.accountNumber,
      to: toAccountNumber,
      amount,
    });

    // Step 4: Sync local balances with NIBSS's real balance
    const updatedBalance = await getNibssBalance(senderAccount.accountNumber);
    senderAccount.balance = updatedBalance.balance;
    await senderAccount.save();

    if (receiverAccount) {
      const receiverBalance = await getNibssBalance(toAccountNumber);
      receiverAccount.balance = receiverBalance.balance;
      await receiverAccount.save();
    }

    // Step 5: Mark transaction successful, store NIBSS's own reference
    transaction.status = "successful";
    transaction.nibssReference = transferResult.reference;
    await transaction.save();

    return {
      reference: transaction.reference,
      nibssReference: transferResult.reference,
      status: transaction.status,
      amount: transferResult.amount,
      receiverName: recipient.accountName,
      newBalance: senderAccount.balance,
    };
  } catch (error) {
    // Mark as failed rather than leaving it stuck "pending"
    transaction.status = "failed";
    await transaction.save();
    throw error;
  }
};

// Transaction Status Check — scoped to the logged-in customer only
const checkTransactionStatus = async ({ customerId, reference }) => {
  const transaction = await Transaction.findOne({ reference, initiatedBy: customerId });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return transaction;
};

module.exports = {
  enquireRecipient,
  initiateTransfer,
  checkTransactionStatus,
};