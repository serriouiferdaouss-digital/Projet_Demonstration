import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpHeaders } from '@angular/common/http';

import { routes } from './app.routes';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const http = httpLink.create({
        uri: 'http://127.0.0.1:8000/graphql',
      });

      const auth = new ApolloLink((operation, forward) => {
        const token = localStorage.getItem('token');

        operation.setContext(({ headers }: { headers?: HttpHeaders }) => {
          let newHeaders = headers ?? new HttpHeaders();
          if (token) {
            newHeaders = newHeaders.set('Authorization', `Bearer ${token}`);
          }
          return { headers: newHeaders };
        });

        return forward(operation);
      });

      return {
        link: auth.concat(http),
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
