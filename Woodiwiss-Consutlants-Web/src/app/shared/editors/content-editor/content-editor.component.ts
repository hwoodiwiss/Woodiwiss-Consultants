import { Component, Input, OnInit } from '@angular/core';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ContentApiService, ContentModel } from 'src/app/services/api/contentApi.service';
import { CustomButton } from '../editor/editor-interfaces';
import { EditorStyle } from '../editor/editor-style';

@Component({
	selector: 'wcw-content-editor',
	templateUrl: './content-editor.component.html',
	styleUrls: ['./content-editor.component.scss'],
})
export class ContentEditorComponent implements OnInit {
	@Input() id: string;
	@Input() useContainer: boolean = true;
	editorStyle: EditorStyle;
	loadComplete = false;
	editorContent: string = '';

	private saveButton: CustomButton;
	constructor(private recaptcha: ReCaptchaV3Service, private contentApi: ContentApiService) {
		this.saveButton = {
			text: 'Save',
			onAction: this.saveEditor.bind(this),
		};
		this.editorStyle = new EditorStyle();
		this.editorStyle.height = '100%';
		this.editorStyle.contextmenu = 'bold italic | link ';
		this.editorStyle.quickbars_selection_toolbar = 'bold italic | quicklink | alignleft aligncenter alignright | formatselect';
		this.editorStyle.quickbars_insert_toolbar = 'formatselect | quicktable | numlist bullist | hr';
		this.editorStyle.addButton(this.saveButton);
	}

	ngOnInit(): void {
		this.contentApi.get(this.id).subscribe({
			next: this.setContent.bind(this),
			error: this.setContent.bind(this, ''),
		});
	}

	saveEditor() {
		this.recaptcha.execute(`updateContent`).subscribe({
			next: this.updateContent.bind(this),
			error: this.updateError.bind(this),
		});
	}

	setContent(content: ContentModel) {
		this.editorContent = content.Content;
		this.loadComplete = true;
	}

	updateContent(token: string) {
		this.contentApi.update(this.id, this.editorContent, token).subscribe({
			next: this.updateContentSuccess.bind(this),
			error: this.updateError.bind(this),
		});
	}

	updateContentSuccess() {
		alert('Updated!');
	}

	updateError() {
		alert('An error occured updating the editable area!');
	}
}
