const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const connnection = mongoose.connect(process.env.MONGO_URL);

module.exports = connnection;
