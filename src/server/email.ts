import nodemailer from "nodemailer";
import { env } from "~/env";

const createTransport = (config: string) => nodemailer.createTransport(config);

export const sendEmail = async ({
	to,
	subject,
	text,
}: {
	to: string;
	subject: string;
	text: string;
}) => {
	if (!env.EMAIL_FROM || !env.EMAIL_SERVER) {
		throw new Error("Email not configured");
	}
	const transport = createTransport(env.EMAIL_SERVER);
	await transport.sendMail({
		from: env.EMAIL_FROM,
		to,
		subject,
		text,
	});
};
