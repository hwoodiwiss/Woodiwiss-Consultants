import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { User } from 'src/app/services/user.model';

import { UpdateUserComponent } from './update-user.component';

describe('UpdateUserComponent', () => {
	let component: UpdateUserComponent;
	let fixture: ComponentFixture<UpdateUserComponent>;

	let testUser: User = {
		Id: 77512,
		FirstName: 'fname',
		LastName: 'lname',
		Email: 'email',
	};

	const mockDefaultNavigation = {
		extras: {
			state: {
				User: testUser,
			},
		},
	};

	let mockRouter: Router;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UpdateUserComponent],
			providers: [
				{
					provide: Router,
					useValue: {
						getCurrentNavigation: jest.fn().mockReturnValue(mockDefaultNavigation),
						navigate: jest.fn(),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UpdateUserComponent);
		component = fixture.componentInstance;

		mockRouter = TestBed.inject(Router);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('getUserFromRouter should safely get the user from the current navigation', () => {
		(mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce(null);
		expect(component.getUserFromRouter(mockRouter)).toBe(undefined);

		(mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({ rofl: {} });
		expect(component.getUserFromRouter(mockRouter)).toBe(undefined);

		(mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({ extras: {} });
		expect(component.getUserFromRouter(mockRouter)).toBe(undefined);

		(mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({ extras: { state: {} } });
		expect(component.getUserFromRouter(mockRouter)).toBe(undefined);

		(mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({ extras: { state: { User: {} } } });
		expect(component.getUserFromRouter(mockRouter)).toBe(undefined);

		(mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({ extras: { state: { User: { blah: 'things' } } } });
		expect(component.getUserFromRouter(mockRouter)).toBe(undefined);

		expect(component.getUserFromRouter(mockRouter)).toBe(testUser);
	});

	it('ctor will navigate away if created without a valid user', () => {
		(mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce(null);
		component = new UpdateUserComponent(mockRouter);
		expect(mockRouter.navigate).toBeCalled();
	});

	it('onComplete should navigate', () => {
		component.onComplete();
		expect(mockRouter.navigate).toBeCalled();
	});

	it('onCancel should navigate', () => {
		component.onCancel();
		expect(mockRouter.navigate).toBeCalled();
	});
});
