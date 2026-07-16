import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  applyWhen,
  disabled,
  email,
  form,
  FormField,
  pattern,
  required,
  schema,
  submit,
  validate,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterLink } from '@angular/router';
import { Checkout as CS } from '../services/checkout';
import { Product } from '../services/products.model';

type PaymentMethod = 'card' | 'livraison';

@Component({
  selector: 'app-checkout',
  imports: [FormField, MatDividerModule, CurrencyPipe, MatButtonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private checkoutService = inject(CS);
  private router = inject(Router);

  readonly data = this.checkoutService.chart;
  readonly submit = signal(false);

  readonly totalPrice = this.checkoutService.totalPrice;
  readonly totalPriceWithTva = this.checkoutService.totalPriceWithTva;
  readonly tvaOnly = this.checkoutService.tvaOnly;
  readonly validateCheckout = () => this.checkoutService.validateCheckout();

  constructor() {
    effect(() => {
      if (this.data.value() !== undefined && this.data.value()!.length === 0 && !this.submit()) {
        this.router.navigate(['/']);
      }
    });
  }
  uniqueProducts = computed(() => {
    const seen = new Set<number>();
    return (this.data.value() ?? []).filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  });
  nbProducts(product: Product) {
    return this.data.value()?.filter((p) => p.id === product.id).length ?? 0;
  }
  currentPrice(product: Product) {
    if (!product.price) return 0;
    return this.nbProducts(product) * product.price;
  }

  // https://angular.dev/guide/forms/signals/validation#pattern

  checkout = signal({
    firstName: 'Unknown',
    lastName: 'Unknown',
    phone: '0123456789',
    email: 'test@gmail.com',
    address: '0 rue de la paix',
    city: 'Unknown',
    zip: '00000',
    country: 'France',
    paymentMethod: 'card' as PaymentMethod,
    cardNumber: '1234567890123456',
    expiration: '01/09',
    cvv: '000',
  }); // ← plus de "}" en trop juste après

  checkoutForm = form(
    this.checkout,
    schema((path) => {
      required(path.firstName);
      required(path.lastName);
      email(path.email, { message: 'Please enter a valid email address' });
      required(path.email, { message: 'Email is required' });
      required(path.address);
      required(path.city);
      pattern(path.zip, /^\d{5}$/, { message: 'Please enter a valid zip code' });

      validate(path.phone, ({ value }) => {
        const cleaned = value().replace(/[\s.-]/g, '');
        const regex = /^(?:\+33|0033|0)[1-9]\d{8}$/;
        return regex.test(cleaned)
          ? null
          : { kind: 'phone', message: 'Please enter a valid phone number' };
      });

      applyWhen(
        path,
        ({ valueOf }) => valueOf(path.paymentMethod) === 'card',
        (cardPath) => {
          required(cardPath.cardNumber, { message: 'Le numéro de carte est requis' });
          pattern(cardPath.cardNumber, /^\d{16}$/, { message: 'Numéro de carte invalide' });
          required(cardPath.expiration, { message: "Date d'expiration requise" });
          pattern(cardPath.expiration, /^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Format MM/AA' });
          required(cardPath.cvv, { message: 'CVC requis' });
          pattern(cardPath.cvv, /^\d{3,4}$/, { message: 'CVC invalide' });
        },
      );

      disabled(path.cardNumber, ({ valueOf }) => valueOf(path.paymentMethod) !== 'card');
      disabled(path.expiration, ({ valueOf }) => valueOf(path.paymentMethod) !== 'card');
      disabled(path.cvv, ({ valueOf }) => valueOf(path.paymentMethod) !== 'card');
    }),
  );

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.checkoutForm, async (f) => {
      this.validateCheckout().subscribe({
        next: () => {
          console.log('Commande validée avec succès !');
          this.submit.set(true);
        },
        error: (err) => {
          console.log('UNE ERREUR EST SURVENUE: ', err);
        },
      });
    });
  }
}
