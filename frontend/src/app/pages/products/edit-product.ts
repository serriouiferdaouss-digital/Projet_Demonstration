import { Component, OnInit, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProductsService, Product } from './products.service';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressBarModule,
    TranslateModule,
  ],
  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.scss'],
})
export class EditProductComponent implements OnInit {
  loading = false;
  id = 0;

  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private productsService: ProductsService,
    private snack: MatSnackBar,
    private translate: TranslateService, 
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id') || 0);

    if (!this.id) {
      this.snack.open(this.translate.instant('SNACK.PRODUCT_NOT_FOUND'), 'OK', {
        duration: 3000,
      });
      this.router.navigate(['/products']);
      return;
    }

    this.loadProduct();
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  private setLoading(v: boolean) {
    this.zone.run(() => {
      this.loading = v;
      this.cdr.detectChanges();
    });
  }

  loadProduct() {
    this.setLoading(true);

    this.productsService
      .getProductById(this.id)
      .pipe(
        catchError((err) => {
          const msg = (err?.message || '').toLowerCase();

          if (msg.includes('unauthorized') || msg.includes('invalid token')) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
            return of(null);
          }

          if (msg.includes('not found')) {
            this.snack.open(this.translate.instant('SNACK.PRODUCT_NOT_FOUND'), 'OK', {
              duration: 3000,
            });
            this.router.navigate(['/products']);
            return of(null);
          }

          this.snack.open(this.translate.instant('SNACK.UPDATE_FAILED'), 'OK', {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => this.setLoading(false))
      )
      .subscribe((p: Product | null) => {
        if (!p) return;

        this.zone.run(() => {
          this.form.patchValue({
            name: p.name ?? '',
            description: p.description ?? '',
            price: p.price ?? 0,
            quantity: p.quantity ?? 0,
          });
          this.cdr.detectChanges();
        });
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const input = {
      name: String(this.form.value.name || '').trim(),
      description: this.form.value.description ?? '',
      price: Number(this.form.value.price || 0),
      quantity: Number(this.form.value.quantity || 0),
    };

    this.setLoading(true);

    this.productsService
      .updateProduct(this.id, input)
      .pipe(
        catchError((err) => {
          const msg = (err?.message || '').toLowerCase();

          if (msg.includes('unauthorized') || msg.includes('invalid token')) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
            return of(null);
          }

          if (msg.includes('not found')) {
            this.snack.open(this.translate.instant('SNACK.PRODUCT_NOT_FOUND'), 'OK', {
              duration: 3000,
            });
            return of(null);
          }

          this.snack.open(this.translate.instant('SNACK.UPDATE_FAILED'), 'OK', {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => this.setLoading(false))
      )
      .subscribe((updated) => {
        if (!updated) return;

        this.snack.open(this.translate.instant('SNACK.PRODUCT_UPDATED'), 'OK', {
          duration: 2000,
        });
        this.router.navigate(['/products']);
      });
  }
}