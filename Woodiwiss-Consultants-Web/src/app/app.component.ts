import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AccountService } from './services/account.service';

@Component({
	selector: 'wcw-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	title = 'woodiwiss-consultants-web';

	active = false;
	showAdmin = false;

	imageBase = environment.imageApiUri;

	constructor(public router: Router, public accountService: AccountService) {}

	ngOnInit() {
		this.router.events.pipe(filter((e): e is NavigationStart => e instanceof NavigationStart)).subscribe({
			next: this.onNavigationStart.bind(this),
		});
	}

	getActive = (): string => (this.active ? 'active' : null);

	toggleActive(): void {
		this.active = !this.active;
	}

	onNavigationStart(e: NavigationStart) {
		this.accountService.refresh().subscribe({
			next: this.onAccountRefresh.bind(this),
			error: this.onAccountRefreshError.bind(this),
		});
	}

	onAccountRefresh(isLoggedIn: boolean) {
		this.showAdmin = isLoggedIn;
	}

	onAccountRefreshError() {
		this.showAdmin = false;
	}
}
