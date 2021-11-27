/* istanbul ignore file */

import { Editor } from 'src/assets/scripts/tinymce/tinymce';
import { ButtonInstanceApi, CustomButton, EditorInitOptions, EditorToolsOptions, QuickbarOptions } from './editor-interfaces';

type SetupFn = (editor: Editor) => void;
type ButtonFn = (button: ButtonInstanceApi) => void;

export class EditorStyle implements EditorInitOptions, EditorToolsOptions, QuickbarOptions {
	height: number | string;
	setup: (editor: Editor) => void;
	toolbar: string | boolean;
	contextmenu: string | boolean;
	menubar: string | boolean;
	quickbars_insert_toolbar: string | boolean;
	quickbars_selection_toolbar: string | boolean;
	skin: string | boolean;

	private setupActions: SetupFn[] = [];
	constructor() {
		this.skin = 'oxide-dark';
		this.height = 500;
		this.setup = this.executeSetupActions.bind(this);
		this.toolbar = false;
		this.contextmenu = false;
		this.menubar = false;
		this.quickbars_insert_toolbar = false;
		this.quickbars_selection_toolbar = false;
	}

	private executeSetupActions(editor: Editor) {
		for (const action of this.setupActions) {
			action(editor);
		}
	}

	public addSetupAction(action: SetupFn) {
		this.setupActions.push(action);
	}

	public addButton(button: { text: string; onAction: ButtonFn } | CustomButton) {
		const addButtonFn: SetupFn = (editor: Editor) => {
			editor.ui.registry.addButton(button.text.toLowerCase(), button);
		};
		if (this.toolbar) {
			this.toolbar += `${button.text.toLowerCase()}`;
		} else {
			this.toolbar = button.text.toLowerCase();
		}
		this.setupActions.push(addButtonFn);
	}
}
