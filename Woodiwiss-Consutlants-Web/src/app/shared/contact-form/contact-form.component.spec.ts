import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ContactFormComponent } from './contact-form.component';
import { ContactFormModel } from './contact-form.model';
import { ContactApiService } from 'src/app/services/api/contactApi.service';

describe('ContactFormComponent', () => {
	let component: ContactFormComponent;
	let fixture: ComponentFixture<ContactFormComponent>;
	let componentRoot: HTMLElement;
	const mockRecaptchaService = {
		execute: jest.fn().mockReturnValue(of('')),
	};
	const mockApiService = {
		submitContactForm: jest.fn(),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ContactFormComponent],
			imports: [FormsModule, ReactiveFormsModule, RecaptchaV3Module, HttpClientTestingModule],
			providers: [
				{
					provide: ReCaptchaV3Service,
					useValue: mockRecaptchaService,
				},
				{
					provide: ContactApiService,
					useValue: mockApiService,
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		jest.resetAllMocks();
		fixture = TestBed.createComponent(ContactFormComponent);
		component = fixture.componentInstance;
		componentRoot = fixture.nativeElement as HTMLElement;
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

	it('onSubmitError should output errors to stdwarn', () => {
		(console as any).warn = jest.fn();
		const errorObj = {
			error_text: 'rofl',
		};

		component.onSubmitError(errorObj);

		expect((console as any).warn).toBeCalledWith(errorObj);
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

	it('submitData should submit a filled ContactFormData to the api', () => {
		const token = 'token';
		const name = 'test';
		const email = 'test';
		const organisation = 'test';
		const message = 'test';

		let expectedFormModel: ContactFormModel = {
			name: name,
			organisation: organisation,
			email: email,
			message: message,
			recaptchaToken: token,
		};

		component.formGroup.get('Name').setValue(name);
		component.formGroup.get('Organisation').setValue(organisation);
		component.formGroup.get('Email').setValue(email);
		component.formGroup.get('Message').setValue(message);

		mockApiService.submitContactForm.mockReturnValue(of(''));
		component.submitData(token);
		expect(mockApiService.submitContactForm).toBeCalledWith(expectedFormModel);
	});

	it('submitData should call onSubmitSuccess on success response', () => {
		const token = 'token';

		const submitSuccessSpy = jest.spyOn(component, 'onSubmitSuccess');

		mockApiService.submitContactForm.mockReturnValue(of(''));
		component.submitData(token);
		expect(submitSuccessSpy).toBeCalled();
	});

	it('submitData should call onSubmitError on error response', () => {
		const error = 'error';

		const submitErrorSpy = jest.spyOn(component, 'onSubmitError');

		mockApiService.submitContactForm.mockReturnValue(throwError(error));
		component.submitData('');
		expect(submitErrorSpy).toBeCalledWith(error);
	});
});
