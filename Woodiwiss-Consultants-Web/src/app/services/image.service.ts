import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppImage } from '../app-images';
import { ImageApiService } from './api/imageApi.service';

@Injectable({
	providedIn: 'root',
})
export class ImageService {
	private images: AppImage[] = [];

	constructor(private imageApiService: ImageApiService) {
		this.imageApiService.images().subscribe((images) => {
			this.images = images;
			this.images.forEach((image) => {
				for (let key of Object.keys(image.image_sizes)) {
					image.image_sizes[key].uri = environment.imageApiUri + image.image_sizes[key].uri;
				}
			});
		});
	}

	getImages(): AppImage[] {
		return this.images;
	}

	async addImage(file: File): Promise<AppImage> {
		const image = await this.imageApiService.add_image(new Uint8Array(await file.arrayBuffer())).toPromise();
		return image;
	}
}
