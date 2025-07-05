import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JuegosVistaPage } from './juegos-vista.page';

describe('JuegosVistaPage', () => {
  let component: JuegosVistaPage;
  let fixture: ComponentFixture<JuegosVistaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JuegosVistaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
