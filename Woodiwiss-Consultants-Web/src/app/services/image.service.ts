import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppImage } from '../app-images';
import { ImageApiService } from './api/imageApi.service';

@Injectable({
	providedIn: 'root',
})
export class ImageService {
	public images: Subject<AppImage[]>;
	private app_images: AppImage[] = [];

	constructor(private imageApiService: ImageApiService) {
		this.images = new Subject<AppImage[]>();
		this.imageApiService.images().subscribe((images) => {
			this.app_images;
			this.images.next(images);
		});
	}

	async addImage(file: File): Promise<AppImage> {
		const image = await this.imageApiService.add_image(new Uint8Array(await file.arrayBuffer())).toPromise();
		return image;
	}
}
