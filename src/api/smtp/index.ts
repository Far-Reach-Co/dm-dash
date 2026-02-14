import { Transporter, createTransport } from "nodemailer";

interface SendMessageParams {
  user: { email: string };
  title: string;
  message: string;
  footerHtml?: string;
  headers?: Record<string, string>;
}

class Mail {
  transporter: Transporter;
  constructor() {
    this.transporter = createTransport({
      host: "smtp.googlemail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  sendMessage = async ({ user, title, message, footerHtml, headers }: SendMessageParams) => {
    const normalizedMessage = message.replace(/\n/g, "<br>");
    await this.transporter.sendMail({
      from: '"Far Reach Co." <wyrld.dashboard@gmail.com>', // sender address
      to: user.email, // list of receivers
      subject: title, // Subject line
      headers,
      html: /*html*/ `
        <div>
          <h2>Hello from the Far Reach Co. team!</h2>
          <div>${normalizedMessage}</div>
          ${footerHtml ? `<hr />${footerHtml}` : ""}
        </div>
      `,
    });
  };
}

const mail = new Mail();

export default mail;
