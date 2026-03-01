import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddPolypackPage } from './add-polypack.page';

describe('AddPolypackPage', () => {
  let component: AddPolypackPage;
  let fixture: ComponentFixture<AddPolypackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPolypackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
