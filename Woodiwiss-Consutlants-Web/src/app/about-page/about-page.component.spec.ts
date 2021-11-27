import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared/shared-testing.module';

import { AboutPageComponent } from './about-page.component';

describe('AboutPageComponent', () => {
	let component: AboutPageComponent;
	let fixture: ComponentFixture<AboutPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AboutPageComponent],
			imports: [SharedTestingModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AboutPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
