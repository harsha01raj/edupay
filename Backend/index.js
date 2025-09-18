const express = require("express");
const connnection = require("./config/db");
const router = require("./Routes/user.routes");
const paymentRouter = require("./Routes/payment.routes");
const webhookrouter = require("./Routes/webhook.routes.js");
const transactionRouter = require("./Routes/transaction.routes.js");
const dotenv = require("dotenv").config();
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*'  
}));

app.use(morgan('dev'));

app.use("/user",router);
app.use('/', paymentRouter); 
app.use('/',webhookrouter);
app.use("/",transactionRouter)

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, async () => {
  try {
    await connnection;
    console.log("Server is sucessfully connected to the database");
    console.log(`Server is running on port http://localhost:${PORT}`);
  } catch (error) {
    console.log("Error connecting to the database", error);
  }
});
