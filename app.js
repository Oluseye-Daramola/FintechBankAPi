require("dotenv").config(); // Load environment variables from .env file

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express"); // Import the Express framework
const mongoose = require("mongoose"); // Import the Mongoose library for MongoDB interactions

const app = express(); // Create an instance of the Express application

app.use(express.json()); //middleware to parse JSON request bodies

const customerRoutes = require("./Routes/CustomerRoute"); //   Import customer routes from the CustomerRoute file
const accountRoutes = require("./Routes/AccountRoute"); // Import account routes from the AccountRoute file   
const transferRoutes = require("./Routes/TransferRoute"); // Import transfer routes from the TransferRoute file


app.use("/api/customers", customerRoutes); // Use the customer routes for any requests starting with /api/customers
app.use("/api/accounts", accountRoutes); // Use the account routes for any requests starting with /api/accounts
app.use("/api/transfers", transferRoutes); // Use the transfer routes for any requests starting with /api/transfers



mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 8000; // Use the PORT from environment variables or default to 8000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
})
.catch((error) => {
    console.error("MongoDB connection failed:", error);
});