import { InjectionToken } from '@angular/core';

export type AppImage = [string, string, string];

export const APP_IMAGES = new InjectionToken<AppImage[]>('app.images', {
	providedIn: 'root',
	factory: (): AppImage[] => {
		return [['/assets/images/placeholder.png', 'A Placeholder', 'Placeholder']];
	},
});
