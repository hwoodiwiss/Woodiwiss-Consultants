import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AppConfig, APP_CONFIG } from 'src/app/app.config';
import { UsersApiService } from './usersApi.service';
import { DeleteUserFormModel, NewUserFormModel, UpdateUserFormModel } from './UsersApiModels';

describe('UsersApiService tests', () => {
	const testConfig: AppConfig = {
		ApiUri: 'http://localhost:8000',
	};

	const mockHttpClient = {
		post: jest.fn(),
		get: jest.fn(),
	};
	let service: UsersApiService;

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
		service = TestBed.inject(UsersApiService);
	});

	it('should create', () => {
		expect(service).toBeTruthy();
	});

	it('add should post to the users add endpoint with the provided model', () => {
		const expectModel: NewUserFormModel = {
			email: 'em',
			firstName: 'fn',
			lastName: 'ln',
			password: 'pw',
			recaptchaToken: 'rt',
		};
		service.add(expectModel);
		expect(mockHttpClient.post).toBeCalledWith(`${testConfig.ApiUri}/User/Add`, expectModel);
	});

	it('update should post to the users update endpoint with the provided model', () => {
		const expectModel: UpdateUserFormModel = {
			id: 1,
			email: 'em',
			firstName: 'fn',
			lastName: 'ln',
			password: 'pw',
			recaptchaToken: 'rt',
		};
		service.update(expectModel);
		expect(mockHttpClient.post).toBeCalledWith(`${testConfig.ApiUri}/User/Update`, expectModel);
	});

	it('delete should post to the users delete endpoint with the provided model', () => {
		const expectModel: DeleteUserFormModel = {
			id: 1,
			recaptchaToken: 'rt',
		};
		service.delete(expectModel);
		expect(mockHttpClient.post).toBeCalledWith(`${testConfig.ApiUri}/User/Delete`, expectModel);
	});

	it('list should get from the users list endpoint', () => {
		service.list();
		expect(mockHttpClient.get).toBeCalledWith(`${testConfig.ApiUri}/User/List`);
	});
});
