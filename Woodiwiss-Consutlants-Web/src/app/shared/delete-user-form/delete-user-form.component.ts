import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { UsersApiService } from 'src/app/services/api/usersApi.service';
import { DeleteUserFormModel } from 'src/app/services/api/UsersApiModels';
import { User } from 'src/app/services/user.model';
import { FormBaseComponent } from '../form-base/form-base.component';

@Component({
	selector: 'wcw-delete-user-form',
	templateUrl: './delete-user-form.component.html',
	styleUrls: ['./delete-user-form.component.scss'],
})
export class DeleteUserFormComponent extends FormBaseComponent<number> {
	@Input() user: User;

	@Output() onComplete = new EventEmitter<number>();

	constructor(recaptcha: ReCaptchaV3Service, private usersApi: UsersApiService) {
		super(recaptcha, 'deleteUser');

		this.formGroup = new FormGroup({});
	}

	public submitData(token: string) {
		const formModel: DeleteUserFormModel = {
			id: this.user.Id,
			recaptchaToken: token,
		};

		this.usersApi.delete(formModel).subscribe({
			next: this.onSubmitSuccess.bind(this),
			error: this.onSubmitError.bind(this),
		});
	}
	public onSubmitError(error: any) {
		this.error = true;
	}
	public onSubmitSuccess(data: any) {
		this.onComplete.emit(this.user.Id);
	}
}
