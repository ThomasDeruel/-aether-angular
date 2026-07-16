import { Component, computed, effect, inject, input, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { CheckoutService } from '../services/checkout';
import { ProductsService } from '../services/products';
import { Benefitcard } from './__components/benefitCard/benefitcard';

@Component({
  selector: 'app-product',
  imports: [Benefitcard, MatIconModule, MatButtonModule, MatGridListModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnDestroy {
  readonly id = input<string | null>();
  private readonly productService = inject(ProductsService);
  private readonly checkoutService = inject(CheckoutService);

  readonly product = this.productService.product;

  constructor() {
    effect(() => {
      this.productService.selectProduct(this.id() ?? null);
    });
  }

  ngOnDestroy() {
    this.productService.selectProduct(null);
  }

  img = computed(() => this.product.value());

  addToCart() {
    if (!this.product.hasValue()) return;

    this.checkoutService.addToCart(this.product.value()).subscribe({
      next: () => {
        const product = this.product.value();
        if (product && product.stock > 0) {
          this.product.value.set({ ...product, stock: product.stock - 1 });
        }
      },
      error: (err) => {
        console.log('UNE ERREUR EST SURVENUE: ', err);
      },
    });
  }
}
