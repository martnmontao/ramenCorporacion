import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Juego20Page } from './juego20.page';

describe('Juego20Page', () => {
  let component: Juego20Page;
  let fixture: ComponentFixture<Juego20Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Juego20Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
