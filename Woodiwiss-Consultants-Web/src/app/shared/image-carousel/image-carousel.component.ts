import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AppImage } from 'src/app/app-images';

@Component({
	selector: 'wcw-image-carousel',
	templateUrl: './image-carousel.component.html',
	styleUrls: ['./image-carousel.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCarouselComponent {
	@Input() images: AppImage[];
	currentIndex: number = 0;
	constructor() {}

	getClassForIndex(index: number) {
		if (index == this.currentIndex) return 'current-image';
		if (this.isNext(index)) return 'next-image';
		if (this.isPrev(index)) return 'prev-image';

		return '';
	}

	moveNext() {
		this.currentIndex = this.getNextIndex();
	}
	movePrev() {
		this.currentIndex = this.getPrevIndex();
	}

	isNext(index: number) {
		return index == this.getNextIndex();
	}

	isPrev(index: number) {
		return index == this.getPrevIndex();
	}

	private getNextIndex() {
		const numItems = this.images.length;

		if (this.currentIndex == numItems - 1) {
			return 0;
		} else {
			return this.currentIndex + 1;
		}
	}

	private getPrevIndex() {
		const numItems = this.images.length;
		if (this.currentIndex === 0) {
			return numItems - 1;
		} else {
			return this.currentIndex - 1;
		}
	}
}
