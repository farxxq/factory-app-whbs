import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartonpackingRecheckPage } from './cartonpacking-recheck.page';

describe('CartonpackingRecheckPage', () => {
  let component: CartonpackingRecheckPage;
  let fixture: ComponentFixture<CartonpackingRecheckPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CartonpackingRecheckPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
