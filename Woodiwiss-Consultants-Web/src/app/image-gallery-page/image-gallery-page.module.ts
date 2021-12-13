import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGalleryPage } from './image-gallery-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [ImageGalleryPage],
	imports: [CommonModule, SharedModule],
})
export class ImageGalleryPageModule {}
