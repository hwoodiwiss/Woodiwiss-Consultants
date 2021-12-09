export interface AppImage {
	description: string;
	image_sizes: { [key: string]: AppImageSize };
}

interface AppImageSize {
	uri: string;
	width: number;
	height: number;
}
