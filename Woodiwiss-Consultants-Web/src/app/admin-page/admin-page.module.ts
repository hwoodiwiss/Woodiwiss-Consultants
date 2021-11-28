import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPageComponent } from './admin-page.component';
import { AppRoutingModule } from '../app-routing.module';
import { UsersComponent } from './users/users.component';
import { AddUserComponent } from './add-user/add-user.component';
import { AddUserFormModule } from '../shared/add-user-form/add-user-form.module';
import { UpdateUserComponent } from './update-user/update-user.component';
import { UpdateUserFormModule } from '../shared/update-user-form/update-user-form.module';
import { DeleteUserFormModule } from '../shared/delete-user-form/delete-user-form.module';

@NgModule({
	declarations: [AdminPageComponent, UsersComponent, AddUserComponent, UpdateUserComponent],
	imports: [CommonModule, AppRoutingModule, AddUserFormModule, UpdateUserFormModule, DeleteUserFormModule],
})
export class AdminPageModule {}
