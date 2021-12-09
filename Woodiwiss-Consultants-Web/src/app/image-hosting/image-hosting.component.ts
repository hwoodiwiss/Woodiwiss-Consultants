import { Component, Inject, OnInit } from '@angular/core';
import { AppImage, APP_IMAGES } from '../app-images';

@Component({
	selector: 'wcw-image-hosting',
	templateUrl: './image-hosting.component.html',
	styleUrls: ['./image-hosting.component.scss'],
})
export class GalleryPageComponent implements OnInit {
	constructor(@Inject(APP_IMAGES) public images: AppImage[]) {}

	ngOnInit(): void {}
}
