import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class I18nService {
  constructor(private translate: TranslateService) {}

  init() {
    const ui = (localStorage.getItem('lang') as 'EN' | 'FR') || 'EN';
    const code = ui === 'FR' ? 'fr' : 'en';

    this.translate.setDefaultLang('en');
    this.translate.use(code);
  }

  setUiLang(ui: 'EN' | 'FR') {
    localStorage.setItem('lang', ui);
    const code = ui === 'FR' ? 'fr' : 'en';
    this.translate.use(code);
  }

  getUiLang(): 'EN' | 'FR' {
    return (localStorage.getItem('lang') as 'EN' | 'FR') || 'EN';
  }
}