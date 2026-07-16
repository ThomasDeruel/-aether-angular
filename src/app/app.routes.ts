import { inject } from '@angular/core';
import { Route } from '@angular/router';
import { HomeComponent } from '../app/home/home.component';
import { Checkout } from './services/checkout';

export const routes: Route[] = [
  { path: '', component: HomeComponent },
  {
    path: 'products/:id',
    loadComponent: () => import('./product/product.component').then((c) => c.ProductComponent),
  },
  {
    path: 'product/:id',
    redirectTo: 'products/:id',
    pathMatch: 'full',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout').then((c) => c.Checkout),
    canActivate: [() => inject(Checkout).canActivate()],
  },
];
