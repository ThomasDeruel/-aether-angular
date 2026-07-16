import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout';
import { Product } from '../services/products.model';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    CurrencyPipe,
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  readonly id = input();
  readonly drawer = input<MatSidenav>();
  private readonly checkoutService = inject(CheckoutService);

  readonly nbArticles = computed(() => this.checkoutService.cart.value()?.length ?? 0);
  readonly data = this.checkoutService.cart;

  readonly uniqueProducts = computed(() => {
    const seen = new Set<number>();

    return (this.data.value() ?? []).filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    });
  });

  readonly totalPrice = this.checkoutService.totalPrice;
  readonly totalPriceWithTva = this.checkoutService.totalPriceWithTva;
  readonly tvaOnly = this.checkoutService.tvaOnly;

  currentPrice(product: Product): number {
    return this.nbProducts(product) * product.price;
  }

  removeProduct(product: Product): void {
    this.checkoutService.removeProductsById(product.id.toString()).subscribe({
      error: (error) => {
        console.error('Unable to remove the product from the cart.', error);
      },
    });
  }

  nbProducts(product: Product): number {
    return this.data.value()?.filter((item) => item.id === product.id).length ?? 0;
  }
}
