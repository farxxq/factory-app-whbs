import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapPolypackPage } from './map-polypack.page';

describe('MapPolypackPage', () => {
  let component: MapPolypackPage;
  let fixture: ComponentFixture<MapPolypackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MapPolypackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
