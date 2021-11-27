import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from './login-form.component';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
	declarations: [LoginFormComponent],
	imports: [CommonModule, BrowserModule, FormsModule, ReactiveFormsModule, RecaptchaV3Module],
	providers: [{ provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaPublic }],
	exports: [LoginFormComponent],
})
export class LoginFormModule {}
