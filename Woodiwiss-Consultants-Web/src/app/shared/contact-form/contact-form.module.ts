import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from './contact-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
	declarations: [ContactFormComponent],
	imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule, RecaptchaV3Module, HttpClientModule],
	providers: [{ provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaPublic }],
	exports: [ContactFormComponent],
})
export class ContactFormModule {}
