import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Product } from './products.model';

@Injectable({
  providedIn: 'root',
})
export class Products {
  private readonly route = inject(ActivatedRoute);
  readonly selectedProduct = signal<Product | null>(null);
  readonly productId = signal<string | undefined>(undefined);

  readonly category = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('category') ?? '')),
    { initialValue: '' },
  );

  private readonly _data = httpResource<Product[]>(
    () => `http://localhost:3010/products?category=${this.category()}`,
  );

  readonly product = httpResource<Product>(() =>
    this.productId() ? `http://localhost:3010/products/${this.productId()}` : undefined,
  );

  readonly products = computed<Product[]>(() => {
    const current = this._data.value();
    return Array.isArray(current) ? current : [];
  });

  readonly isLoading = computed(() => this._data.isLoading() && this._data.value() === undefined);

  invalidate() {
    this._data.reload();
  }

  getProduct(id: string | undefined) {
    return id ? httpResource<Product>(() => `http://localhost:3010/products/${id}`) : undefined;
  }

  readonly reload = () => this._data.reload();
}
