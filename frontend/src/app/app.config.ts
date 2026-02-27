import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  importProvidersFrom,
  Injectable,
} from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, HttpClient, HttpHeaders } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';

import { onError } from '@apollo/client/link/error';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { I18nService } from './i18n.service';

import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}
export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

export function initI18n(i18n: I18nService) {
  return () => i18n.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      MatSnackBarModule
    ),

    {
      provide: APP_INITIALIZER,
      useFactory: initI18n,
      deps: [I18nService],
      multi: true,
    },

    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const router = inject(Router);
      const snackBar = inject(MatSnackBar);

      const http = httpLink.create({
        uri: 'http://127.0.0.1:8000/graphql',
      });

      const auth = new ApolloLink((operation, forward) => {
        const token = localStorage.getItem('token');

        operation.setContext(({ headers }: { headers?: HttpHeaders }) => {
          let newHeaders = headers ?? new HttpHeaders();
          if (token) newHeaders = newHeaders.set('Authorization', `Bearer ${token}`);
          return { headers: newHeaders };
        });

        return forward(operation);
      });

     
      const errorLink = onError((err) => {
        const graphQLErrors = (err as any)?.graphQLErrors as any[] | undefined;
        const networkError = (err as any)?.networkError;

        if (graphQLErrors?.length) {
          for (const e of graphQLErrors) {
            const code = e?.extensions?.code;

            if (code === 'FORBIDDEN') {
              snackBar.open('Access denied', 'OK', { duration: 3000 });
              return;
            }

            if (code === 'UNAUTHENTICATED') {
              localStorage.removeItem('token');
              snackBar.open('Session expired. Please login again.', 'OK', { duration: 3000 });
              router.navigate(['/login']);
              return;
            }
          }
        }

        if (networkError) {
          snackBar.open('Server unreachable', 'OK', { duration: 3000 });
        }
      });

      return {
        link: ApolloLink.from([errorLink, auth, http]),
        cache: new InMemoryCache(),
        defaultOptions: {
          query: { fetchPolicy: 'no-cache' },
          watchQuery: { fetchPolicy: 'no-cache' },
          mutate: { fetchPolicy: 'no-cache' },
        },
      };
    }),
  ],
};