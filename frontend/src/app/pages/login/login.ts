import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { Router } from '@angular/router';

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
  imports: [CommonModule, ReactiveFormsModule],
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
    // 1) reset message
    this.errorMsg = '';

    // 2) mark touched pour afficher validation si vide
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) return;

    // 3) IMPORTANT: enlever token avant tentative
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
            this.errorMsg = 'Token non reçu';
            alert(this.errorMsg);
            return;
          }

          localStorage.setItem('token', token);

          // ✅ Option sécurité: vider password après succès (tu peux commenter si tu veux)
          this.form.patchValue({ password: '' });

          // redirect US-8.1
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

          if (gqlMsg.includes('Invalid credentials')) {
            this.errorMsg = 'Invalid credentials';
          } else {
            this.errorMsg = 'Server unreachable';
          }

          this.form.patchValue({ password: '' });
        }

      });
  }
}
