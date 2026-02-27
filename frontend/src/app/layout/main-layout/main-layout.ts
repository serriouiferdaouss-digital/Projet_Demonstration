import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../i18n.service';

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
    TranslateModule,
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})
export class MainLayoutComponent {
  theme: 'light' | 'dark' = (localStorage.getItem('theme') as any) || 'light';

  lang: 'EN' | 'FR';

  constructor(private router: Router, private i18n: I18nService) {
    this.lang = this.i18n.getUiLang();
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
    this.i18n.setUiLang(this.lang); 
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
}