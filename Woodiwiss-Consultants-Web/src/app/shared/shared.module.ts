import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editors/editor/editor.component';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentEditorComponent } from './editors/content-editor/content-editor.component';
import { ImageCarouselComponent } from './image-carousel/image-carousel.component';
import { LightboxComponent } from './lightbox/lightbox.component';

@NgModule({
	declarations: [EditorComponent, ContentEditorComponent, ImageCarouselComponent, LightboxComponent],
	imports: [CommonModule, EditorModule, RouterModule, FormsModule],
	providers: [
		{
			provide: TINYMCE_SCRIPT_SRC,
			useValue: 'assets/scripts/tinymce/tinymce.min.js',
		},
	],
	exports: [EditorComponent, ContentEditorComponent, ImageCarouselComponent, LightboxComponent],
})
export class SharedModule {}
