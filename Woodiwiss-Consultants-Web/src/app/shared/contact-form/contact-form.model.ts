export interface ContactFormModel {
	name: string;
	organisation?: string;
	email: string;
	message: string;
	recaptchaToken: string;
}
