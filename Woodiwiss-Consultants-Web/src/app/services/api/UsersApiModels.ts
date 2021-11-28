export interface NewUserFormModel {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
	recaptchaToken: string;
}

export interface UpdateUserFormModel {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	password?: string;
	recaptchaToken: string;
}

export interface DeleteUserFormModel {
	id: number;
	recaptchaToken: string;
}
