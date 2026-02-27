import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

import { LoginComponent } from './pages/login/login';
import { ProductsComponent } from './pages/products/products';
import { CreateProductComponent } from './pages/products/create-product';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

import { EditProductComponent } from './pages/products/edit-product';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'products', component: ProductsComponent },
      { path: 'products/new', component: CreateProductComponent },
      { path: 'products/:id/edit', component: EditProductComponent },
      { path: '', pathMatch: 'full', redirectTo: 'products' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];