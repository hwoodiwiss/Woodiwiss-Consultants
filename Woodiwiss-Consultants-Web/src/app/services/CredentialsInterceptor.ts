import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** Inject With Credentials into the request */
@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		// console.log("interceptor: " + req.url);
		if (req.url.startsWith(environment.cmsApiUri)) {
			req = req.clone({
				withCredentials: true,
			});
		}

		return next.handle(req);
	}
}
