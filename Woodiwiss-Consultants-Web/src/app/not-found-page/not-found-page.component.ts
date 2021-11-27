import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'wcw-not-found-page',
	templateUrl: './not-found-page.component.html',
	styleUrls: ['./not-found-page.component.scss'],
})
export class NotFoundPageComponent implements OnInit {
	constructor(public router: Router) {}

	ngOnInit(): void {}
}
