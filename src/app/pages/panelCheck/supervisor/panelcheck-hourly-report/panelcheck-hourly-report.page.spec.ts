import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelcheckHourlyReportPage } from './panelcheck-hourly-report.page';

describe('PanelcheckHourlyReportPage', () => {
  let component: PanelcheckHourlyReportPage;
  let fixture: ComponentFixture<PanelcheckHourlyReportPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelcheckHourlyReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
