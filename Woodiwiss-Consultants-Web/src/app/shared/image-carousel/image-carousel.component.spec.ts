import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppImage } from 'src/app/app-images';

import { ImageCarouselComponent } from './image-carousel.component';

const testImages: AppImage[] = [
	['Path1', 'Alt1', ''],
	['Path2', 'Alt2', ''],
	['Path3', 'Alt3', ''],
	['Path4', 'Alt4', ''],
];

describe('ImageCarouselComponent', () => {
	let component: ImageCarouselComponent;
	let fixture: ComponentFixture<ImageCarouselComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ImageCarouselComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageCarouselComponent);
		component = fixture.componentInstance;
		component.images = testImages;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('moveNext should update the current index to the next index when moveNext is called', () => {
		component.currentIndex = 2;
		component.moveNext();
		expect(component.currentIndex).toBe(3);
	});

	it('movePrev should update the current index to the previous index', () => {
		component.currentIndex = 3;
		component.movePrev();
		expect(component.currentIndex).toBe(2);
	});

	it('moveNext should update rotate back to 0 if the current index is at the end of the list', () => {
		component.currentIndex = 3;
		component.moveNext();
		expect(component.currentIndex).toBe(0);
	});

	it('movePrev should update rotate forward to the end of the list if the current index is 0', () => {
		component.currentIndex = 0;
		component.movePrev();
		expect(component.currentIndex).toBe(3);
	});

	it('isNext should return true if provided index is the next index', () => {
		component.currentIndex = 2;
		expect(component.isNext(3)).toBe(true);
	});

	it('isNext should return false if provided index is not the next index', () => {
		component.currentIndex = 1;
		expect(component.isNext(3)).toBe(false);
	});

	it('isPrev should return true if provided index is the previous index', () => {
		component.currentIndex = 3;
		expect(component.isPrev(2)).toBe(true);
	});

	it('isPrev should return false if provided index is not the previous index', () => {
		component.currentIndex = 3;
		expect(component.isPrev(1)).toBe(false);
	});

	it('getClassForIndex should return current-image if index is the current index', () => {
		component.currentIndex = 1;
		const actual = component.getClassForIndex(1);
		expect(actual).toBe('current-image');
	});

	it('getClassForIndex should return prev-image if index is the previous index', () => {
		component.currentIndex = 1;
		const actual = component.getClassForIndex(0);
		expect(actual).toBe('prev-image');
	});

	it('getClassForIndex should return next-image if index is the current index', () => {
		component.currentIndex = 1;
		const actual = component.getClassForIndex(2);
		expect(actual).toBe('next-image');
	});
});
