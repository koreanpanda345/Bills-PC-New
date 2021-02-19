import { config } from "dotenv";
import { BillsPC } from "./BillsPC";
import { keepAlive } from "./server";
config();

const client = new BillsPC();
keepAlive();
client.start("production");
//client.start("development");