import { render } from "@react-email/components";
import nodemailer from "nodemailer";
import { env } from "~/env";
import ResetPasswordEmail from "~/server/email/templates/reset-password";

const createTransport = (config: string) => nodemailer.createTransport(config);

const sendEmail = async ({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}) => {
	if (!env.EMAIL_FROM || !env.EMAIL_SERVER) {
		throw new Error("Email not configured");
	}
	const transport = createTransport(env.EMAIL_SERVER);
	await transport.sendMail({
		from: env.EMAIL_FROM,
		to,
		subject,
		html,
	});
};

export const sendResetPasswordEmail = async ({
	to,
	url,
}: {
	to: string;
	url: string;
}) => {
	const html = await render(<ResetPasswordEmail url={url} />);

	await sendEmail({
		to,
		subject: "Subtracker - Reset your password",
		html,
	});
};
