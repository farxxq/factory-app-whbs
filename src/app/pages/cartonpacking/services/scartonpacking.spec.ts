import { TestBed } from '@angular/core/testing';

import { Scartonpacking } from './scartonpacking';

describe('Scartonpacking', () => {
  let service: Scartonpacking;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Scartonpacking);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
