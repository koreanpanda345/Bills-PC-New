import mongoose, { Document } from "mongoose";
const Schema = mongoose.Schema;

export interface IDraftTimer extends Document {
	serverId: string;
	channelId: string;
	timer: number;
	players: Array<{userId: string, skips: number, pokemon: string[], order: number}>;
	maxRounds: number;
	totalSkips: number;
	currentPlayer: string;
	round: number;
	direction: string;
	pokemon: string[];
	prefix: string;
}

const draftTimerSchema = new Schema({
	serverId: String,
	channelId: String,
	timer: Number,
	players: [{userId: String, skips: Number, pokemon: [String], order: Number}],
	round: Number,
	maxRounds: Number,
	totalSkips: Number,
	currentPlayer: String,
	direction: String,
	pokemon: [String],
	prefix: String
});


export default mongoose.model<IDraftTimer>("DraftTimer", draftTimerSchema);