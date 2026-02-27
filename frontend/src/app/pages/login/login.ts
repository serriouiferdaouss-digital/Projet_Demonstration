import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        role
      }
    }
  }
`;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    this.errorMsg = '';

    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) return;

    localStorage.removeItem('token');

    const username = (this.form.value.username || '').trim();
    const password = this.form.value.password || '';

    this.loading = true;

    this.apollo
      .mutate({
        mutation: LOGIN_MUTATION,
        variables: { username, password },
        fetchPolicy: 'no-cache',
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          const token = res?.data?.login?.token;

          if (!token) {
            this.errorMsg = 'LOGIN.TOKEN_NOT_RECEIVED';
            return;
          }

          localStorage.setItem('token', token);
          this.form.patchValue({ password: '' });
          this.router.navigate(['/products']);
        },

        error: (err) => {
          this.loading = false;
          localStorage.removeItem('token');

          const gqlMsg =
            err?.graphQLErrors?.[0]?.message ||
            err?.networkError?.result?.errors?.[0]?.message ||
            err?.message ||
            '';

          if (String(gqlMsg).includes('Invalid credentials')) {
            this.errorMsg = 'LOGIN.INVALID_CREDENTIALS';
          } else {
            this.errorMsg = 'LOGIN.SERVER_UNREACHABLE';
          }

          this.form.patchValue({ password: '' });
        },
      });
  }
}