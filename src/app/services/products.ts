import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Product } from './products.model';

const PRODUCTS_API_BASE = 'http://localhost:3010';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly route = inject(ActivatedRoute);
  readonly productId = signal<string | undefined>(undefined);

  readonly category = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('category') ?? '')),
    { initialValue: '' },
  );

  private readonly productsUrl = computed(
    () => `${PRODUCTS_API_BASE}/products?category=${this.category()}`,
  );

  private readonly productUrl = computed<string | undefined>(() =>
    this.productId() ? `${PRODUCTS_API_BASE}/products/${this.productId()}` : undefined,
  );

  private readonly productsResource = httpResource<Product[]>(() => this.productsUrl());
  readonly product = httpResource<Product>(() => this.productUrl());

  readonly products = computed<Product[]>(() => {
    const current = this.productsResource.value();
    return Array.isArray(current) ? current : [];
  });

  readonly isLoading = computed(
    () => this.productsResource.isLoading() && this.productsResource.value() === undefined,
  );

  invalidate() {
    this.productsResource.reload();
  }
}
