import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AppConfig, APP_CONFIG } from 'src/app/app.config';
import { AccountLoginModel } from '../accountLogin.model';
import { AccountApiService } from './accountApi.service';

describe('AccountApiService tests', () => {
	const testConfig: AppConfig = {
		CmsApiUri: '',
		ImageApiUri: 'http://localhost:8000',
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
});
