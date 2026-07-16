import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, firstValueFrom, tap } from 'rxjs';
import { Products } from './products';
import { type Product } from './products.model';

@Injectable({
  providedIn: 'root',
})
export class Checkout {
  private readonly router = inject(Router); // ✅ injection context valide
  private readonly http = inject(HttpClient);
  private readonly productsService = inject(Products);
  private readonly data = httpResource<Product[]>(() => 'http://localhost:3010/cart');

  readonly chart = this.data.asReadonly();

  addProduct(product: Product) {
    return this.http
      .post<Product>('http://localhost:3010/cart', { product: product })
      .pipe(tap(() => this.invalidate()));
  }

  async canActivate() {
    // "Transforme le signal status en flux observable,
    // ignore-le tant qu'il n'est pas dans un état final (resolved ou error),
    // et mets en pause le guard jusqu'à ce que ce moment arrive."
    await firstValueFrom(
      toObservable(this.data.value).pipe(filter((products) => products !== undefined)),
    );

    const validate = (this.data.value()?.length ?? 0) > 0;
    console.log(this.data);
    if (validate) {
      return true;
    }
    console.log('HA');
    return this.router.createUrlTree(['/']); // Angular gère la redirection proprement
  }

  invalidate() {
    this.data.reload();
  }

  totalPrice = computed(
    () =>
      (this.data.value() ?? []).reduce((accumulator, product) => accumulator + product.price, 0) ??
      0,
  );

  totalPriceWithTva = computed(() => this.totalPrice() * 1.2);

  tvaOnly = computed(() => this.totalPrice() * 0.2);

  removeProductsById(productId: string) {
    return this.http.delete(`http://localhost:3010/cart/${productId}`).pipe(
      tap(() => {
        this.invalidate();
        this.productsService.product?.reload();
      }),
    );
  }

  validateCheckout() {
    return this.http.post('http://localhost:3010/checkout', {}).pipe(
      tap(() => {
        this.invalidate();
        this.productsService.invalidate();
      }),
    );
  }
}
