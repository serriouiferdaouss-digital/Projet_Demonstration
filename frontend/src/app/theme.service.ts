import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme';
  private readonly _mode$ = new BehaviorSubject<ThemeMode>(this.readInitialMode());

  readonly mode$ = this._mode$.asObservable();

  constructor() {
    this.apply(this._mode$.value);
  }

  get mode(): ThemeMode {
    return this._mode$.value;
  }

  toggle(): void {
    const next: ThemeMode = this._mode$.value === 'dark' ? 'light' : 'dark';
    this.set(next);
  }

  set(mode: ThemeMode): void {
    this._mode$.next(mode);
    localStorage.setItem(this.storageKey, mode);
    this.apply(mode);
  }

  private apply(mode: ThemeMode): void {
    const body = document.body;
    if (mode === 'dark') body.classList.add('dark-theme');
    else body.classList.remove('dark-theme');
  }

  private readInitialMode(): ThemeMode {
    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; 
  }
}