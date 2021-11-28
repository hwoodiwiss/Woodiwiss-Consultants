import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { LoginFormComponent } from './login-form.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AccountLoginModel } from 'src/app/services/accountLogin.model';
import { AccountService } from 'src/app/services/account.service';

describe('ContactFormComponent', () => {
	let component: LoginFormComponent;
	let fixture: ComponentFixture<LoginFormComponent>;

	const mockRecaptchaService = {
		execute: jest.fn().mockReturnValue(of('')),
	};
	const mockAccountService = {
		login: jest.fn(),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LoginFormComponent],
			imports: [FormsModule, ReactiveFormsModule, RecaptchaV3Module, HttpClientTestingModule, RouterTestingModule],
			providers: [
				{
					provide: ReCaptchaV3Service,
					useValue: mockRecaptchaService,
				},
				{
					provide: AccountService,
					useValue: mockAccountService,
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		jest.resetAllMocks();
		fixture = TestBed.createComponent(LoginFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('ngOnInit should add show-recaptcha class to body', () => {
		document.body.classList.remove('show-recaptcha');
		expect(document.body.classList.contains('show-recaptcha')).toBe(false);

		component.ngOnInit();
		expect(document.body.classList.contains('show-recaptcha')).toBe(true);
	});

	it('ngOnDestroy should remove show-recaptcha class from body', () => {
		document.body.classList.add('show-recaptcha');
		expect(document.body.classList.contains('show-recaptcha')).toBe(true);

		component.ngOnDestroy();
		expect(document.body.classList.contains('show-recaptcha')).toBe(false);
	});

	it('ngOnDestroy should unsubscribe the page from the captcha service', () => {
		const testSubscription = {
			unsubscribe: jest.fn(),
		};
		(component as any).captchaSubscription = testSubscription;

		component.ngOnDestroy();

		expect(testSubscription.unsubscribe).toBeCalled();
	});

	it('handleRecaptchaError should output errors to stdwarn', () => {
		(console as any).warn = jest.fn();
		const errorObj = {
			error_text: 'rofl',
		};

		component.handleRecaptchaError(errorObj);

		expect((console as any).warn).toBeCalledWith(errorObj);
	});

	it('onSubmitError should output errors to stdwarn', () => {
		(console as any).warn = jest.fn();
		const errorObj = {
			error_text: 'rofl',
		};

		component.onSubmitError(errorObj);

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

	it('onSubmit should execute recaptcha on the action formSubmit, and call handleRecaptchaError on error', () => {
		const event = {
			stopPropagation: () => {},
			preventDefault: () => {},
		};
		Object.defineProperty(component.formGroup as any, 'valid', { get: jest.fn().mockReturnValue(true) });

		const handleErrorSpy = jest.spyOn(component, 'handleRecaptchaError');
		const error = 'error';
		mockRecaptchaService.execute.mockReturnValue(throwError(error));
		component.onSubmit(event as any);

		expect(handleErrorSpy).toBeCalledWith(error);
	});

	it('submitData should submit a filled AccountLoginModel to the account service', () => {
		const email = 'test@email.com';
		const password = 'test';
		const recaptchaToken = 'token';

		let expectedFormModel: AccountLoginModel = {
			email,
			password,
			recaptchaToken,
		};

		component.formGroup.get('Email').setValue(email);
		component.formGroup.get('Password').setValue(password);

		mockAccountService.login.mockReturnValue(of(''));
		component.submitData(recaptchaToken);
		expect(mockAccountService.login).toBeCalledWith(expectedFormModel);
	});

	it('submitData should call onLoginSuccess on success response', () => {
		const token = 'token';

		const submitSuccessSpy = jest.spyOn(component, 'onSubmitSuccess');

		mockAccountService.login.mockReturnValue(of(''));
		component.submitData(token);
		expect(submitSuccessSpy).toBeCalled();
	});

	it('submitData should call onLoginError on error response', () => {
		const error = 'error';

		const submitErrorSpy = jest.spyOn(component, 'onSubmitError');

		mockAccountService.login.mockReturnValue(throwError(error));
		component.submitData('');
		expect(submitErrorSpy).toBeCalledWith(error);
	});

	it('resetForm should set loading and success to false, and clear the formGroup', () => {
		component.error = true;

		const resetSpy = jest.spyOn(component.formGroup, 'reset');

		component.resetForm();

		expect(component.error).toBe(false);
		expect(resetSpy).toBeCalled();
	});

	it('showErrorsForControl should return false if invalid is false', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			invalid: false,
			touched: true,
			dirty: true,
		});

		const actual = component.showErrorsForControl('Name');

		expect(actual).toBe(false);
	});

	it('showErrorsForControl should return false if invalid is true but touched and dirty are false', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			invalid: true,
			touched: false,
			dirty: false,
		});

		const actual = component.showErrorsForControl('Name');

		expect(actual).toBe(false);
	});

	it('showErrorsForControl should return true if invalid is true and touched is true', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			invalid: true,
			touched: true,
			dirty: false,
		});

		const actual = component.showErrorsForControl('Name');

		expect(actual).toBe(true);
	});

	it('showErrorsForControl should return true if invalid is true and dirty is true', () => {
		(component.formGroup as any).get = jest.fn().mockReturnValue({
			invalid: true,
			touched: false,
			dirty: true,
		});

		const actual = component.showErrorsForControl('Name');

		expect(actual).toBe(true);
	});
});
