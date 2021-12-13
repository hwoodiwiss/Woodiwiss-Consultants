import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page.component';
import { SharedModule } from '../shared/shared.module';
import { AddImageFormModule } from '../shared/add-image-form/add-image-form.module';

@NgModule({
	declarations: [HomePageComponent],
	imports: [CommonModule, SharedModule, AddImageFormModule],
})
export class HomePageModule {}
