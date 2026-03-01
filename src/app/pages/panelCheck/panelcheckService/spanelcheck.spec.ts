import { TestBed } from '@angular/core/testing';

import { Spanelcheck } from './spanelcheck';

describe('Spanelcheck', () => {
  let service: Spanelcheck;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Spanelcheck);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
