import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LineState {
  private lineSource = new BehaviorSubject<string | null>(null);

  line$ = this.lineSource.asObservable();

  setLine(line: string) {
    this.lineSource.next(line);
  }
}
