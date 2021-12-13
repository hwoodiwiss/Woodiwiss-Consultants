import { Component, Inject, OnInit } from '@angular/core';
import { AppImage } from '../app-images';
import { ImageService } from '../services/image.service';

@Component({
	selector: 'wcw-image-gallery',
	templateUrl: './image-gallery-page.component.html',
	styleUrls: ['./image-gallery-page.component.scss'],
})
export class ImageGalleryPage implements OnInit {
	constructor(public imageService: ImageService) {}

	ngOnInit(): void {}
}
