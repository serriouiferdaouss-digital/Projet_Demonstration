import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should store token on login success', () => {
    service.loginSuccess('abc123');
    expect(localStorage.getItem('token')).toBe('abc123');
  });

  it('should clear token on logout', () => {
    localStorage.setItem('token', 'abc123');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should return true for isLoggedIn if token exists', () => {
    expect(service.isLoggedIn()).toBe(false);

    localStorage.setItem('token', 'abc123');
    expect(service.isLoggedIn()).toBe(true);
  });
});