import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateUserFormComponent } from './update-user-form.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';

@NgModule({
	declarations: [UpdateUserFormComponent],
	imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule, RecaptchaV3Module, HttpClientModule],
	providers: [{ provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaPublic }],
	exports: [UpdateUserFormComponent],
})
export class UpdateUserFormModule {}
