import { Component, Inject, OnInit } from '@angular/core';
import { AppImage, APP_IMAGES } from '../app-images';

@Component({
	selector: 'wcw-gallery-page',
	templateUrl: './gallery-page.component.html',
	styleUrls: ['./gallery-page.component.scss'],
})
export class GalleryPageComponent implements OnInit {
	constructor(@Inject(APP_IMAGES) public images: AppImage[]) {}

	ngOnInit(): void {}
}
