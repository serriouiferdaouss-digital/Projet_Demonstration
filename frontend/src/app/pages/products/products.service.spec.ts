import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let apollo: Apollo;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductsService,
        {
          provide: Apollo,
          useValue: {
            query: () => of({ data: { products: [] } }),
            mutate: () => of({ data: {} }),
          },
        },
      ],
    });

    service = TestBed.inject(ProductsService);
    apollo = TestBed.inject(Apollo);
  });

  it('should call products query', (done) => {
    const fakeProducts = [
      { id: 1, name: 'P1', description: null, price: 10, quantity: 2, createdAt: null },
    ];

    const querySpy = jest
      .spyOn(apollo, 'query')
      .mockReturnValue(of({ data: { products: fakeProducts } } as any));

    service.getProducts().subscribe((products) => {
      expect(querySpy).toHaveBeenCalled();
      expect(products).toEqual(fakeProducts);
      done();
    });
  });

  it('should call create mutation', (done) => {
    const input = { name: 'New', description: 'Desc', price: 20, quantity: 5 };
    const created = { id: 2, ...input, createdAt: null };

    const mutateSpy = jest
      .spyOn(apollo, 'mutate')
      .mockReturnValue(of({ data: { createProduct: { product: created } } } as any));

    service.createProduct(input).subscribe((product) => {
      expect(mutateSpy).toHaveBeenCalled();
      expect(product).toEqual(created);
      done();
    });
  });

  it('should call update mutation', (done) => {
    const id = 3;
    const input = { name: 'Updated', description: 'D', price: 30, quantity: 1 };
    const updated = { id, ...input };

    const mutateSpy = jest
      .spyOn(apollo, 'mutate')
      .mockReturnValue(of({ data: { updateProduct: { product: updated } } } as any));

    service.updateProduct(id, input).subscribe((product) => {
      expect(mutateSpy).toHaveBeenCalled();
      expect(product).toEqual(updated);
      done();
    });
  });

  it('should call delete mutation', (done) => {
    const id = 4;

    const mutateSpy = jest
      .spyOn(apollo, 'mutate')
      .mockReturnValue(of({ data: { deleteProduct: true } } as any));

    service.deleteProduct(id).subscribe((ok) => {
      expect(mutateSpy).toHaveBeenCalled();
      expect(ok).toBe(true);
      done();
    });
  });
});