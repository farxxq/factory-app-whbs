import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelcheckReplacePcsPage } from './panelcheck-replace-pcs.page';

describe('PanelcheckReplacePcsPage', () => {
  let component: PanelcheckReplacePcsPage;
  let fixture: ComponentFixture<PanelcheckReplacePcsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelcheckReplacePcsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
