import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AccountLoginModel } from './accountLogin.model';
import { AccountApiService } from './api/accountApi.service';
import { User } from './user.model';

@Injectable({
	providedIn: 'root',
})
export class AccountService {
	private lsUserKey = 'user';

	public userSubject: BehaviorSubject<User>;
	public user: Observable<User>;

	constructor(private api: AccountApiService) {
		this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(this.lsUserKey)));
		this.user = this.userSubject.asObservable();
	}

	public login(model: AccountLoginModel) {
		return this.api.login(model).pipe(
			map((user) => {
				localStorage.setItem(this.lsUserKey, JSON.stringify(user));
				this.userSubject.next(user);
				return user;
			})
		);
	}

	public refresh(): Observable<boolean> {
		return this.api.refresh().pipe(
			map((response) => {
				const user = JSON.parse(localStorage.getItem(this.lsUserKey));
				this.userSubject.next(user);
				return true;
			}),
			catchError((error) => {
				localStorage.removeItem(this.lsUserKey);
				this.userSubject.next(null);
				return of(false);
			})
		);
	}

	public logout() {
		return this.api.logout().pipe(
			map(() => {
				localStorage.removeItem(this.lsUserKey);
				this.userSubject.next(null);
			})
		);
	}
}
