import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolypackMasterPage } from './polypack-master.page';

describe('PolypackMasterPage', () => {
  let component: PolypackMasterPage;
  let fixture: ComponentFixture<PolypackMasterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PolypackMasterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
