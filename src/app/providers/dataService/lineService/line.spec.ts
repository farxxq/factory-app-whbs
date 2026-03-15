import { TestBed } from '@angular/core/testing';

import { Line } from './line';

describe('Line', () => {
  let service: Line;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Line);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
