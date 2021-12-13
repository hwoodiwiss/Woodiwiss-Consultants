import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ImageService } from 'src/app/services/image.service';
import { FormBaseComponent } from '../form-base/form-base.component';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';

const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'bmp'];

@Component({
	selector: 'wcw-add-image-form',
	templateUrl: './add-image-form.component.html',
	styleUrls: ['./add-image-form.component.scss'],
})
export class AddImageFormComponent extends FormBaseComponent {
	faCloudUpload = faCloudUploadAlt;
	imgSource: string | null = null;
	invalidImage: boolean = false;
	@ViewChild('canvas', { static: true })
	canvas: ElementRef<HTMLCanvasElement>;

	constructor(recaptcha: ReCaptchaV3Service, private imageService: ImageService) {
		super(recaptcha, 'addImageForm', true);
		this.customErrorMessages.set('RequireImageFile', `Provided file must be a valid image of type: ${ALLOWED_FILE_TYPES.join(', ')}`);

		this.formGroup = new FormGroup(
			{
				ImageFile: new FormControl(undefined, [Validators.required]),
			},
			this.RequireImageFile('ImageFile')
		);
	}

	onFileChanged(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0] as File;
			this.invalidImage = false;
			let fr = new FileReader();
			fr.onload = this.setImageValue.bind(this);
			fr.readAsDataURL(file);
			this.formGroup.patchValue({
				ImageFile: file,
			});
		}
	}

	setImageValue(progressEvt: ProgressEvent<FileReader>) {
		this.imgSource = progressEvt.target.result as string;
	}

	onImageLoadFailed() {
		this.imgSource = null;
		this.invalidImage = true;
	}

	protected RequireImageFile(...fields: string[]): ValidatorFn {
		return (formGroup: FormGroup) => {
			const controlVals: any[] = [];

			for (const field of fields) {
				controlVals.push(formGroup.controls[field].value);
			}

			return controlVals.every((val) => val instanceof File && ALLOWED_FILE_TYPES.some((type) => val.name.toLowerCase().endsWith(type)))
				? null
				: { RequireImageFile: true };
		};
	}

	public async submitData(token: string) {
		const file = this.formGroup.controls['ImageFile'].value;
		try {
			const imageData = await this.imageService.addImage(file);
			this.onSubmitSuccess(imageData);
		} catch (e) {
			this.onSubmitError(e);
		}
	}
	public onSubmitError(error: any) {
		console.warn(error);
		this.loading = false;
		this.error = true;
	}
	public onSubmitSuccess(data: any) {
		this.loading = false;
		this.error = false;
		this.success = true;
	}
	public resetForm(): void {
		this.imgSource = null;
		this.invalidImage = false;
		super.resetForm();
	}
}
