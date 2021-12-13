import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { of } from 'rxjs';
import { ImageService } from 'src/app/services/image.service';
import { User } from 'src/app/services/user.model';
import { FormBaseComponent } from '../form-base/form-base.component';

import { AddImageFormComponent } from './add-image-form.component';

describe('AddImageFormComponent', () => {
	let component: AddImageFormComponent;
	let fixture: ComponentFixture<AddImageFormComponent>;
	let mockRecaptchaService: ReCaptchaV3Service;
	let mockImageService: ImageService;

	let testUser: User;

	beforeEach(async () => {
		jest.resetAllMocks();
		await TestBed.configureTestingModule({
			declarations: [AddImageFormComponent],
			imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
			providers: [
				{
					provide: ReCaptchaV3Service,
					useValue: {
						execute: jest.fn().mockReturnValue(of('')),
					},
				},
				{
					provide: ImageService,
					useValue: {
						addImage: jest.fn().mockReturnValue(Promise.resolve('')),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddImageFormComponent);
		component = fixture.componentInstance;

		mockRecaptchaService = TestBed.inject(ReCaptchaV3Service);
		mockImageService = TestBed.inject(ImageService);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('onFileChanged should not change ImageFile value if there are no files', () => {
		const event = {
			target: {
				files: [],
			},
		};
		const imageFileVal = component.formGroup.get('ImageFile').value;
		component.onFileChanged(event);
		expect(component.formGroup.get('ImageFile').value).toBe(imageFileVal);
	});

	it('onFileChanged should set ImageFile value if there are files', () => {
		const EXPECTED_VAL = new File(['test'], 'test_file.png');
		const event = {
			target: {
				files: [EXPECTED_VAL],
			},
		};
		component.onFileChanged(event);
		expect(component.formGroup.get('ImageFile').value).toBe(EXPECTED_VAL);
	});

	it('setImageValue should set imgSource value to the dataUrl of the file', () => {
		const EXPECTED_VAL = 'test';
		const event = {
			target: {
				result: EXPECTED_VAL,
			},
		};
		component.setImageValue(event as any);
		expect(component.imgSource).toBe(EXPECTED_VAL);
	});

	it('onImageLoadFailed should set imgSource value to null and set invalidImage', () => {
		component.imgSource = 'test_mc_data_boi';
		component.invalidImage = false;
		component.onImageLoadFailed();
		expect(component.imgSource).toBe(null);
		expect(component.invalidImage).toBe(true);
	});

	it('submitData should pass the file', () => {
		const testToken = 'token';

		const expectFile = new File([], 'abc.png', {});

		component.formGroup.get('ImageFile').setValue(expectFile);

		component.submitData(testToken);
		expect(mockImageService.addImage).toBeCalledWith(expectFile);
	});

	it('submitData should call onSubmitError if adding image failed', async () => {
		const testToken = 'token';

		const expectFile = new File([], 'abc.png', {});

		component.formGroup.get('ImageFile').setValue(expectFile);
		(mockImageService.addImage as jest.Mock<any, any>).mockRejectedValueOnce(new Error(''));
		let onErrorSpy = jest.spyOn(component, 'onSubmitError');
		await component.submitData(testToken);
		expect(mockImageService.addImage).toBeCalledWith(expectFile);
		expect(onErrorSpy).toBeCalled();
	});

	it('onSubmitError sets error to true', () => {
		component.error = false;
		component.onSubmitError('');
		expect(component.error).toBe(true);
	});

	it('resetForm should set imgSource value to null and set invalidImage to false', () => {
		component.imgSource = 'test_mc_data_boi';
		component.invalidImage = true;
		component.resetForm();
		expect(component.imgSource).toBe(null);
		expect(component.invalidImage).toBe(false);
	});

	it('resetForm should call parent resetForm', () => {
		let baseResetSpy = jest.spyOn(FormBaseComponent.prototype, 'resetForm');
		component.resetForm();
		expect(baseResetSpy).toBeCalled();
	});
});
