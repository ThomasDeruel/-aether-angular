import { Component, computed, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { Checkout } from '../services/checkout';
import { Products } from '../services/products';
import { Benefitcard } from './__components/benefitCard/benefitcard';

@Component({
  selector: 'app-product',
  imports: [Benefitcard, MatIconModule, MatButtonModule, MatGridListModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnDestroy {
  readonly id = input<string>();
  private readonly productService = inject(Products);
  private readonly checkoutService = inject(Checkout);

  readonly product = this.productService.product;

  private readonly selectProduct = this.productService.selectedProduct;

  constructor() {
    effect(() => {
      this.productService.productId.set(this.id());
      console.log(this.id());
    });
  }

  ngOnDestroy() {
    this.productService.productId.set(undefined);
  }

  currentResource = signal(this.product);

  img = computed(() => this.selectProduct() ?? this.product.value());

  addToChart() {
    if (!this.product.hasValue()) return;

    this.checkoutService.addProduct(this.product.value()).subscribe({
      next: () => {
        const product = this.product.value();
        if (product && product.stock > 0) {
          this.product.set({ ...product, stock: product?.stock - 1 });
        }
      },
      error: (err) => {
        console.log('UNE ERREUR EST SURVENUE: ', err);
      },
    });
  }
}
