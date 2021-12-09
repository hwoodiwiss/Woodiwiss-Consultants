import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from 'src/app/app.config';

export interface ContentModel {
	Content: string;
}

@Injectable({
	providedIn: 'root',
})
export class ContentApiService {
	constructor(@Inject(APP_CONFIG) private config: AppConfig, private httpClient: HttpClient) {}

	public get(id: string) {
		return this.httpClient.get<ContentModel>(`${this.config.CmsApiUri}/Content/Get?id=${id}`);
	}

	public update(id: string, content: string, recaptchaToken: string) {
		return this.httpClient.post(`${this.config.CmsApiUri}/Content/Update`, {
			id,
			content,
			recaptchaToken,
		});
	}
}
