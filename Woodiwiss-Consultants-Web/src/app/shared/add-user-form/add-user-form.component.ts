import { Component, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { UsersApiService } from 'src/app/services/api/usersApi.service';
import { NewUserFormModel } from 'src/app/services/api/UsersApiModels';
import { FormBaseComponent } from '../form-base/form-base.component';

@Component({
	selector: 'wcw-add-user-form',
	templateUrl: './add-user-form.component.html',
	styleUrls: ['./add-user-form.component.scss'],
})
export class AddUserFormComponent extends FormBaseComponent {
	@Output() onUserAdded = new EventEmitter();

	constructor(recaptcha: ReCaptchaV3Service, private api: UsersApiService) {
		super(recaptcha, 'addUserForm', true);

		this.formGroup = new FormGroup(
			{
				Email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
				Firstname: new FormControl('', [Validators.required, Validators.maxLength(50)]),
				Lastname: new FormControl('', [Validators.required, Validators.maxLength(50)]),
				Password: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(50)]),
				ConfirmPassword: new FormControl('', [Validators.required, Validators.maxLength(50)]),
			},
			this.RequireMatching('Password', 'ConfirmPassword')
		);

		this.customErrorMessages.set('RequireMatching', 'Provided passwords do not match!');
	}

	public submitData(token: string) {
		let formModel: NewUserFormModel = {
			email: this.formGroup.get('Email').value,
			firstName: this.formGroup.get('Firstname').value,
			lastName: this.formGroup.get('Lastname').value,
			password: this.formGroup.get('Password').value,
			recaptchaToken: token,
		};
		this.api.add(formModel).subscribe({
			next: this.onSubmitSuccess.bind(this),
			error: this.onSubmitError.bind(this),
		});
	}
	public onSubmitError(error: any) {
		console.warn(error);
		this.loading = false;
		this.error = true;
	}
	public onSubmitSuccess(data: any) {
		this.loading = false;
		this.error = false;
		this.onUserAdded.emit(null);
	}
}
