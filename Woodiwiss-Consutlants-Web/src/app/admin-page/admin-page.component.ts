import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../services/account.service';

@Component({
	selector: 'wcw-admin-page',
	templateUrl: './admin-page.component.html',
	styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
	constructor(private router: Router, private accountService: AccountService) {}

	ngOnInit(): void {}

	logout() {
		this.accountService.logout().subscribe({
			next: this.logoutSuccess.bind(this),
		});
	}

	logoutSuccess() {
		this.router.navigate(['']);
	}
}
