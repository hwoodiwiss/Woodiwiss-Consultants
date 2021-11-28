import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { of } from 'rxjs';
import { UsersApiService } from 'src/app/services/api/usersApi.service';
import { DeleteUserFormModel } from 'src/app/services/api/UsersApiModels';
import { User } from 'src/app/services/user.model';

import { DeleteUserFormComponent } from './delete-user-form.component';

describe('DeleteUserFormComponent', () => {
	let component: DeleteUserFormComponent;
	let fixture: ComponentFixture<DeleteUserFormComponent>;

	let mockApiService: UsersApiService;

	let testUser: User;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DeleteUserFormComponent],
			imports: [CommonModule, FormsModule, ReactiveFormsModule],
			providers: [
				{
					provide: ReCaptchaV3Service,
					useValue: {
						execute: jest.fn().mockReturnValue(of('')),
					},
				},
				{
					provide: UsersApiService,
					useValue: {
						delete: jest.fn().mockReturnValue(of('')),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		testUser = {
			Id: 112233,
			FirstName: 'fname',
			LastName: 'lname',
			Email: 'email',
		};

		fixture = TestBed.createComponent(DeleteUserFormComponent);
		component = fixture.componentInstance;

		mockApiService = TestBed.inject(UsersApiService);
		component.user = testUser;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('submitData should set model and pass it to the delete endpoint', () => {
		const testToken = 'token';
		const expectFormModel: DeleteUserFormModel = {
			id: testUser.Id,
			recaptchaToken: testToken,
		};

		component.submitData(testToken);
		expect(mockApiService.delete).toBeCalledWith(expectFormModel);
	});

	it('onSubmitError sets error to true', () => {
		component.error = false;
		component.onSubmitError('');
		expect(component.error).toBe(true);
	});

	it('onSubmitSuccess calls emit on onComplete', () => {
		const spyEmit = jest.spyOn(component.onComplete, 'emit');
		component.onSubmitSuccess('');
		expect(spyEmit).toBeCalledWith(testUser.Id);
	});
});
