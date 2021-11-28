import { TestBed, ComponentFixture } from '@angular/core/testing';
import { EditorModule } from '@tinymce/tinymce-angular';
import { of } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { EditorComponent } from './editor.component';

describe('Editor Component', () => {
	let fixture: ComponentFixture<EditorComponent>;
	let component: EditorComponent;
	let mockAccountService: AccountService;
	beforeEach(async () => {
		TestBed.configureTestingModule({
			declarations: [EditorComponent],
			imports: [EditorModule],
			providers: [
				{
					provide: AccountService,
					useValue: {
						user: {
							subscribe: jest.fn(),
						},
					},
				},
			],
		}).compileComponents();
		fixture = TestBed.createComponent(EditorComponent);

		mockAccountService = TestBed.inject(AccountService);
		component = fixture.componentInstance;
		component.content = '<h1>Lel</h1>';
	});

	it('EditorComponent should construct without failure', () => {
		expect(component).toBeTruthy();
	});

	it('should check if there is a logged in user on init', () => {
		component.ngOnInit();
		expect(mockAccountService.user.subscribe).toBeCalled();
	});

	it('isLoggedIn should set canEdit to true if user is truthy', () => {
		component.isLoggedIn(true as any);
		expect(component.canEdit).toBe(true);
	});

	it('isLoggedIn should set canEdit to false if user is falsey', () => {
		component.isLoggedIn(null);
		expect(component.canEdit).toBe(false);
	});

	it('dataChanged should emit the updated', () => {
		const spyEmit = jest.spyOn(component.contentChange, 'emit');
		component.dataChanged();
		expect(spyEmit).toBeCalledWith(component.content);
	});
});
