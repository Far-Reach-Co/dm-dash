import { Transporter, createTransport } from "nodemailer";

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
  sendMessage = async ({
    user,
    title,
    message,
  }: {
    user: { email: string };
    title: string;
    message: string;
  }) => {
    await this.transporter.sendMail({
      from: '"Far Reach Co." <wyrld.dashboard@gmail.com>', // sender address
      to: user.email, // list of receivers
      subject: title, // Subject line
      html: /*html*/ `
        <div>
          <h2>Hello from the Far Reach Co. team!</h2>
          <p>${message}</p>
        </div>
      `,
    });
  };
}

const mail = new Mail();

export default mail;
