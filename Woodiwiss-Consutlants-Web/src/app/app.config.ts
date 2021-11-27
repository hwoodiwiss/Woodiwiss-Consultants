import { InjectionToken } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface AppConfig {
	ApiUri: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
	providedIn: 'root',
	factory: (): AppConfig => {
		return { ApiUri: environment.apiUri };
	},
});
