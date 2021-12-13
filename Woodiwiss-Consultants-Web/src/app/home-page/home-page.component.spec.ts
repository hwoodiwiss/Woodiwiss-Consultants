import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddImageFormModule } from '../shared/add-image-form/add-image-form.module';
import { SharedTestingModule } from '../shared/shared-testing.module';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
	let component: HomePageComponent;
	let fixture: ComponentFixture<HomePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [HomePageComponent],
			imports: [SharedTestingModule, HttpClientTestingModule, AddImageFormModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(HomePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
