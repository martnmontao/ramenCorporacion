import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitarMesaPage } from './solicitar-mesa.page';

describe('SolicitarMesaPage', () => {
  let component: SolicitarMesaPage;
  let fixture: ComponentFixture<SolicitarMesaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitarMesaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
