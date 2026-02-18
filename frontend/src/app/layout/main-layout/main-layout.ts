import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})
export class MainLayoutComponent {
  // simple state (we keep it basic for US-9.1)
  theme: 'light' | 'dark' = (localStorage.getItem('theme') as any) || 'light';
  lang: 'EN' | 'FR' = (localStorage.getItem('lang') as any) || 'EN';

  constructor(private router: Router) {
    this.applyTheme();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-theme', this.theme === 'dark');
  }

  toggleLanguage() {
    this.lang = this.lang === 'EN' ? 'FR' : 'EN';
    localStorage.setItem('lang', this.lang);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
}
