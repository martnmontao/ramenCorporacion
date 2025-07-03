import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncuestaEmpleadoPage } from './encuesta-empleado.page';

describe('EncuestaEmpleadoPage', () => {
  let component: EncuestaEmpleadoPage;
  let fixture: ComponentFixture<EncuestaEmpleadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EncuestaEmpleadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
