import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { UsersApiService } from 'src/app/services/api/usersApi.service';
import { UpdateUserFormModel } from 'src/app/services/api/UsersApiModels';
import { isUser, User } from 'src/app/services/user.model';
import { FormBaseComponent } from '../form-base/form-base.component';

@Component({
	selector: 'wcw-update-user-form',
	templateUrl: './update-user-form.component.html',
	styleUrls: ['./update-user-form.component.scss'],
})
export class UpdateUserFormComponent extends FormBaseComponent implements OnInit {
	@Input() user: User;
	@Output() onComplete = new EventEmitter<User>();

	constructor(recaptcha: ReCaptchaV3Service, private api: UsersApiService) {
		super(recaptcha, 'updateUserForm', true);

		this.customErrorMessages.set('RequireMatching', 'Provided passwords do not match!');
	}

	ngOnInit() {
		this.formGroup = new FormGroup(
			{
				Email: new FormControl(this.user.Email, [Validators.required, Validators.email, Validators.maxLength(50)]),
				Firstname: new FormControl(this.user.FirstName, [Validators.required, Validators.maxLength(50)]),
				Lastname: new FormControl(this.user.LastName, [Validators.required, Validators.maxLength(50)]),
				Password: new FormControl(null, [Validators.maxLength(50), Validators.minLength(10)]),
				ConfirmPassword: new FormControl(null, [Validators.maxLength(50)]),
			},
			this.RequireMatching('Password', 'ConfirmPassword')
		);

		super.ngOnInit();
	}

	public submitData(token: string) {
		const formModel: UpdateUserFormModel = {
			id: this.user.Id,
			email: this.formGroup.controls['Email'].value,
			firstName: this.formGroup.controls['Firstname'].value,
			lastName: this.formGroup.controls['Lastname'].value,
			password: this.formGroup.controls['Password'].value ?? null,
			recaptchaToken: token,
		};

		this.api.update(formModel).subscribe({
			next: this.onSubmitSuccess.bind(this),
			error: this.onSubmitError.bind(this),
		});
	}
	public onSubmitError(error: any) {
		this.loading = false;
		this.error = true;
	}

	public onSubmitSuccess(data: any) {
		if (isUser(data)) {
			this.loading = false;
			this.onComplete.emit(data);
		}
	}

	public disableUserFields() {
		return this.user.Id === 1 ? true : null;
	}
}
