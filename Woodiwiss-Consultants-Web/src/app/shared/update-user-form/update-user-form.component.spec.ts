import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { of } from 'rxjs';
import { UsersApiService } from 'src/app/services/api/usersApi.service';
import { UpdateUserFormModel } from 'src/app/services/api/UsersApiModels';
import { User } from 'src/app/services/user.model';

import { UpdateUserFormComponent } from './update-user-form.component';

describe('UpdateUserFormComponent', () => {
	let component: UpdateUserFormComponent;
	let fixture: ComponentFixture<UpdateUserFormComponent>;
	let mockUsersApi: UsersApiService;

	const testToken = 'testToken';

	let testUser: User;

	let expectFormModel: UpdateUserFormModel;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UpdateUserFormComponent],
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
						update: jest.fn().mockReturnValue(of('')),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UpdateUserFormComponent);
		component = fixture.componentInstance;

		mockUsersApi = TestBed.inject(UsersApiService);

		testUser = {
			Id: 77512,
			FirstName: 'fname',
			LastName: 'lname',
			Email: 'email',
		};

		expectFormModel = {
			id: 77512,
			firstName: 'testUpdated',
			lastName: 'lname',
			email: 'email',
			recaptchaToken: testToken,
			password: null,
		};

		component.user = testUser;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('submitData should call the api with the form data', () => {
		component.formGroup.controls['Firstname'].setValue('testUpdated');
		component.submitData(testToken);
		expect(mockUsersApi.update).toBeCalledWith(expectFormModel);
	});

	it('submitData should set model password to null if form control password is null', () => {
		component.formGroup.controls['Firstname'].setValue('testUpdated');
		component.submitData(testToken);
		expect(mockUsersApi.update).toBeCalledWith(expectFormModel);
	});

	it('submitData should set model password to password value if form control password is not null', () => {
		component.formGroup.controls['Firstname'].setValue('testUpdated');
		component.formGroup.controls['Password'].setValue('roflcopter');
		expectFormModel.password = 'roflcopter';
		component.submitData(testToken);
		expect(mockUsersApi.update).toBeCalledWith(expectFormModel);
	});

	it('onSubmitError should set loading to false and error to true', () => {
		component.loading = true;
		component.error = false;

		component.onSubmitError('');

		expect(component.loading).toBe(false);
		expect(component.error).toBe(true);
	});

	it('onSubmitSuccess should set loading to false and emit a completed event if user is a valid user', () => {
		component.loading = true;
		const spyEmit = jest.spyOn(component.onComplete, 'emit');

		component.onSubmitSuccess(testUser);

		expect(component.loading).toBe(false);
		expect(spyEmit).toBeCalled();
	});

	it('onSubmitSuccess should do nothing if user is not a valid user', () => {
		component.loading = true;
		const spyEmit = jest.spyOn(component.onComplete, 'emit');

		component.onSubmitSuccess('');

		expect(component.loading).toBe(true);
		expect(spyEmit).not.toBeCalled();
	});

	it('disableUserFields returns true if user id is 1', () => {
		testUser.Id = 1;
		expect(component.disableUserFields()).toBe(true);
	});

	it('disableUserFields returns null if user id is not 1', () => {
		expect(component.disableUserFields()).toBe(null);
	});
});
