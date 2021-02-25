"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepAlive = void 0;
const express_1 = __importDefault(require("express"));
const server = express_1.default();
server.all("/", (req, res) => {
    res.send("Ok");
});
function keepAlive() {
    server.listen(3000, () => console.log('Server is ready!'));
}
exports.keepAlive = keepAlive;
