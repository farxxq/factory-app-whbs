import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoMapPolypackPage } from './po-map-polypack.page';

describe('PoMapPolypackPage', () => {
  let component: PoMapPolypackPage;
  let fixture: ComponentFixture<PoMapPolypackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PoMapPolypackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
