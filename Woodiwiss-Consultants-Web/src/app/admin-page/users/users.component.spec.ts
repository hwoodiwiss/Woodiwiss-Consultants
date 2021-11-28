import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { UsersApiService } from 'src/app/services/api/usersApi.service';
import { User } from 'src/app/services/user.model';

import { UserListItem, UsersComponent } from './users.component';

describe('UsersComponent', () => {
	let component: UsersComponent;
	let fixture: ComponentFixture<UsersComponent>;
	let mockSubscription = {
		unsubscribe: jest.fn(),
	};
	let mockObservable = {
		subscribe: jest.fn(),
	};
	let mockUsersApi = {
		list: jest.fn(),
	};

	let testUser: User = {
		Id: 77512,
		FirstName: 'fname',
		LastName: 'lname',
		Email: 'email',
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UsersComponent],
			providers: [
				{
					provide: UsersApiService,
					useValue: mockUsersApi,
				},
				{
					provide: AccountService,
					useValue: {
						user: of(testUser),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		jest.resetAllMocks();
		mockUsersApi.list.mockReturnValue(mockObservable);
		mockObservable.subscribe.mockReturnValue(mockSubscription);
		fixture = TestBed.createComponent(UsersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('onInit should call users list', () => {
		expect(component).toBeTruthy();
		expect(mockUsersApi.list).toBeCalled();
		expect(mockObservable.subscribe).toBeCalled();
		expect((component as any).listSubscription).not.toBeNull();
	});

	it('onDestroy should call unsubscribe on listSubscription if not null', () => {
		expect(component).toBeTruthy();
		component.ngOnDestroy();
		expect(mockSubscription.unsubscribe).toBeCalled();
	});

	it('onDestroy should not call unsubscribe on listSubscription if null', () => {
		expect(component).toBeTruthy();
		(component as any).listSubscription = null;
		component.ngOnDestroy();
		expect(mockSubscription.unsubscribe).not.toBeCalled();
	});

	it('setUsersList should set users to passed in array', () => {
		const users: User[] = [
			{ Id: 123, Email: 'Test1', FirstName: 'Testfn', LastName: 'Testln' },
			{ Id: 456, Email: 'Test2', FirstName: 'Testfn', LastName: 'Testln' },
		];

		const expectedUsers = users.map((val) => new UserListItem(val));
		component.setUsersList(users);
		expect(component.users).toEqual(expectedUsers);
	});

	it('openDelete should set DeleteOpen tp true for the passed in user list item', () => {
		let testListItem = new UserListItem({ Id: 123, Email: 'Test1', FirstName: 'Testfn', LastName: 'Testln' });
		component.openDelete(testListItem);
		expect(testListItem.DeleteOpen).toBe(true);
	});

	it('cancelDelete should set DeleteOpen to false for the user with the passed in Id', () => {
		const users: User[] = [
			{ Id: 123, Email: 'Test1', FirstName: 'Testfn', LastName: 'Testln' },
			{ Id: 456, Email: 'Test2', FirstName: 'Testfn', LastName: 'Testln' },
			{ Id: 8324, Email: 'Test2', FirstName: 'Testfn', LastName: 'Testln' },
			{ Id: 234, Email: 'Test2', FirstName: 'Testfn', LastName: 'Testln' },
			{ Id: 532, Email: 'Test2', FirstName: 'Testfn', LastName: 'Testln' },
		];

		const expectedUsers = users.map((val) => {
			let li = new UserListItem(val);
			li.DeleteOpen = true;
			return li;
		});
		component.users = expectedUsers;
		component.cancelDelete(123);
		expectedUsers.forEach((user) => {
			if (user.Id === 123) {
				expect(user.DeleteOpen).toBe(false);
			} else {
				expect(user.DeleteOpen).toBe(true);
			}
		});
	});
	it('completeDelete should filter users to exclude user with the passed in Id', () => {
		const users: User[] = [
			{ Id: 123, Email: 'Test1', FirstName: 'Testfn', LastName: 'Testln' },
			{ Id: 456, Email: 'Test2', FirstName: 'Testfn', LastName: 'Testln' },
			{ Id: 8324, Email: 'Test2', FirstName: 'Testfn', LastName: 'Testln' },
			{ Id: 234, Email: 'Test2', FirstName: 'Testfn', LastName: 'Testln' },
			{ Id: 532, Email: 'Test2', FirstName: 'Testfn', LastName: 'Testln' },
		];

		const expectedUsers = users.map((val) => new UserListItem(val));
		component.users = expectedUsers;
		component.completeDelete(123);
		component.users.forEach((user) => {
			expect(user.Id).not.toBe(123);
		});
	});
});
