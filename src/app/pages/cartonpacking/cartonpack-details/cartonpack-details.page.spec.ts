import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartonpackDetailsPage } from './cartonpack-details.page';

describe('CartonpackDetailsPage', () => {
  let component: CartonpackDetailsPage;
  let fixture: ComponentFixture<CartonpackDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CartonpackDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
