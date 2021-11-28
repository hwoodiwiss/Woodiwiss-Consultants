import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HomePageComponent } from '../home-page/home-page.component';
import { AccountService } from '../services/account.service';

import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
	let component: AdminPageComponent;
	let fixture: ComponentFixture<AdminPageComponent>;
	let router: Router;
	let accountService: AccountService;

	beforeEach(async () => {
		jest.resetAllMocks();
		await TestBed.configureTestingModule({
			declarations: [AdminPageComponent],
			imports: [
				RouterTestingModule.withRoutes([
					{
						path: '',
						component: HomePageComponent,
					},
				]),
			],
			providers: [
				{
					provide: AccountService,
					useValue: {
						logout: jest.fn(),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AdminPageComponent);
		component = fixture.componentInstance;

		router = TestBed.inject(Router);
		accountService = TestBed.inject(AccountService);

		router.initialNavigation();
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should navigate home on logout success', () => {
		const navSpy = jest.spyOn(router, 'navigate');
		component.logoutSuccess();
		expect(navSpy).toBeCalledWith(['']);
	});

	it('should call logout on the account service when logout is clicked', () => {
		const element = fixture.nativeElement as HTMLElement;
		const buttonElement = element.querySelector('button[name="Logout"]') as HTMLButtonElement;
		buttonElement.click();
		expect(accountService.logout).toBeCalled();
	});
});
