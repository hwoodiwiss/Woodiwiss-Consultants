import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AccountService } from './account.service';

@Injectable({
	providedIn: 'root',
})
export class AdminGuardService implements CanActivate {
	constructor(private router: Router, private accountService: AccountService) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return this.accountService.refresh().pipe(
			map((valid) => {
				return valid;
			})
		);
	}
}
