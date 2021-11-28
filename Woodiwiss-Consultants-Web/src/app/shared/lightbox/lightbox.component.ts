import { Component, Input } from '@angular/core';
import { AppImage } from 'src/app/app-images';

@Component({
	selector: 'wcw-lightbox',
	templateUrl: './lightbox.component.html',
	styleUrls: ['./lightbox.component.scss'],
})
export class LightboxComponent {
	@Input() images: AppImage[];

	isOpen = false;
	slideIndex = 0;
	constructor() {}

	openLightbox(index: number = null) {
		this.isOpen = true;

		if (index !== null) {
			this.slideIndex = index;
		}
	}
	closeLightbox() {
		this.isOpen = false;
	}

	changeSlide(mod: number) {
		this.slideIndex = this.getSlideIndex(this.slideIndex + mod);
	}

	moveSlide(index: number) {
		this.slideIndex = index % this.images.length;
	}

	getSlideIndex(newIndex: number) {
		if (newIndex < 0) {
			return this.images.length - 1;
		}

		return newIndex % this.images.length;
	}
}
