import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AddUserComponent } from './add-user.component';

describe('AddUserComponent', () => {
	let component: AddUserComponent;
	let fixture: ComponentFixture<AddUserComponent>;
	const mockRouter = {
		navigate: jest.fn(),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddUserComponent],
			imports: [],
			providers: [
				{
					provide: Router,
					useValue: mockRouter,
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		jest.resetAllMocks();
		fixture = TestBed.createComponent(AddUserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should navigate on user added', () => {
		component.onUserAdded();
		expect(mockRouter.navigate).toBeCalledWith(['Admin/Users']);
	});

	it('should navigate on cancel added', () => {
		component.onCancel();
		expect(mockRouter.navigate).toBeCalledWith(['Admin/Users']);
	});
});
