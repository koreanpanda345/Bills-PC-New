import { config } from "dotenv";
import { BillsPC } from "./BillsPC";
import { keepAlive } from "./server";
import mongoose from "mongoose";
config();

mongoose.connect(process.env.MONGOOSE_CONNECTION_URL as string, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: true
});

const client = new BillsPC();
//keepAlive();

client.start("production");
// client.start("development");