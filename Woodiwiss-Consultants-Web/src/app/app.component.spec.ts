import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CanActivate, Router } from '@angular/router';
import { AdminGuardService } from 'src/app/services/admin-guard.service';

import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from './services/account.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;

	let mockAccountService: AccountService;
	let mockRouter: Router;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AppComponent],
			providers: [
				{
					provide: Router,
					useValue: {
						events: {
							pipe: jest.fn().mockReturnValue(of()),
						},
					},
				},
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
		fixture = TestBed.createComponent(AppComponent);

		mockRouter = TestBed.inject(Router);
		mockAccountService = TestBed.inject(AccountService);

		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('ngOnInit should call events.pipe on router', () => {
		component.ngOnInit();
		expect(mockRouter.events.pipe).toBeCalled();
	});

	it('toggleActive should invert active', () => {
		component.active = false;
		component.toggleActive();
		expect(component.active).toBe(true);
	});

	it('getActive should return active if toggleActive is true', () => {
		component.active = true;
		expect(component.getActive()).toBe('active');
	});

	it('getActive should return null if toggleActive is false', () => {
		component.active = false;
		expect(component.getActive()).toBe(null);
	});

	it('onNavigationStart should call refresh on the api service', () => {
		(mockAccountService.refresh as jest.Mock).mockReturnValue(of(''));
		component.onNavigationStart({} as any);
		expect(mockAccountService.refresh).toBeCalled();
	});

	it('onAccountRefresh should set showAdmin to the passed parameter', () => {
		component.showAdmin = false;
		component.onAccountRefresh(true);
		expect(component.showAdmin).toBe(true);

		component.showAdmin = true;
		component.onAccountRefresh(false);
		expect(component.showAdmin).toBe(false);
	});

	it('onAccountRefreshError should set showAdmin to false', () => {
		component.showAdmin = true;
		component.onAccountRefreshError();
		expect(component.showAdmin).toBe(false);
	});
});
