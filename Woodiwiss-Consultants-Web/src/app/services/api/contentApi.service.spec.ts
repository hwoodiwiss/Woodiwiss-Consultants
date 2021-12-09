import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AppConfig, APP_CONFIG } from 'src/app/app.config';
import { ContentApiService } from './contentApi.service';

describe('ContentApiService tests', () => {
	const testConfig: AppConfig = {
		CmsApiUri: 'http://localhost:8000',
		ImageApiUri: '',
	};

	const mockHttpClient = {
		post: jest.fn(),
		get: jest.fn(),
	};
	let service: ContentApiService;

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
		service = TestBed.inject(ContentApiService);
	});

	it('should create', () => {
		expect(service).toBeTruthy();
	});

	it('update should post to the content update endpoint with the provided data as an object', () => {
		const expectedId = 'id';
		const expectedContent = 'content';
		const recaptchaToken = 'rt';

		const expectModel = {
			id: expectedId,
			content: expectedContent,
			recaptchaToken,
		};
		service.update(expectedId, expectedContent, recaptchaToken);
		expect(mockHttpClient.post).toBeCalledWith(`${testConfig.CmsApiUri}/Content/Update`, expectModel);
	});

	it('get should get from the content get endpoint', () => {
		const expectedId = 'id';
		service.get(expectedId);
		expect(mockHttpClient.get).toBeCalledWith(`${testConfig.CmsApiUri}/Content/Get?id=${expectedId}`);
	});
});
