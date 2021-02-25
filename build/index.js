"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const BillsPC_1 = require("./BillsPC");
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.config();
mongoose_1.default.connect(process.env.MONGOOSE_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true
});
const client = new BillsPC_1.BillsPC();
//keepAlive();
client.start("production");
// client.start("development");
