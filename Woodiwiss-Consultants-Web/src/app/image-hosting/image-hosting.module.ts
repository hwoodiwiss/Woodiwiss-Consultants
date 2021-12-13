import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageHostingPage } from './image-hosting.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [ImageHostingPage],
	imports: [CommonModule, SharedModule],
})
export class ImageHostingPageModule {}
