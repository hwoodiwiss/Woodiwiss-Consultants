import { Component, Inject, OnInit } from '@angular/core';
import { AppImage } from '../app-images';
import { ImageService } from '../services/image.service';

@Component({
	selector: 'wcw-image-hosting',
	templateUrl: './image-hosting.component.html',
	styleUrls: ['./image-hosting.component.scss'],
})
export class GalleryPageComponent implements OnInit {
	constructor(public imageService: ImageService) {}

	ngOnInit(): void {}
}
