import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelcheckMasterPage } from './panelcheck-master.page';

describe('PanelcheckMasterPage', () => {
  let component: PanelcheckMasterPage;
  let fixture: ComponentFixture<PanelcheckMasterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelcheckMasterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
