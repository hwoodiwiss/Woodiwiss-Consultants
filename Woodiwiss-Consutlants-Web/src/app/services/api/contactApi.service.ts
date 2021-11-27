import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '../../app.config';
import { ContactFormModel } from '../../shared/contact-form/contact-form.model';

@Injectable({
	providedIn: 'root',
})
export class ContactApiService {
	constructor(@Inject(APP_CONFIG) private config: AppConfig, private httpClient: HttpClient) {}

	public submitContactForm(model: ContactFormModel) {
		return this.httpClient.post(`${this.config.ApiUri}/Contact/Send`, model);
	}
}
