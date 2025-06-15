import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltaDuenioPage } from './alta-duenio.page';

describe('AltaDuenioPage', () => {
  let component: AltaDuenioPage;
  let fixture: ComponentFixture<AltaDuenioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaDuenioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
