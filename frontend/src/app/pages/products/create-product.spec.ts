import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CreateProductComponent } from './create-product';

describe('CreateProductComponent', () => {
  let fixture: ComponentFixture<CreateProductComponent>;
  let component: CreateProductComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        TranslateModule.forRoot(),
        CreateProductComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});