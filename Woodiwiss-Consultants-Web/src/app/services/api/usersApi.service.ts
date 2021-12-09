import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '../../app.config';
import { User } from '../user.model';
import { DeleteUserFormModel, NewUserFormModel, UpdateUserFormModel } from './UsersApiModels';

@Injectable({
	providedIn: 'root',
})
export class UsersApiService {
	constructor(@Inject(APP_CONFIG) private config: AppConfig, private httpClient: HttpClient) {}

	public add(model: NewUserFormModel) {
		return this.httpClient.post<User>(`${this.config.CmsApiUri}/User/Add`, model);
	}

	public update(model: UpdateUserFormModel) {
		return this.httpClient.post<User>(`${this.config.CmsApiUri}/User/Update`, model);
	}

	public list() {
		return this.httpClient.get<User[]>(`${this.config.CmsApiUri}/User/List`);
	}

	public delete(model: DeleteUserFormModel) {
		return this.httpClient.post<null>(`${this.config.CmsApiUri}/User/Delete`, model);
	}
}
