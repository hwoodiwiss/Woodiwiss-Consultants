import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared/shared-testing.module';

import { ImageHostingPage } from './image-hosting.component';

describe('GalleryPageComponent', () => {
	let component: ImageHostingPage;
	let fixture: ComponentFixture<ImageHostingPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ImageHostingPage],
			imports: [SharedTestingModule, HttpClientTestingModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageHostingPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
