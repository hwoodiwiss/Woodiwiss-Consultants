import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { of } from 'rxjs';
import { UsersApiService } from 'src/app/services/api/usersApi.service';
import { NewUserFormModel } from 'src/app/services/api/UsersApiModels';
import { User } from 'src/app/services/user.model';

import { AddUserFormComponent } from './add-user-form.component';

describe('AddUserFormComponent', () => {
	let component: AddUserFormComponent;
	let fixture: ComponentFixture<AddUserFormComponent>;
	let mockRecaptchaService: ReCaptchaV3Service;
	let mockUserService: UsersApiService;

	let testUser: User;

	beforeEach(async () => {
		jest.resetAllMocks();
		await TestBed.configureTestingModule({
			declarations: [AddUserFormComponent],
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
						add: jest.fn().mockReturnValue(of('')),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddUserFormComponent);
		component = fixture.componentInstance;

		mockRecaptchaService = TestBed.inject(ReCaptchaV3Service);
		mockUserService = TestBed.inject(UsersApiService);

		testUser = {
			Id: 77512,
			FirstName: 'fname',
			LastName: 'lname',
			Email: 'email',
		};

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('submitData should set model ', () => {
		const testToken = 'token';

		const expectEmail = 'test@email.com';
		const expectFName = 'test';
		const expectLName = 'test';
		const expectPass = 'pass';

		component.formGroup.get('Email').setValue(expectEmail);
		component.formGroup.get('Firstname').setValue(expectFName);
		component.formGroup.get('Lastname').setValue(expectLName);
		component.formGroup.get('Password').setValue(expectPass);

		const expectFormModel: NewUserFormModel = {
			email: expectEmail,
			firstName: expectFName,
			lastName: expectLName,
			password: expectPass,
			recaptchaToken: testToken,
		};

		component.submitData(testToken);
		expect(mockUserService.add).toBeCalledWith(expectFormModel);
	});

	it('onSubmitError sets error to true', () => {
		component.error = false;
		component.onSubmitError('');
		expect(component.error).toBe(true);
	});

	it('onSubmitSuccess calls emit on onComplete', () => {
		component.loading = true;
		const spyEmit = jest.spyOn(component.onUserAdded, 'emit');
		component.onSubmitSuccess(testUser);
		expect(component.loading).toBeFalsy();
		expect(component.error).toBeFalsy();
		expect(spyEmit).toBeCalledWith(null);
	});
});
