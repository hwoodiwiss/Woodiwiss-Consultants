import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AppConfig, APP_CONFIG } from 'src/app/app.config';
import { AccountLoginModel } from '../accountLogin.model';
import { AccountApiService } from './accountApi.service';

describe('AccountApiService tests', () => {
	const testConfig: AppConfig = {
		CmsApiUri: 'http://localhost:8000',
		ImageApiUri: '',
	};

	const mockHttpClient = {
		post: jest.fn(),
	};
	let service: AccountApiService;

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
		service = TestBed.inject(AccountApiService);
	});

	it('should create', () => {
		expect(service).toBeTruthy();
	});

	it('login should post to the account login endpoint with the provided model', () => {
		const expectModel: AccountLoginModel = {
			email: 'em',
			password: 'pw',
			recaptchaToken: 'rt',
		};
		service.login(expectModel);
		expect(mockHttpClient.post).toBeCalledWith(`${testConfig.CmsApiUri}/Account/Login`, expectModel);
	});

	it('logout should post to the account logout endpoint with no body', () => {
		service.logout();
		expect(mockHttpClient.post).toBeCalledWith(`${testConfig.CmsApiUri}/Account/Logout`, null);
	});

	it('refresh should post to the account refresh endpoint with no body, and retrieve the direct http response', () => {
		service.refresh();
		expect(mockHttpClient.post).toBeCalledWith(`${testConfig.CmsApiUri}/Account/Refresh`, null, { observe: 'response' });
	});
});
