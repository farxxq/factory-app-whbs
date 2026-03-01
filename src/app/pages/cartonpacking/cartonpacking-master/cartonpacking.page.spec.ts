import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartonpackingPage } from './cartonpacking.page';

describe('CartonpackingPage', () => {
  let component: CartonpackingPage;
  let fixture: ComponentFixture<CartonpackingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CartonpackingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
