import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryPageComponent } from './image-hosting.component';
import { SharedModule } from '../shared/shared.module';
import { AddImageFormModule } from '../shared/add-image-form/add-image-form.module';

@NgModule({
	declarations: [GalleryPageComponent],
	imports: [CommonModule, SharedModule, AddImageFormModule],
})
export class ImageHostingPageModule {}
