import nodemailer, { Transporter } from 'nodemailer';
import { resolve } from 'path';
import handlebars from 'handlebars';
import fs from 'fs';

require('dotenv/config');

class Mailer {
    private client: Transporter;

    constructor() {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        this.client = transporter;
    }

    async execute(to: string, subject: string, variables: object, emailType : "new-user" | "reset-user-password") {
        const resetUserPasswordPath = resolve(__dirname, "..", "views", "emails", "reset.hbs");
        const newUserPath = resolve(__dirname, "..", "views", "emails", "newUser.hbs");

        const hbsTemplate = fs.readFileSync(emailType === "new-user" ? newUserPath : resetUserPasswordPath).toString("utf-8");

        const mailTemplateParse = handlebars.compile(hbsTemplate);

        const html = mailTemplateParse(variables);

        await this.client.sendMail({
            to,
            subject,
            html,
            from: `${process.env.STORE_NAME} ${process.env.EMAIL_USER}`,
        })
    }
}

export default new Mailer();