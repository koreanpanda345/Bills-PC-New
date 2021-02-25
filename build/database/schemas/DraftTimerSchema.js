"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const draftTimerSchema = new Schema({
    serverId: String,
    channelId: String,
    timer: Number,
    players: [{ userId: String, skips: Number, pokemon: [String], order: Number, queue: [String], leavePicks: String }],
    round: Number,
    maxRounds: Number,
    totalSkips: Number,
    currentPlayer: String,
    direction: String,
    pokemon: [String],
    prefix: String,
    leagueName: String,
    pause: Boolean,
    stop: Boolean,
    edits: Boolean,
    sheetId: String
});
exports.default = mongoose_1.default.model("DraftTimer", draftTimerSchema);
