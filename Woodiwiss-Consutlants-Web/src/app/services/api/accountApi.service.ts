import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '../../app.config';
import { AccountLoginModel } from '../accountLogin.model';
import { User } from '../user.model';

@Injectable({
	providedIn: 'root',
})
export class AccountApiService {
	constructor(@Inject(APP_CONFIG) private config: AppConfig, private httpClient: HttpClient) {}

	public login(model: AccountLoginModel) {
		return this.httpClient.post<User>(`${this.config.ApiUri}/Account/Login`, model);
	}

	public logout() {
		return this.httpClient.post<null>(`${this.config.ApiUri}/Account/Logout`, null);
	}

	public refresh() {
		return this.httpClient.post<Response>(`${this.config.ApiUri}/Account/Refresh`, null, { observe: 'response' });
	}
}
