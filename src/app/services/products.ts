import { httpResource } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Product } from './products.model';

const PRODUCTS_API_BASE = 'http://localhost:3010';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  readonly category = signal('');
  readonly selectedProductId = signal<string | null>(null);

  private readonly productsUrl = computed(
    () => `${PRODUCTS_API_BASE}/products?category=${this.category()}`,
  );

  private readonly productUrl = computed<string | undefined>(() =>
    this.selectedProductId()
      ? `${PRODUCTS_API_BASE}/products/${this.selectedProductId()}`
      : undefined,
  );

  private readonly productsResource = httpResource<Product[]>(() => this.productsUrl());
  private readonly productResource = httpResource<Product>(() => this.productUrl());

  readonly products = computed<Product[]>(() => {
    const current = this.productsResource.value();
    return Array.isArray(current) ? current : [];
  });

  readonly product = this.productResource;

  readonly isLoading = computed(
    () => this.productsResource.isLoading() && this.productsResource.value() === undefined,
  );

  readonly productIsLoading = computed(
    () => this.productResource.isLoading() && this.productResource.value() === undefined,
  );

  selectCategory(category: string | null): void {
    this.category.set(category ?? '');
  }

  selectProduct(productId: string | null): void {
    this.selectedProductId.set(productId);
  }

  reloadProducts(): void {
    this.productsResource.reload();
  }

  reloadProduct(): void {
    this.productResource.reload();
  }

  invalidate(): void {
    this.reloadProducts();
  }

  toggleFavorite(productId: number): void {
    const currentProducts = this.productsResource.value();
    if (!Array.isArray(currentProducts)) {
      return;
    }

    this.productsResource.value.set(
      currentProducts.map((product) =>
        product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product,
      ),
    );

    const selectedProduct = this.productResource.value();
    if (selectedProduct?.id === productId) {
      this.productResource.value.set({
        ...selectedProduct,
        isFavorite: !selectedProduct.isFavorite,
      });
    }
  }
}
