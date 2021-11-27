import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesPageComponent } from './services-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [ServicesPageComponent],
	imports: [CommonModule, SharedModule],
})
export class ServicesPageModule {}
