import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddUserFormComponent } from './add-user-form.component';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
	declarations: [AddUserFormComponent],
	imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule, RecaptchaV3Module, HttpClientModule],
	providers: [{ provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaPublic }],
	exports: [AddUserFormComponent],
})
export class AddUserFormModule {}
