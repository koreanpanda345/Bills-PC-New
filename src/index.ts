import { config } from "dotenv";
import { BillsPC } from "./BillsPC";
config();

const client = new BillsPC();

client.start("production");
//client.start("development");