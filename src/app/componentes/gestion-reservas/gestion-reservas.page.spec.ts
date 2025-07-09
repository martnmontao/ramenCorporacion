import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionReservasPage } from './gestion-reservas.page';

describe('GestionReservasPage', () => {
  let component: GestionReservasPage;
  let fixture: ComponentFixture<GestionReservasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionReservasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
