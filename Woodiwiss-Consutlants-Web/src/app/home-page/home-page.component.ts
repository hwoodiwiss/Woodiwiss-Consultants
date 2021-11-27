import { Component, Inject, OnInit } from '@angular/core';
import { AppImage, APP_IMAGES } from '../app-images';

@Component({
	selector: 'wcw-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
	constructor(@Inject(APP_IMAGES) public images: AppImage[]) {}

	ngOnInit(): void {}
}
