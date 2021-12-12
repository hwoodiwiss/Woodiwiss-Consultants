import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { UsersApiService } from 'src/app/services/api/usersApi.service';
import { NewUserFormModel } from 'src/app/services/api/UsersApiModels';
import { ImageService } from 'src/app/services/image.service';
import { FormBaseComponent } from '../form-base/form-base.component';

@Component({
	selector: 'wcw-add-image-form',
	templateUrl: './add-image-form.component.html',
	styleUrls: ['./add-image-form.component.scss'],
})
export class AddImageFormComponent extends FormBaseComponent {
	@Output() onUserAdded = new EventEmitter();

	constructor(recaptcha: ReCaptchaV3Service, private imageService: ImageService) {
		super(recaptcha, 'addImageForm', true);

		this.formGroup = new FormGroup({
			ImageFile: new FormControl(undefined, [Validators.required]),
		});
	}

	onFileChanged(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.formGroup.patchValue({
				ImageFile: file,
			});
		}
	}

	public submitData(token: string) {
		const file = this.formGroup.controls['ImageFile'].value;
		this.imageService.addImage(file).then(
			() => this.onSubmitSuccess.bind(this),
			() => this.onSubmitError.bind(this)
		);
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
