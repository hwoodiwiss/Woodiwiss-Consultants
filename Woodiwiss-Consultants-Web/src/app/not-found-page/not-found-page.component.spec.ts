import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { NotFoundPageComponent } from './not-found-page.component';

describe('NotFoundComponent', () => {
	let component: NotFoundPageComponent;
	let fixture: ComponentFixture<NotFoundPageComponent>;
	let router: Router;
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NotFoundPageComponent],
			imports: [
				RouterTestingModule.withRoutes([
					{
						path: '**',
						component: NotFoundPageComponent,
					},
				]),
			],
		}).compileComponents();
	});

	beforeEach(() => {
		router = TestBed.inject(Router);
		fixture = TestBed.createComponent(NotFoundPageComponent);
		component = fixture.componentInstance;
		router.initialNavigation();
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should output the current url', async () => {
		const expectedPath = 'TestPath';
		const expectedUrl = `/${expectedPath}`;
		await router.navigate([expectedUrl]);
		fixture.detectChanges();
		if (fixture.nativeElement instanceof Element) {
			expect(fixture.nativeElement.innerHTML).toContain(expectedPath);
		} else {
			fail('Did not correctly create an HTML Element');
		}
	});
});
