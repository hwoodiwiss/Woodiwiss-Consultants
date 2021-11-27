import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AccountService } from './account.service';
import { AdminGuardService } from './admin-guard.service';

describe('AdminGuard', () => {
	let guard: AdminGuardService;
	let accountService: AccountService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [
				{
					provide: AccountService,
					useValue: {
						refresh: jest.fn(),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		guard = TestBed.inject(AdminGuardService);
		accountService = TestBed.inject(AccountService);
	});

	it('should construct', () => {
		expect(guard).toBeTruthy();
	});

	it('should return an observable of the result of accountService refresh - true', (done) => {
		(accountService.refresh as jest.Mock).mockReturnValue(of(true));
		guard.canActivate(null, null).subscribe({
			next: (val) => {
				expect(val).toBe(true);
				done();
			},
		});
	});

	it('should return an observable of the result of accountService refresh - false', (done) => {
		(accountService.refresh as jest.Mock).mockReturnValue(of(false));
		guard.canActivate(null, null).subscribe({
			next: (val) => {
				expect(val).toBe(false);
				done();
			},
		});
	});
});
