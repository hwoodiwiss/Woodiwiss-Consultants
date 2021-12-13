import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageHostingPage } from './image-hosting.component';
import { SharedModule } from '../shared/shared.module';
import { AddImageFormModule } from '../shared/add-image-form/add-image-form.module';

@NgModule({
	declarations: [ImageHostingPage],
	imports: [CommonModule, SharedModule, AddImageFormModule],
})
export class ImageHostingPageModule {}
