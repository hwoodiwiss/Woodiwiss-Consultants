import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '../../app.config';
import { AppImage } from 'src/app/app-images';

@Injectable({
	providedIn: 'root',
})
export class ImageApiService {
	constructor(@Inject(APP_CONFIG) private config: AppConfig, private httpClient: HttpClient) {}

	public images() {
		return this.httpClient.get<AppImage[]>(`${this.config.ImageApiUri}/images`);
	}

	public add_image(binImage: Uint8Array) {
		return this.httpClient.post<AppImage>(`${this.config.ImageApiUri}/image`, binImage);
	}
}
