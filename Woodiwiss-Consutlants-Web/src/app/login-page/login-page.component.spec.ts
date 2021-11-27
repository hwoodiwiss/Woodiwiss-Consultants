import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminPageComponent } from '../admin-page/admin-page.component';
import { AccountService } from '../services/account.service';
import { LoginFormModule } from '../shared/login-form/login-form.module';

import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
	let component: LoginPageComponent;
	let fixture: ComponentFixture<LoginPageComponent>;
	let router: Router;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LoginPageComponent],
			imports: [
				RouterTestingModule.withRoutes([
					{
						path: 'Admin',
						component: AdminPageComponent,
					},
				]),
				LoginFormModule,
			],
			providers: [
				{
					provide: AccountService,
					useValue: {},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		router = TestBed.inject(Router);
		router.initialNavigation();
		fixture = TestBed.createComponent(LoginPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('onLogin should navigate to admin', () => {
		const navigateSpy = jest.spyOn(router, 'navigate');
		component.onLogin();

		expect(navigateSpy).toBeCalledWith(['/Admin']);
	});
});
