import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProductsService } from './products.service';

@Component({
  selector: 'app-create-product',
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
  templateUrl: './create-product.html',
  styleUrls: ['./create-product.scss'],
})
export class CreateProductComponent implements OnInit {
  loading = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private snack: MatSnackBar,
    private router: Router,
    private translate: TranslateService // ✅ ajouté
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
    });
  }

  back() {
    this.router.navigate(['/products']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.productsService
      .createProduct(this.form.value)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (p) => {
          if (!p) {
            this.snack.open(this.translate.instant('SNACK.CREATE_FAILED'), 'OK', { duration: 3000 });
            return;
          }

          this.snack.open(this.translate.instant('SNACK.PRODUCT_CREATED'), 'OK', { duration: 3000 });
          this.router.navigate(['/products']);
        },
        error: () => {
          this.snack.open(this.translate.instant('SNACK.CREATE_FAILED'), 'OK', { duration: 3000 });
        },
      });
  }
}