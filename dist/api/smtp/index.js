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
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = require("nodemailer");
class Mail {
    constructor() {
        this.sendMessage = ({ user, title, message, }) => __awaiter(this, void 0, void 0, function* () {
            yield this.transporter.sendMail({
                from: '"Far Reach Co." <wyrld.dashboard@gmail.com>',
                to: user.email,
                subject: title,
                html: `
        <div>
          <h2>Hello from the Far Reach Co. team!</h2>
          <p>${message}</p>
        </div>
      `,
            });
        });
        this.transporter = (0, nodemailer_1.createTransport)({
            host: "smtp.googlemail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }
}
const mail = new Mail();
exports.default = mail;
