import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ProductsComponent } from './products';

describe('ProductsComponent UI', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let component: ProductsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        TranslateModule.forRoot(),
        ProductsComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});