/* istanbul ignore file */

export interface User {
	Id: number;
	Email: string;
	FirstName: string;
	LastName: string;
}

export function isUser(object: any): object is User {
	return (
		(object as User)?.Id !== undefined &&
		(object as User)?.Email !== undefined &&
		(object as User)?.FirstName !== undefined &&
		(object as User)?.LastName !== undefined
	);
}
