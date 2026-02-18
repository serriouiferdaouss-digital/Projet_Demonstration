import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

import { LoginComponent } from './pages/login/login';
import { ProductsComponent } from './pages/products/products';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  // Public route (no toolbar)
  { path: 'login', component: LoginComponent },

  // Protected routes (with toolbar + sidenav)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'products', component: ProductsComponent },
      { path: '', pathMatch: 'full', redirectTo: 'products' },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];
