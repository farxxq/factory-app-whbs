import { TestBed } from '@angular/core/testing';

import { ReusableService } from './reusable-service';

describe('ReusableService', () => {
  let service: ReusableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReusableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
