import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactFormModule } from '../shared/contact-form/contact-form.module';
import { SharedTestingModule } from '../shared/shared-testing.module';

import { ContactPageComponent } from './contact-page.component';

describe('ContactPageComponent', () => {
	let component: ContactPageComponent;
	let fixture: ComponentFixture<ContactPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ContactPageComponent],
			imports: [ContactFormModule, SharedTestingModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ContactPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
