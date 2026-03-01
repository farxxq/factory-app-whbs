import { TestBed } from '@angular/core/testing';

import { IonicGuards } from './ionic-guards';

describe('IonicGuards', () => {
  let service: IonicGuards;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IonicGuards);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
