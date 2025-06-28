import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaUsuariosPage } from './lista-usuarios.page';

describe('ListaUsuariosPage', () => {
  let component: ListaUsuariosPage;
  let fixture: ComponentFixture<ListaUsuariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaUsuariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
