import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { catchError, finalize, of, filter } from 'rxjs';

import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductsService, Product } from './products.service';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatButtonModule,
    MatDialogModule,
    TranslateModule,
  ],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class ProductsComponent implements OnInit {
  loading = false;
  products: Product[] = [];
  displayedColumns = ['name', 'price', 'quantity', 'actions'];

  private destroyRef = inject(DestroyRef);

  constructor(
    private productsService: ProductsService,
    private snack: MatSnackBar,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private translate: TranslateService 
  ) {}

  ngOnInit() {
    this.fetchProducts();

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.router.url.startsWith('/products')) {
          this.fetchProducts();
        }
      });
  }

  goCreate() {
    this.router.navigate(['/products/new']);
  }

  goEdit(id: number) {
    this.router.navigate(['/products', id, 'edit']);
  }

  fetchProducts() {
    this.zone.run(() => {
      this.loading = true;
      this.cdr.detectChanges();
    });

    this.productsService
      .getProducts()
      .pipe(
        catchError((err) => {
          const msg = (err?.message || '').toLowerCase();

          if (msg.includes('unauthorized') || msg.includes('invalid token')) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
            return of([] as Product[]);
          }

          this.snack.open(this.translate.instant('SNACK.LOAD_PRODUCTS_FAIL'), 'OK', {
            duration: 3000,
          });
          return of([] as Product[]);
        }),
        finalize(() => {
          this.zone.run(() => {
            this.loading = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe((list: Product[]) => {
        this.zone.run(() => {
          this.products = list;
          this.cdr.detectChanges();
        });
      });
  }

  delete(p: Product) {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { name: p.name },
    });

    ref.afterClosed()
      .pipe(
        filter((confirmed: boolean) => confirmed === true)
      )
      .subscribe(() => {
        this.zone.run(() => {
          this.loading = true;
          this.cdr.detectChanges();
        });

        this.productsService
          .deleteProduct(p.id)
          .pipe(
            catchError((err) => {
              const msg = (err?.message || '').toLowerCase();

              if (msg.includes('forbidden')) {
                this.snack.open(this.translate.instant('SNACK.FORBIDDEN_DELETE'), 'OK', {
                  duration: 3000,
                });
                return of(false);
              }

              if (msg.includes('unauthorized') || msg.includes('invalid token')) {
                localStorage.removeItem('token');
                this.router.navigate(['/login']);
                return of(false);
              }

              this.snack.open(this.translate.instant('SNACK.DELETE_FAILED'), 'OK', {
                duration: 3000,
              });
              return of(false);
            }),
            finalize(() => {
              this.zone.run(() => {
                this.loading = false;
                this.cdr.detectChanges();
              });
            })
          )
          .subscribe((ok: boolean) => {
            if (!ok) return;

            this.snack.open(this.translate.instant('SNACK.PRODUCT_DELETED'), 'OK', {
              duration: 2000,
            });
            this.fetchProducts();
          });
      });
  }
}