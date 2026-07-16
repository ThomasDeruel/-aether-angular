import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router, UrlTree } from '@angular/router';
import { filter, firstValueFrom, Observable, tap } from 'rxjs';
import { ProductsService } from './products';
import { type Product } from './products.model';

const CART_API_BASE = 'http://localhost:3010';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly productsService = inject(ProductsService);
  private readonly cartUrl = `${CART_API_BASE}/cart`;
  private readonly checkoutUrl = `${CART_API_BASE}/checkout`;
  private readonly cartResource = httpResource<Product[]>(() => this.cartUrl);

  readonly cart = this.cartResource.asReadonly();

  addToCart(product: Product): Observable<Product> {
    return this.http.post<Product>(this.cartUrl, { product }).pipe(tap(() => this.invalidate()));
  }

  async canActivate(): Promise<boolean | UrlTree> {
    await firstValueFrom(
      toObservable(this.cartResource.value).pipe(filter((products) => products !== undefined)),
    );

    if ((this.cartResource.value()?.length ?? 0) > 0) {
      return true;
    }

    return this.router.createUrlTree(['/']);
  }

  invalidate(): void {
    this.cartResource.reload();
  }

  readonly totalPrice = computed(() =>
    (this.cartResource.value() ?? []).reduce((total, product) => total + product.price, 0),
  );

  readonly totalPriceWithTva = computed(() => this.totalPrice() * 1.2);
  readonly tvaOnly = computed(() => this.totalPrice() * 0.2);

  removeFromCart(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.cartUrl}/${productId}`).pipe(
      tap(() => {
        this.invalidate();
        this.productsService.invalidate();
      }),
    );
  }

  submitCheckout(): Observable<void> {
    return this.http.post<void>(this.checkoutUrl, {}).pipe(
      tap(() => {
        this.invalidate();
        this.productsService.invalidate();
      }),
    );
  }
}
