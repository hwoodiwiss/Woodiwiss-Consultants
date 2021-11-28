import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';
import { User } from 'src/app/services/user.model';
import { EditorStyle } from './editor-style';

@Component({
	selector: 'wcw-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
	@Input() editorId: string;
	@Input() editorStyle: EditorStyle;
	@Input() inline: boolean;

	@Input() content: string;
	@Output() contentChange = new EventEmitter<string>();
	canEdit = false;

	constructor(private accountService: AccountService) {}
	ngOnInit(): void {
		this.accountService.user.subscribe({
			next: this.isLoggedIn.bind(this),
		});
	}

	isLoggedIn(user?: User) {
		if (user) {
			this.canEdit = true;
		}
	}

	dataChanged() {
		this.contentChange.emit(this.content);
	}
}
