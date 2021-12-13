import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { ContactPageModule } from './contact-page/contact-page.module';
import { AboutPageModule } from './about-page/about-page.module';
import { AdminPageModule } from './admin-page/admin-page.module';
import { HomePageModule } from './home-page/home-page.module';
import { NotFoundModule as NotFoundPageModule } from './not-found-page/not-found-page.module';
import { ServicesPageModule } from './services-page/services-page.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CredentialsInterceptor } from './services/CredentialsInterceptor';
import { LoginPageModule } from './login-page/login-page.module';
import { ImageHostingPageModule } from './image-hosting/image-hosting.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		SharedModule,
		ContactPageModule,
		AboutPageModule,
		AdminPageModule,
		HomePageModule,
		NotFoundPageModule,
		ServicesPageModule,
		LoginPageModule,
		ImageHostingPageModule,
  FontAwesomeModule,
	],
	providers: [{ provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true }],

	bootstrap: [AppComponent],
})
export class AppModule {}
