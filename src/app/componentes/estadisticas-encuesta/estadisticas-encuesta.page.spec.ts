import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadisticasEncuestaPage } from './estadisticas-encuesta.page';

describe('EstadisticasEncuestaPage', () => {
  let component: EstadisticasEncuestaPage;
  let fixture: ComponentFixture<EstadisticasEncuestaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadisticasEncuestaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
