import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BadgeComponent } from '../badge/badge.component';
import { ProductsService } from '../services/products';

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgOptimizedImage,
    MatChipsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    BadgeComponent,
    RouterLink,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  readonly products = this.productsService.products;
  readonly isLoading = this.productsService.isLoading;
  readonly category = this.productsService.category;

  readonly queryCategory = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('category') ?? '')),
    { initialValue: '' },
  );

  constructor() {
    effect(() => {
      this.productsService.selectCategory(this.queryCategory());
    });
  }

  readonly categories = signal<Category[]>([
    { id: '1', name: 'audio' },
    { id: '2', name: 'wearable' },
    { id: '3', name: 'accessory' },
  ]);

  readonly selectedCategories = signal<string[]>([]);

  readonly filteredProducts = computed(() => {
    const selected = this.selectedCategories();
    const prods = this.products();

    if (selected.length === 0) {
      return prods;
    }

    return prods.filter((product) =>
      selected.some((selectedCategory) => product.categories.includes(selectedCategory)),
    );
  });

  onCategoryChange(event: MatChipListboxChange): void {
    this.router.navigate([], {
      queryParams: { category: event.value },
      queryParamsHandling: 'merge',
    });
  }

  toggleFavorite(productId: number): void {
    this.productsService.toggleFavorite(productId);
  }
}
