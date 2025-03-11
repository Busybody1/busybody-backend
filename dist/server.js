"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const discordWebhook_1 = require("./config/utils/discordWebhook");
const port = process.env.PORT || 3000;
const server = app_1.default.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Shutting down server...');
    yield (0, discordWebhook_1.sendDiscordWebhook)('Shutting down server...');
    server.close(() => {
        console.log('Server shut down.');
        process.exit(0);
    });
}));
