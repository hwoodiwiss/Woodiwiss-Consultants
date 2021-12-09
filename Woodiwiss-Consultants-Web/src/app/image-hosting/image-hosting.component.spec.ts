import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared/shared-testing.module';

import { GalleryPageComponent } from './image-hosting.component';

describe('GalleryPageComponent', () => {
	let component: GalleryPageComponent;
	let fixture: ComponentFixture<GalleryPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GalleryPageComponent],
			imports: [SharedTestingModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(GalleryPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
