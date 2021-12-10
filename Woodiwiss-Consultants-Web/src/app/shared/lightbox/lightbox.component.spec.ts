import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppImage } from 'src/app/app-images';

import { LightboxComponent } from './lightbox.component';

const testImages: AppImage[] = [
	{
		description: 'Alt1',
		image_sizes: {
			thumbnail: {
				uri: 'Path1/thumb',
				width: 200,
				height: 200,
			},
			optimal: {
				uri: 'Path1/optimal',
				width: 1920,
				height: 200,
			},
		},
	},
	{
		description: 'Alt2',
		image_sizes: {
			thumbnail: {
				uri: 'Path2/thumb',
				width: 200,
				height: 200,
			},
			optimal: {
				uri: 'Path2/optimal',
				width: 1920,
				height: 200,
			},
		},
	},
	{
		description: 'Alt3',
		image_sizes: {
			thumbnail: {
				uri: 'Path3/thumb',
				width: 200,
				height: 200,
			},
			optimal: {
				uri: 'Path3/optimal',
				width: 1920,
				height: 200,
			},
		},
	},
	{
		description: 'Alt4',
		image_sizes: {
			thumbnail: {
				uri: 'Path4/thumb',
				width: 200,
				height: 200,
			},
			optimal: {
				uri: 'Path4/optimal',
				width: 1920,
				height: 200,
			},
		},
	},
];

describe('LightboxComponent', () => {
	let component: LightboxComponent;
	let fixture: ComponentFixture<LightboxComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LightboxComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LightboxComponent);
		component = fixture.componentInstance;
		component.images = testImages;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('openLightbox should set isOpen to true', () => {
		component.isOpen = false;
		component.openLightbox();
		expect(component.isOpen).toBe(true);
	});

	it('openLightbox should not change slide index when called without params', () => {
		component.isOpen = false;
		component.slideIndex = 3;
		component.openLightbox();
		expect(component.slideIndex).toBe(3);
	});

	it('openLightbox should not change slide index when called with null', () => {
		component.isOpen = false;
		component.slideIndex = 3;
		component.openLightbox(null);
		expect(component.slideIndex).toBe(3);
	});

	it('openLightbox should not change slide index to equal truthy params', () => {
		component.isOpen = false;
		component.slideIndex = 3;
		component.openLightbox(5);
		expect(component.slideIndex).toBe(5);
	});

	it('closeLightbox should set isOpen to false', () => {
		component.isOpen = true;
		component.closeLightbox();
		expect(component.isOpen).toBe(false);
	});

	it('moveSlide should set slideIndex to passed parameter modulo the length of images', () => {
		component.slideIndex = 1;
		component.moveSlide(3);
		expect(component.slideIndex).toBe(3);
		component.moveSlide(4);
		expect(component.slideIndex).toBe(0);
	});

	it('getSlideIndex should return passed parameter modulo the length of images', () => {
		const imagesLength = testImages.length;
		for (const i of [...[...Array(1000).keys()].map((val) => val - 250)]) {
			expect(component.getSlideIndex(i)).toBeGreaterThanOrEqual(0);
			expect(component.getSlideIndex(i)).toBeLessThan(imagesLength);
		}
	});

	it('changeSlide should set slideIndex to slideIndex + parameter modulo length of images', () => {
		component.slideIndex = 2;
		component.changeSlide(1);
		expect(component.slideIndex).toBe(3);

		component.slideIndex = 3;
		component.changeSlide(-1);
		expect(component.slideIndex).toBe(2);

		component.slideIndex = 0;
		component.changeSlide(-1);
		expect(component.slideIndex).toBe(3);
	});
});
