import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ContactApiService } from '../../services/api/contactApi.service';
import { FormBaseComponent } from '../form-base/form-base.component';
import { ContactFormModel } from './contact-form.model';

@Component({
	selector: 'wcw-contact-form',
	templateUrl: './contact-form.component.html',
	styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent extends FormBaseComponent {
	constructor(recaptcha: ReCaptchaV3Service, private api: ContactApiService) {
		super(recaptcha, 'contactForm');

		this.formGroup = new FormGroup({
			Name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
			Organisation: new FormControl('', Validators.maxLength(50)),
			Email: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.email]),
			Message: new FormControl('', [Validators.required, Validators.maxLength(255)]),
		});
	}

	public submitData(token: string) {
		let formModel: ContactFormModel = {
			name: this.formGroup.get('Name').value,
			organisation: this.formGroup.get('Organisation').value,
			email: this.formGroup.get('Email').value,
			message: this.formGroup.get('Message').value,
			recaptchaToken: token,
		};

		this.api.submitContactForm(formModel).subscribe({
			next: this.onSubmitSuccess.bind(this),
			error: this.onSubmitError.bind(this),
		});
	}

	public onSubmitSuccess(data: any) {
		this.loading = false;
		this.success = true;
		this.formGroup.reset();
	}

	public onSubmitError(error: any) {
		console.warn(error);
		this.loading = false;
		this.error = true;
	}
}
