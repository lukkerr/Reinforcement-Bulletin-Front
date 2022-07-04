import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursaComponent } from './cursa.component';

describe('CursaComponent', () => {
  let component: CursaComponent;
  let fixture: ComponentFixture<CursaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CursaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CursaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
