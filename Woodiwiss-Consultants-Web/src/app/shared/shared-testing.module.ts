import { Component, Input, NgModule } from '@angular/core';

@Component({
	selector: 'wcw-editor',
	template: '',
	styles: [''],
})
export class EditorComponent {}

@Component({
	selector: 'wcw-content-editor',
	template: '',
	styles: [''],
})
export class ContentEditorComponent {
	@Input() useContainer: boolean;
}

@Component({
	selector: 'wcw-image-carousel',
	template: '',
	styles: [''],
})
export class ImageCarouselComponent {
	@Input() images: [];
}

@Component({
	selector: 'wcw-lightbox',
	template: '',
	styles: [''],
})
export class LightboxComponent {
	@Input() images: [];
}

@NgModule({
	declarations: [EditorComponent, ContentEditorComponent, ImageCarouselComponent, LightboxComponent],
	imports: [],
	exports: [EditorComponent, ContentEditorComponent, ImageCarouselComponent, LightboxComponent],
})
export class SharedTestingModule {}
