import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared/shared-testing.module';

import { ImageGalleryPage } from './image-gallery-page.component';

describe('GalleryPageComponent', () => {
	let component: ImageGalleryPage;
	let fixture: ComponentFixture<ImageGalleryPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ImageGalleryPage],
			imports: [SharedTestingModule, HttpClientTestingModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageGalleryPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
