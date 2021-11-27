import { Editor } from 'src/assets/scripts/tinymce/tinymce';

//Editor settings split by the component/plugin to which they are relevant

export interface ButtonInstanceApi {
	isDisabled: () => boolean;
	setDisabled: (state: boolean) => void;
}

export interface CustomButton {
	text: string;
	onAction: (button: ButtonInstanceApi) => void;
}

export interface EditorInitOptions {
	height: number | string;
	setup: (editor: Editor) => void;
	skin: string | boolean;
}

export interface EditorToolsOptions {
	toolbar: string | boolean;
	contextmenu: string | boolean;
	menubar: string | boolean;
}

export interface QuickbarOptions {
	quickbars_insert_toolbar: string | boolean;
	quickbars_selection_toolbar: string | boolean;
}
