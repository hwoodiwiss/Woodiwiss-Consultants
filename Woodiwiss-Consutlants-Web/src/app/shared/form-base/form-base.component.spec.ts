import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { of } from 'rxjs';
import { FormBaseComponent } from './form-base.component';

describe('FormBaseComponent', () => {
	let component: TestFormBase;
	let fixture: ComponentFixture<TestFormBase>;
	const mockRecaptchaService = {
		execute: jest.fn().mockReturnValue(of('')),
	};
	let confirmResult = false;
	window.confirm = () => confirmResult;
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TestFormBase],
			imports: [FormsModule, ReactiveFormsModule, RecaptchaV3Module, HttpClientTestingModule],
			providers: [
				{
					provide: ReCaptchaV3Service,
					useValue: mockRecaptchaService,
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TestFormBase);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('getControlValidationErrors should return an empty array if no errors', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			errors: null,
		});

		const actual = component.getControlValidationErrors('Required');

		expect(actual.length).toBe(0);
	});

	it('getControlValidationErrors should list required validation errors for a specified control', () => {
		component.formGroup.controls['Required'].setValue('');

		const actual = component.getControlValidationErrors('Required');

		expect(actual.length).toBe(1);
		expect(actual[0]).toContain('required');
	});

	it('getControlValidationErrors should list email validation errors for a specified control', () => {
		component.formGroup.controls['Email'].setValue('hello');

		const actual = component.getControlValidationErrors('Email');

		expect(actual.length).toBe(1);
		expect(actual[0]).toContain('valid email');
	});

	it('getControlValidationErrors should list max length validation errors for a specified control', () => {
		component.formGroup.controls['MaxLength'].setValue(new Array(100).join('b'));

		const actual = component.getControlValidationErrors('MaxLength');

		expect(actual.length).toBe(1);
		expect(actual[0]).toContain('max length of 2');
		expect(actual[0]).toContain('you entered 99');
	});

	it('getControlValidationErrors should list min length validation errors for a specified control', () => {
		component.formGroup.controls['MinLength'].setValue('b');

		const actual = component.getControlValidationErrors('MinLength');

		expect(actual.length).toBe(1);
		expect(actual[0]).toContain('minimum length of 2');
	});

	it('getControlValidationErrors should list custom validation errors for a specified control', () => {
		component.formGroup.controls['MinVal'].setValue(1);

		const actual = component.getControlValidationErrors('MinVal');

		expect(actual.length).toBe(1);
		expect(actual[0]).toContain('requires a min value');
	});

	it('getControlValidationErrors should give a generic error for a unexpected validation errors', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			errors: {
				the_spanish_inquisition: {},
			},
		});

		const actual = component.getControlValidationErrors('Name');

		expect(actual.length).toBe(1);
		expect(actual[0]).toContain('An unexpected');
	});

	it('getControlValidationErrors should return an empty array if no errors', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			errors: null,
		});

		const actual = component.getControlValidationErrors('Name');

		expect(actual.length).toBe(0);
	});

	it('getGroupValidationErrors should list custom validation errors if found', () => {
		component.formGroup.controls['MinVal'].setValue(2);
		component.formGroup.controls['MaxVal'].setValue(1);

		const actual = component.getGroupValidationErrors();

		expect(actual.length).toBe(1);
		expect(actual[0]).toContain('Min and Max should match');
	});

	it('getGroupValidationErrors should return an empty array if no errors', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			errors: null,
		});

		const actual = component.getGroupValidationErrors();

		expect(actual.length).toBe(0);
	});

	it('getGroupValidationErrors should give a generic error for a unexpected validation errors', () => {
		(component as any).formGroup = {
			errors: {
				the_spanish_inquisition: {},
			},
		};

		const actual = component.getGroupValidationErrors();

		expect(actual.length).toBe(1);
		expect(actual[0]).toContain('An unexpected');
	});

	it('handleRecaptchaError should output errors to stdwarn', () => {
		(console as any).warn = jest.fn();
		const errorObj = {
			error_text: 'rofl',
		};

		component.handleRecaptchaError(errorObj);

		expect((console as any).warn).toBeCalledWith(errorObj);
	});

	it('onSubmit should preventDefault and stopPropagation on the event', () => {
		const event = {
			stopPropagation: jest.fn(),
			preventDefault: jest.fn(),
		};

		component.onSubmit(event as any);

		expect(event.preventDefault).toBeCalled();
		expect(event.preventDefault).toBeCalled();
	});

	it('onSubmit should mark fields as touched and return if the form group is not valid', () => {
		const event = {
			stopPropagation: () => {},
			preventDefault: () => {},
		};

		const markAllTouchedSpy = jest.spyOn(component.formGroup, 'markAllAsTouched');

		component.onSubmit(event as any);

		expect(markAllTouchedSpy).toBeCalled();
	});

	it('onSubmit should execute recaptcha on the action formSubmit, and call submitData if successfull', () => {
		const event = {
			stopPropagation: () => {},
			preventDefault: () => {},
		};
		Object.defineProperty(component.formGroup as any, 'valid', { get: jest.fn().mockReturnValue(true) });

		const submitDataSpy = jest.spyOn(component, 'submitData');
		const token = 'token';
		mockRecaptchaService.execute.mockReturnValue(of(token));
		component.onSubmit(event as any);

		expect(submitDataSpy).toBeCalledWith(token);
	});

	it('resetForm should set loading and success to false, and clear the formGroup', () => {
		component.loading = true;
		component.success = true;
		component.error = true;

		const resetSpy = jest.spyOn(component.formGroup, 'reset');

		component.resetForm();

		expect(component.loading).toBe(false);
		expect(component.success).toBe(false);
		expect(component.error).toBe(false);
		expect(resetSpy).toBeCalled();
	});

	it('showErrorsForControl should return false if invalid is false', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			invalid: false,
			touched: true,
			dirty: true,
		});

		const actual = component.showErrorsForControl('Required');

		expect(actual).toBe(false);
	});

	it('showErrorsForControl should return false if invalid is true but touched and dirty are false', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			invalid: true,
			touched: false,
			dirty: false,
		});

		const actual = component.showErrorsForControl('Required');

		expect(actual).toBe(false);
	});

	it('showErrorsForControl should return true if invalid is true and touched is true', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			invalid: true,
			touched: true,
			dirty: false,
		});

		const actual = component.showErrorsForControl('Required');

		expect(actual).toBe(true);
	});

	it('showErrorsForControl should return true if invalid is true and dirty is true', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			invalid: true,
			touched: false,
			dirty: true,
		});

		const actual = component.showErrorsForControl('Required');

		expect(actual).toBe(true);
	});

	it('showErrorsForGroup should return false if invalid is false', () => {
		(component as any).formGroup = {
			invalid: false,
			touched: true,
			dirty: true,
		};

		const actual = component.showErrorsForGroup();

		expect(actual).toBe(false);
	});

	it('showErrorsForGroup should return false if invalid is true but touched and dirty are false', () => {
		(component as any).formGroup = {
			invalid: true,
			touched: false,
			dirty: false,
		};

		const actual = component.showErrorsForGroup();

		expect(actual).toBe(false);
	});

	it('showErrorsForGroup should return true if invalid is true and touched is true', () => {
		(component as any).formGroup = {
			invalid: true,
			touched: true,
			dirty: false,
		};

		const actual = component.showErrorsForGroup();

		expect(actual).toBe(true);
	});

	it('showErrorsForGroup should return true if invalid is true and dirty is true', () => {
		(component as any).formGroup = {
			invalid: true,
			touched: false,
			dirty: true,
		};

		const actual = component.showErrorsForGroup();

		expect(actual).toBe(true);
	});

	it('cancelForm emits a cancel event if protectCancellation is false', () => {
		(component as any).protectCancellation = false;
		let spyEmit = jest.spyOn(component.onCancel, 'emit');
		let testData = {
			foo: 'bar',
		};
		component.cancelForm(testData);
		expect(spyEmit).toBeCalledWith(testData);
	});

	it('cancelForm emits a cancel event if protectCancellation is true and form group is pristine', () => {
		(component as any).protectCancellation = true;
		(component.formGroup as any).pristine = true;
		let spyEmit = jest.spyOn(component.onCancel, 'emit');
		let testData = {
			foo: 'bar',
		};
		component.cancelForm(testData);
		expect(spyEmit).toBeCalledWith(testData);
	});

	it('cancelForm emits a cancel event if protectCancellation is true and form group is not pristine and confirm is true', () => {
		(component as any).protectCancellation = true;
		(component.formGroup as any).pristine = false;
		confirmResult = true;
		let spyEmit = jest.spyOn(component.onCancel, 'emit');

		component.cancelForm();
		expect(spyEmit).toBeCalled();
	});

	it('cancelForm does not emit a cancel event if protectCancellation is true and form group is not pristine and confirm is false', () => {
		(component as any).protectCancellation = true;
		(component.formGroup as any).pristine = false;
		confirmResult = false;
		let spyEmit = jest.spyOn(component.onCancel, 'emit');
		let testData = {
			foo: 'bar',
		};
		component.cancelForm(testData);
		expect(spyEmit).not.toBeCalled();
	});
});

@Component({
	selector: 'wcw-form-base-test',
	template: '',
})
class TestFormBase extends FormBaseComponent {
	constructor(recaptcha: ReCaptchaV3Service) {
		super(recaptcha, 'testForm');

		this.formGroup = new FormGroup(
			{
				Required: new FormControl('', [Validators.required]),
				MaxLength: new FormControl('', Validators.maxLength(2)),
				Email: new FormControl('', [Validators.email]),
				MinLength: new FormControl('', [Validators.minLength(2)]),
				MinVal: new FormControl('', [Validators.min(2)]),
				MaxVal: new FormControl('', [Validators.max(2)]),
			},
			this.RequireMatching('MinVal', 'MaxVal')
		);

		this.customErrorMessages.set('min', 'requires a min value');
		this.customErrorMessages.set('RequireMatching', 'Min and Max should match');
	}
	public submitData = jest.fn();
	public onSubmitError = jest.fn();
	public onSubmitSuccess = jest.fn();
}
