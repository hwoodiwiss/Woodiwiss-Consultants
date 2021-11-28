import { Component, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { AccountService } from 'src/app/services/account.service';
import { AccountLoginModel } from 'src/app/services/accountLogin.model';
import { FormBaseComponent } from '../form-base/form-base.component';

@Component({
	selector: 'wcw-login-form',
	templateUrl: './login-form.component.html',
	styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent extends FormBaseComponent {
	@Output() onLogin = new EventEmitter();

	constructor(recaptcha: ReCaptchaV3Service, private accountService: AccountService) {
		super(recaptcha, 'loginForm');

		this.formGroup = new FormGroup({
			Email: new FormControl('', [Validators.required, Validators.email]),
			Password: new FormControl('', Validators.required),
		});
	}

	public submitData(token: string) {
		let formModel: AccountLoginModel = {
			email: this.formGroup.get('Email').value,
			password: this.formGroup.get('Password').value,
			recaptchaToken: token,
		};

		this.accountService.login(formModel).subscribe({
			next: this.onSubmitSuccess.bind(this),
			error: this.onSubmitError.bind(this),
		});
	}

	public handleRecaptchaError(error: any) {
		this.error = true;
		this.loading = false;
		console.warn(error);
	}

	public onSubmitSuccess(data: any) {
		this.onLogin.emit(null);
	}

	public onSubmitError(error: any) {
		console.warn(error);
		this.loading = false;
		this.error = true;
	}
}
