import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { UsersApiService } from 'src/app/services/api/usersApi.service';
import { User } from 'src/app/services/user.model';

export class UserListItem {
	public Id: number;
	public Email: string;
	public FirstName: string;
	public LastName: string;
	public DeleteOpen: boolean = false;
	constructor(user: User) {
		({ Id: this.Id, Email: this.Email, FirstName: this.FirstName, LastName: this.LastName } = user);
	}
}

@Component({
	selector: 'wcw-users',
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
	private listSubscription: Subscription;

	public users: UserListItem[] = [];
	public currentUser: User;
	constructor(public userApi: UsersApiService, public accountService: AccountService) {}

	ngOnInit(): void {
		this.listSubscription = this.userApi.list().subscribe({
			next: this.setUsersList.bind(this),
		});

		this.accountService.user.subscribe({
			next: this.setCurrentUser.bind(this),
		});
	}

	ngOnDestroy(): void {
		if (this.listSubscription) {
			this.listSubscription.unsubscribe();
			this.listSubscription = null;
		}
	}

	setUsersList(users: User[]) {
		for (const user of users) {
			this.users.push(new UserListItem(user));
		}
	}

	setCurrentUser(user: User) {
		this.currentUser = user;
	}

	openDelete(user: UserListItem) {
		user.DeleteOpen = true;
	}

	cancelDelete(id: number) {
		const item = this.users.find((val) => val.Id === id);
		item.DeleteOpen = false;
	}

	completeDelete(id: number) {
		this.users = this.users.filter((val) => val.Id != id);
	}
}
