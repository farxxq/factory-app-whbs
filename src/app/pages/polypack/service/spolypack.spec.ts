import { TestBed } from '@angular/core/testing';

import { Spolypack } from './spolypack';

describe('Spolypack', () => {
  let service: Spolypack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Spolypack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
