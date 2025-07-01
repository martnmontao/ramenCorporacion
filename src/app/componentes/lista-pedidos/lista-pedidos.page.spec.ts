import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaPedidosPage } from './lista-pedidos.page';

describe('ListaPedidosPage', () => {
  let component: ListaPedidosPage;
  let fixture: ComponentFixture<ListaPedidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaPedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
