import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Preview,
	pixelBasedPreset,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

interface ResetPasswordEmailProps {
	url: string;
}

const ResetPasswordEmail = ({ url }: ResetPasswordEmailProps) => {
	return (
		<Tailwind
			config={{
				presets: [pixelBasedPreset],
				theme: {
					extend: {
						colors: {
							primary: "hsl(221.2 83.2% 53.3%)",
							"primary-foreground": "hsl(210 40% 98%)",
						},
					},
				},
			}}
		>
			<Html>
				<Head />
				<Body className="bg-gray-100 py-3 font-normal font-sans text-base">
					<Preview>Subtracker reset your password</Preview>
					<Container className="border bg-white p-12">
						<Text className="font-medium text-xl">Subtracker</Text>
						<Section>
							<Text>Hi,</Text>
							<Text>
								Someone recently requested a password change for your Subtracker
								account. If this was you, you can set a new password here:
							</Text>
							<Button
								className="rounded bg-primary px-3 py-2 text-white no-underline hover:bg-primary/80"
								href={url}
							>
								Reset password
							</Button>
							<Text>
								If you don&apos;t want to change your password or didn&apos;t
								request this, just ignore and delete this message.
							</Text>
						</Section>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	);
};
ResetPasswordEmail.PreviewProps = {
	url: "http://localhost:3000/?token=abcd1234",
} satisfies ResetPasswordEmailProps;

export default ResetPasswordEmail;
