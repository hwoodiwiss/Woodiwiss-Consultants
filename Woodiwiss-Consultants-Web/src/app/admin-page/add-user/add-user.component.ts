import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'wcw-add-user',
	templateUrl: './add-user.component.html',
	styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent {
	constructor(private router: Router) {}

	public onUserAdded() {
		this.router.navigate(['Admin/Users']);
	}

	public onCancel() {
		this.router.navigate(['Admin/Users']);
	}
}
