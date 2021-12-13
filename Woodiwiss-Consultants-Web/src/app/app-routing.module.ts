import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutPageComponent } from './about-page/about-page.component';
import { AdminGuardService } from './services/admin-guard.service';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { ImageHostingPage } from './image-hosting/image-hosting.component';
import { HomePageComponent } from './home-page/home-page.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { ServicesPageComponent } from './services-page/services-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { UsersComponent } from './admin-page/users/users.component';
import { AddUserComponent } from './admin-page/add-user/add-user.component';
import { UpdateUserComponent } from './admin-page/update-user/update-user.component';

const routes: Routes = [
	{
		path: '',
		component: HomePageComponent,
	},
	{
		path: 'About',
		component: AboutPageComponent,
	},
	{
		path: 'Services',
		component: ServicesPageComponent,
	},
	{
		path: 'Image Hosting',
		component: ImageHostingPage,
	},
	{
		path: 'Contact',
		component: ContactPageComponent,
	},
	{
		path: 'Login',
		component: LoginPageComponent,
	},
	{
		path: 'Admin',
		component: AdminPageComponent,
		canActivate: [AdminGuardService],
		children: [
			{
				path: '',
				redirectTo: 'Users',
				pathMatch: 'full',
			},
			{
				path: 'Users',
				component: UsersComponent,
			},
			{
				path: 'Add-User',
				component: AddUserComponent,
			},
			{
				path: 'Update-User',
				component: UpdateUserComponent,
			},
		],
	},
	{
		path: '**',
		component: NotFoundPageComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'corrected' })],
	exports: [RouterModule],
	providers: [AdminGuardService],
})
export class AppRoutingModule {}
