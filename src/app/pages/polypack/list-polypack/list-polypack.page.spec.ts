import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListPolypackPage } from './list-polypack.page';

describe('ListPolypackPage', () => {
  let component: ListPolypackPage;
  let fixture: ComponentFixture<ListPolypackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPolypackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
