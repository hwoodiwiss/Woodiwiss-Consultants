import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isUser, User } from 'src/app/services/user.model';

@Component({
	selector: 'wcw-update-user',
	templateUrl: './update-user.component.html',
	styleUrls: ['./update-user.component.scss'],
})
export class UpdateUserComponent {
	user?: User;
	constructor(private router: Router) {
		this.user = this.getUserFromRouter(router);
		if (!this.user) {
			this.router.navigate(['Admin/Users']);
		}
	}

	public onComplete() {
		this.router.navigate(['Admin/Users']);
	}

	public onCancel() {
		this.router.navigate(['Admin/Users']);
	}

	public getUserFromRouter(router: Router): User | null {
		let navigation = router.getCurrentNavigation();
		if (navigation) {
			let userObj = navigation.extras?.state?.User;
			if (isUser(userObj)) {
				return userObj;
			}
		}
	}
}
