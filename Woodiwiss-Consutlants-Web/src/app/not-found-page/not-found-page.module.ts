import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundPageComponent } from './not-found-page.component';
import { RouterModule } from '@angular/router';

@NgModule({
	declarations: [NotFoundPageComponent],
	imports: [CommonModule, RouterModule],
})
export class NotFoundModule {}
