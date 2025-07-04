import { TestBed } from '@angular/core/testing';

import { NotificacionesServiceService } from './notificaciones-service.service';

describe('NotificacionesServiceService', () => {
  let service: NotificacionesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacionesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
