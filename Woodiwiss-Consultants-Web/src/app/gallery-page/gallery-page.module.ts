import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryPageComponent } from './gallery-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [GalleryPageComponent],
	imports: [CommonModule, SharedModule],
})
export class GalleryPageModule {}
