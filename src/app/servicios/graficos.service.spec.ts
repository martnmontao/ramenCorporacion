import { TestBed } from '@angular/core/testing';

import { GraficosService } from './graficos.service';

describe('GraficosService', () => {
  let service: GraficosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraficosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
