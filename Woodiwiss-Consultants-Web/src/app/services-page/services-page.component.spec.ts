import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared/shared-testing.module';

import { ServicesPageComponent } from './services-page.component';

describe('ServicesPageComponent', () => {
	let component: ServicesPageComponent;
	let fixture: ComponentFixture<ServicesPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ServicesPageComponent],
			imports: [SharedTestingModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ServicesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
