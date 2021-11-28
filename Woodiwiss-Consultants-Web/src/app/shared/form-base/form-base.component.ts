import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';

@Component({
	selector: 'wcw-form-base',
	template: '',
})
export abstract class FormBaseComponent<C = null> implements OnInit, OnDestroy {
	@Output() onCancel = new EventEmitter<C>();
	captchaSubscription: Subscription;
	public formGroup: FormGroup;
	public loading = false;
	public success = false;
	public error = false;

	protected customErrorMessages = new Map<string, string>();

	constructor(protected recaptcha: ReCaptchaV3Service, @Inject(String) private formName: string, @Inject(Boolean) private protectCancellation: boolean = false) {}

	ngOnInit(): void {
		document.body.classList.add('show-recaptcha');
	}

	ngOnDestroy(): void {
		if (this.captchaSubscription) {
			this.captchaSubscription.unsubscribe();
		}
		document.body.classList.remove('show-recaptcha');
	}

	public onSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();

		if (!this.formGroup.valid) {
			this.formGroup.markAllAsTouched();
			return;
		}

		this.error = false;
		this.loading = true;

		this.captchaSubscription = this.recaptcha.execute(this.formName).subscribe({
			next: this.submitData.bind(this),
			error: this.handleRecaptchaError.bind(this),
		});
	}

	public handleRecaptchaError(error: any) {
		this.error = true;
		this.loading = false;
		console.warn(error);
	}

	public showErrorsForControl(name: string): boolean {
		const control = this.formGroup.get(name);
		return (control.touched || control.dirty) && control.invalid;
	}

	public getControlValidationErrors(name: string): string[] {
		const errors = new Array<string>();
		const controlErrors: ValidationErrors = this.formGroup.get(name).errors;
		if (controlErrors != null) {
			Object.keys(controlErrors).forEach((error) => {
				if (error === 'required') {
					errors.push(`${name} is required`);
				} else if (error === 'maxlength') {
					errors.push(`${name} has a max length of ${controlErrors[error].requiredLength}, you entered ${controlErrors[error].actualLength}`);
				} else if (error === 'minlength') {
					errors.push(`${name} has a minimum length of ${controlErrors[error].requiredLength}!`);
				} else if (error === 'email') {
					errors.push(`${name} must be a valid email address`);
				} else if (this.customErrorMessages.has(error)) {
					errors.push(this.customErrorMessages.get(error));
				} else {
					errors.push('An unexpected error occured.');
					console.warn(error);
				}
			});
		}

		return errors;
	}

	public showErrorsForGroup(): boolean {
		const group = this.formGroup;
		return (group.touched || group.dirty) && group.invalid;
	}

	public getGroupValidationErrors(): string[] {
		const errors = new Array<string>();
		const groupErrors: ValidationErrors = this.formGroup.errors;
		if (groupErrors != null) {
			Object.keys(groupErrors).forEach((error) => {
				if (this.customErrorMessages.has(error)) {
					errors.push(this.customErrorMessages.get(error));
				} else {
					console.log(error);

					errors.push('An unexpected error occured.');
					console.warn(error);
				}
			});
		}

		return errors;
	}

	public resetForm() {
		this.loading = false;
		this.success = false;
		this.error = false;
		this.formGroup.reset();
	}

	protected RequireMatching(...fields: string[]): ValidatorFn {
		return (formGroup: FormGroup) => {
			const controlVals: string[] = [];

			for (const field of fields) {
				controlVals.push(formGroup.controls[field].value);
			}

			controlVals.every((val) => val === controlVals[0]);

			return controlVals.every((val) => val === controlVals[0]) ? null : { RequireMatching: true };
		};
	}

	public cancelForm(cancelData: any = null) {
		let cancel = true;
		if (this.protectCancellation && !this.formGroup.pristine) {
			cancel = confirm('Your changes will not be saved. Are you sure you want to cancel?');
		}

		if (cancel) {
			this.onCancel.emit(cancelData);
		}
	}

	public abstract submitData(token: string);
	public abstract onSubmitError(error: any);
	public abstract onSubmitSuccess(data: any);
}
