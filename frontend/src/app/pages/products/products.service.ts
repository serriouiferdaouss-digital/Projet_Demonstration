import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  createdAt?: string | null;
};

const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id
      name
      description
      price
      quantity
      createdAt
    }
  }
`;

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      product {
        id
        name
        description
        price
        quantity
        createdAt
      }
    }
  }
`;

const PRODUCT_BY_ID_QUERY = gql`
  query ProductById($id: Int!) {
    productById(id: $id) {
      id
      name
      description
      price
      quantity
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: Int!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      product {
        id
        name
        description
        price
        quantity
      }
    }
  }
`;

const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`;

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private apollo: Apollo) {}

  getProducts(): Observable<Product[]> {
    return this.apollo
      .query<{ products: Product[] }>({
        query: PRODUCTS_QUERY,
        fetchPolicy: 'no-cache',
      })
      .pipe(map((res) => res.data?.products ?? []));
  }

  createProduct(input: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
  }): Observable<Product | null> {
    return this.apollo
      .mutate<{ createProduct: { product: Product } }>({
        mutation: CREATE_PRODUCT_MUTATION,
        variables: { input },
        fetchPolicy: 'no-cache',
      })
      .pipe(map((res) => res.data?.createProduct?.product ?? null));
  }

  getProductById(id: number): Observable<Product | null> {
    return this.apollo
      .query<{ productById: Product }>({
        query: PRODUCT_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'no-cache',
      })
      .pipe(map((res) => res.data?.productById ?? null));
  }

  updateProduct(
    id: number,
    input: { name: string; description?: string; price: number; quantity: number }
  ): Observable<Product | null> {
    return this.apollo
      .mutate<{ updateProduct: { product: Product } }>({
        mutation: UPDATE_PRODUCT_MUTATION,
        variables: { id, input },
        fetchPolicy: 'no-cache',
      })
      .pipe(map((res) => res.data?.updateProduct?.product ?? null));
  }

  deleteProduct(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteProduct: boolean }>({
        mutation: DELETE_PRODUCT_MUTATION,
        variables: { id },
        fetchPolicy: 'no-cache',
      })
      .pipe(map((res) => !!res.data?.deleteProduct));
  }
}