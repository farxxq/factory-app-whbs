import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelcheckAddPcsPage } from './panelcheck-add-pcs.page';

describe('PanelcheckAddPcsPage', () => {
  let component: PanelcheckAddPcsPage;
  let fixture: ComponentFixture<PanelcheckAddPcsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelcheckAddPcsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
