import { InjectionToken } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface AppConfig {
	CmsApiUri: string;
	ImageApiUri: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
	providedIn: 'root',
	factory: (): AppConfig => {
		return { CmsApiUri: environment.cmsApiUri, ImageApiUri: environment.imageApiUri };
	},
});
