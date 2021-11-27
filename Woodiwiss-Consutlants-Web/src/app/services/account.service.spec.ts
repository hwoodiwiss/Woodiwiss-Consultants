import { TestBed } from '@angular/core/testing';
import { AccountApiService } from './api/accountApi.service';
import { AccountService } from './account.service';
import { User } from './user.model';
import { of, throwError } from 'rxjs';

describe('AccountService tests', () => {
	let testUser: User;
	const lsUserKey = 'user';
	const mockApiService = {
		login: jest.fn(),
		logout: jest.fn(),
		refresh: jest.fn(),
	};
	let service: AccountService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [
				{
					provide: AccountApiService,
					useValue: mockApiService,
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		testUser = {
			Id: 77512,
			FirstName: 'fname',
			LastName: 'lname',
			Email: 'email',
		};
		service = TestBed.inject(AccountService);
	});

	it('should create', () => {
		expect(service).toBeTruthy();
	});

	it('login should call the login endpoint and pipe the result the user subject and localStorage', (done) => {
		(mockApiService.login as jest.Mock).mockReturnValue(of(testUser));
		service.login({} as any).subscribe({
			next: (user) => {
				expect(user).toBe(testUser);
				let userString = localStorage.getItem(lsUserKey);
				expect(JSON.parse(userString)).toEqual(testUser);
				service.userSubject.subscribe({
					next: (subUser) => {
						expect(subUser).toEqual(testUser);
						done();
					},
				});
			},
		});
	});

	it('refresh should call the verify endpoint and pipe the result into the user subject and localStorage on success', (done) => {
		(mockApiService.refresh as jest.Mock).mockReturnValue(of({ ok: true }));
		localStorage.setItem(lsUserKey, JSON.stringify(testUser));
		service.refresh().subscribe({
			next: (user) => {
				let userString = localStorage.getItem(lsUserKey);
				expect(JSON.parse(userString)).toEqual(testUser);
				service.userSubject.subscribe({
					next: (subUser) => {
						expect(subUser).toEqual(testUser);
						done();
					},
				});
			},
		});
	});

	it('refresh should call the verify endpoint and clear local storage and update the suject with null on error', (done) => {
		(mockApiService.refresh as jest.Mock).mockReturnValue(throwError(''));
		localStorage.setItem(lsUserKey, JSON.stringify(testUser));
		service.refresh().subscribe({
			next: (user) => {
				expect(localStorage.getItem(lsUserKey)).toBe(null);
				service.userSubject.subscribe({
					next: (subUser) => {
						expect(subUser).toBe(null);
						done();
					},
				});
			},
		});
	});

	it('logout should call the logout endpoint and clear local storage and update the suject with null', (done) => {
		(mockApiService.logout as jest.Mock).mockReturnValue(of(null));
		localStorage.setItem(lsUserKey, JSON.stringify(testUser));
		service.logout().subscribe({
			next: () => {
				expect(localStorage.getItem(lsUserKey)).toBe(null);
				service.userSubject.subscribe({
					next: (subUser) => {
						expect(subUser).toBe(null);
						done();
					},
				});
			},
		});
	});
});
