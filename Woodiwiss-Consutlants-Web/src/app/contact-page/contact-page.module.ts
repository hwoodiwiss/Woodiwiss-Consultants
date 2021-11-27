import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactPageComponent } from './contact-page.component';
import { ContactFormModule } from '../shared/contact-form/contact-form.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [ContactPageComponent],
	imports: [CommonModule, ContactFormModule, SharedModule],
})
export class ContactPageModule {}
