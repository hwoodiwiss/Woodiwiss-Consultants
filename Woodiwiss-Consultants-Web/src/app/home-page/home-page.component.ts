import { Component, Inject, OnInit } from '@angular/core';
import { AppImage } from '../app-images';
import { ImageService } from '../services/image.service';

@Component({
	selector: 'wcw-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
	constructor(public imageService: ImageService) {}

	ngOnInit(): void {}
}
