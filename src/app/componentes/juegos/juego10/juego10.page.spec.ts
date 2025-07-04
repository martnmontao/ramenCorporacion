import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Juego10Page } from './juego10.page';

describe('Juego10Page', () => {
  let component: Juego10Page;
  let fixture: ComponentFixture<Juego10Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Juego10Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
