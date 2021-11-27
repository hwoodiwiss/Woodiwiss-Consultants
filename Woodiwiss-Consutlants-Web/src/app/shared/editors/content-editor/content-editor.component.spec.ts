import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { of, throwError } from 'rxjs';
import { ContentApiService, ContentModel } from 'src/app/services/api/contentApi.service';

import { ContentEditorComponent } from './content-editor.component';

describe('ContentEditorComponent', () => {
	let component: ContentEditorComponent;
	let fixture: ComponentFixture<ContentEditorComponent>;
	let recaptcha: ReCaptchaV3Service;
	let apiService: ContentApiService;
	window.alert = jest.fn();
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ContentEditorComponent],
			providers: [
				{
					provide: ReCaptchaV3Service,
					useValue: {
						execute: jest.fn().mockReturnValue(of()),
					},
				},
				{
					provide: ContentApiService,
					useValue: {
						get: jest.fn().mockReturnValue(of()),
						update: jest.fn().mockReturnValue(of()),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ContentEditorComponent);
		recaptcha = TestBed.inject(ReCaptchaV3Service);
		apiService = TestBed.inject(ContentApiService);
		component = fixture.componentInstance;
		component.id = 'lol';
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should get data from the content api oninit', () => {
		component.ngOnInit();
		expect(apiService.get).toBeCalledWith(component.id);
	});

	it('setContent should set the content and set loadComplete to true', () => {
		const expectedContent = 'expected';
		const model: ContentModel = {
			Content: expectedContent,
		};
		component.loadComplete = false;
		component.editorContent = 'current';

		component.setContent(model);

		expect(component.loadComplete).toBe(true);
		expect(component.editorContent).toBe(expectedContent);
	});

	it('saveEditor should execute recaptcha to get a token', () => {
		component.saveEditor();
		expect(recaptcha.execute).toBeCalled();
	});

	it('saveEditor should call updateContent if recaptcha is success', () => {
		(recaptcha.execute as jest.Mock).mockReturnValueOnce(of(''));
		const spyUpdate = jest.spyOn(component, 'updateContent');
		component.saveEditor();
		expect(spyUpdate).toBeCalled();
	});

	it('saveEditor should call updateError if recaptcha is error', () => {
		(recaptcha.execute as jest.Mock).mockReturnValueOnce(throwError(''));
		const spyUpdate = jest.spyOn(component, 'updateError');
		component.saveEditor();
		expect(spyUpdate).toBeCalled();
	});

	it('updateContent should call update on the api service with the Id, the content and the passed in token', () => {
		const token = 'token';
		component.updateContent(token);
		expect(apiService.update).toBeCalledWith(component.id, component.editorContent, token);
	});

	it('updateContentSuccess should call windows.alert with message "Updated!"', () => {
		component.updateContentSuccess();
		expect(window.alert).toBeCalledWith('Updated!');
	});

	it('updateError should call windows.alert', () => {
		component.updateContentSuccess();
		expect(window.alert).toBeCalledWith('An error occured updating the editable area!');
	});
});
