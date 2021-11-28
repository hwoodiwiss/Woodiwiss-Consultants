import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AppConfig, APP_CONFIG } from 'src/app/app.config';
import { ContactFormModel } from 'src/app/shared/contact-form/contact-form.model';
import { ContactApiService } from './contactApi.service';

describe('ContactApiService tests', () => {
	const testConfig: AppConfig = {
		ApiUri: 'http://localhost:8000',
	};

	const mockHttpClient = {
		post: jest.fn(),
	};
	let service: ContactApiService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [
				{
					provide: APP_CONFIG,
					useFactory: () => testConfig,
				},
				{
					provide: HttpClient,
					useValue: mockHttpClient,
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		service = TestBed.inject(ContactApiService);
	});

	it('should create', () => {
		expect(service).toBeTruthy();
	});

	it('submitContactForm should send a post request with the provided model', () => {
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

		service.submitContactForm(expectedFormModel);

		expect(mockHttpClient.post).toBeCalledWith(testConfig.ApiUri + '/Contact/Send', expectedFormModel);
	});
});
