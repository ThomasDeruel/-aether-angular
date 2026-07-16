import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Benefitcard } from './benefitcard';

describe('Benefitcard', () => {
  let component: Benefitcard;
  let fixture: ComponentFixture<Benefitcard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Benefitcard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Benefitcard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
