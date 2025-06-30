import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltaMesaPage } from './alta-mesa.page';

describe('AltaMesaPage', () => {
  let component: AltaMesaPage;
  let fixture: ComponentFixture<AltaMesaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaMesaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
