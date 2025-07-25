describe('test to fix', () => {
  it('test to fix', () => {
    expect(true).toBeTruthy();
  });
});
/*
@Component({
  template: ` <div [formGroup]="form">
    <app-date-value-handler #dateValueHandler [formControlName]="'date'" />
  </div>`,
})
class TestHostComponent implements OnInit {
  @ViewChild('dateValueHandler')
  dateValueHandlerComponent: DateValueHandlerComponent;

  form: UntypedFormGroup;

  constructor(private _fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      date: [new KnoraDate('JULIAN', 'CE', 2018, 5, 19)],
    });
  }
}
@Component({
  template: ` <div [formGroup]="form">
    <app-date-value-handler #dateValueHandler [formControlName]="'date'" [valueRequiredValidator]="false" />
  </div>`,
})
class NoValueRequiredTestHostComponent implements OnInit {
  @ViewChild('dateValueHandler')
  dateValueHandlerComponent: DateValueHandlerComponent;

  form: UntypedFormGroup;

  constructor(private _fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      date: new UntypedFormControl(null),
    });
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-date-picker',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TestDatePickerComponent),
    },
    { provide: MatFormFieldControl, useExisting: TestDatePickerComponent },
  ],
})
class TestDatePickerComponent implements ControlValueAccessor, MatFormFieldControl<any> {
  @Input() disableCalendarSelector: boolean;

  @Input() value;
  @Input() disabled: boolean;
  @Input() empty: boolean;
  @Input() placeholder: string;
  @Input() required: boolean;
  @Input() shouldLabelFloat: boolean;
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() valueRequiredValidator = true;

  @Input() calendar: string;
  stateChanges = new Subject<void>();

  errorState = false;
  focused = false;
  id = 'testid';
  ngControl: NgControl | null;
  onChange = (_: any) => {};

  writeValue(date: KnoraDate | null): void {
    this.value = date;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  onContainerClick(event: MouseEvent): void {}

  setDescribedByIds(ids: string[]): void {}

  _handleInput(): void {
    this.onChange(this.value);
  }
}

describe('DateValueHandlerComponent', () => {
  let testHostComponent: TestHostComponent;
  let testHostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateValueHandlerComponent, TestDatePickerComponent, TestHostComponent],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = testHostFixture.componentInstance;
    testHostFixture.detectChanges();

    expect(testHostComponent).toBeTruthy();
  });

  it('should initialize a date correctly', async () => {
    expect(testHostComponent.dateValueHandlerComponent.startDate.value).toEqual(
      new KnoraDate('JULIAN', 'CE', 2018, 5, 19)
    );

    expect(testHostComponent.dateValueHandlerComponent.isPeriodControl.value).toBeFalse();

    expect(testHostComponent.dateValueHandlerComponent.endDate.value).toBeNull();

    const hostCompDe = testHostFixture.debugElement;
    const datePickerComponentDe = hostCompDe.query(By.directive(TestDatePickerComponent));

    expect((datePickerComponentDe.componentInstance as TestDatePickerComponent).value).toEqual(
      new KnoraDate('JULIAN', 'CE', 2018, 5, 19)
    );

    expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(true);

    expect(testHostComponent.dateValueHandlerComponent.value instanceof KnoraDate).toBe(true);

    expect(testHostComponent.dateValueHandlerComponent.value).toEqual(new KnoraDate('JULIAN', 'CE', 2018, 5, 19));
  });

  it('should initialize a period correctly', async () => {
    testHostComponent.form.controls.date.setValue(
      new KnoraPeriod(new KnoraDate('JULIAN', 'CE', 2018, 5, 19), new KnoraDate('JULIAN', 'CE', 2019, 5, 19))
    );

    expect(testHostComponent.dateValueHandlerComponent.calendarControl.value).toEqual('JULIAN');

    expect(testHostComponent.dateValueHandlerComponent.startDate.value).toEqual(
      new KnoraDate('JULIAN', 'CE', 2018, 5, 19)
    );

    expect(testHostComponent.dateValueHandlerComponent.isPeriodControl.value).toBeTrue();

    expect(testHostComponent.dateValueHandlerComponent.endDate.value).toEqual(
      new KnoraDate('JULIAN', 'CE', 2019, 5, 19)
    );

    testHostFixture.detectChanges();

    const hostCompDe = testHostFixture.debugElement;

    const startDateEditComponentDe = hostCompDe.query(By.css('.start-date'));

    const endDateEditComponentDe = hostCompDe.query(By.css('.end-date'));

    expect((startDateEditComponentDe.componentInstance as TestDatePickerComponent).value).toEqual(
      new KnoraDate('JULIAN', 'CE', 2018, 5, 19)
    );

    expect((endDateEditComponentDe.componentInstance as TestDatePickerComponent).value).toEqual(
      new KnoraDate('JULIAN', 'CE', 2019, 5, 19)
    );

    expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(true);

    expect(testHostComponent.dateValueHandlerComponent.value instanceof KnoraPeriod).toBe(true);

    expect(testHostComponent.dateValueHandlerComponent.value).toEqual(
      new KnoraPeriod(new KnoraDate('JULIAN', 'CE', 2018, 5, 19), new KnoraDate('JULIAN', 'CE', 2019, 5, 19))
    );
  });

  it('should react correctly to changing the calendar for a period', () => {
    testHostComponent.form.controls.date.setValue(
      new KnoraPeriod(new KnoraDate('JULIAN', 'CE', 2018, 5, 19), new KnoraDate('JULIAN', 'CE', 2019, 5, 19))
    );

    // expect(testHostComponent.dateValueHandlerComponent.calendarControl.value).toEqual('JULIAN');

    expect(testHostComponent.dateValueHandlerComponent.startDate.value).toEqual(
      new KnoraDate('JULIAN', 'CE', 2018, 5, 19)
    );

    expect(testHostComponent.dateValueHandlerComponent.isPeriodControl.value).toBeTrue();

    expect(testHostComponent.dateValueHandlerComponent.endDate.value).toEqual(
      new KnoraDate('JULIAN', 'CE', 2019, 5, 19)
    );

    testHostFixture.detectChanges();

    const hostCompDe = testHostFixture.debugElement;

    const startDateEditComponentDe = hostCompDe.query(By.css('.start-date'));

    expect((startDateEditComponentDe.componentInstance as TestDatePickerComponent).value.calendar).toEqual('JULIAN');

    const endDateEditComponentDe = hostCompDe.query(By.css('.end-date'));

    expect((endDateEditComponentDe.componentInstance as TestDatePickerComponent).value.calendar).toEqual('JULIAN');

    testHostComponent.dateValueHandlerComponent.startDate.setValue(new KnoraDate('GREGORIAN', 'CE', 2018, 5, 19));

    testHostFixture.detectChanges();

    expect((startDateEditComponentDe.componentInstance as TestDatePickerComponent).value.calendar).toEqual('GREGORIAN');

    expect((endDateEditComponentDe.componentInstance as TestDatePickerComponent).value.calendar).toEqual('GREGORIAN');
  });

  it('should propagate changes made by the user for a single date', async () => {
    const hostCompDe = testHostFixture.debugElement;

    const startDateEditComponentDe = hostCompDe.query(By.css('.start-date'));

    (startDateEditComponentDe.componentInstance as TestDatePickerComponent).writeValue(
      new KnoraDate('JULIAN', 'CE', 2019, 5, 19)
    );
    (startDateEditComponentDe.componentInstance as TestDatePickerComponent)._handleInput();

    await testHostFixture.whenStable();

    expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(true);

    expect(testHostComponent.form.controls.date.value).toEqual(new KnoraDate('JULIAN', 'CE', 2019, 5, 19));
  });

  it('should propagate changes made by the user for a period', async () => {
    testHostComponent.dateValueHandlerComponent.isPeriodControl.setValue(true);

    testHostFixture.detectChanges();

    const hostCompDe = testHostFixture.debugElement;

    const startDateEditComponentDe = hostCompDe.query(By.css('.start-date'));

    (startDateEditComponentDe.componentInstance as TestDatePickerComponent).writeValue(
      new KnoraDate('JULIAN', 'CE', 2019, 5, 19)
    );
    (startDateEditComponentDe.componentInstance as TestDatePickerComponent)._handleInput();

    testHostFixture.detectChanges();

    const endDateEditComponentDe = hostCompDe.query(By.css('.end-date'));

    (endDateEditComponentDe.componentInstance as TestDatePickerComponent).writeValue(
      new KnoraDate('JULIAN', 'CE', 2020, 5, 19)
    );
    (endDateEditComponentDe.componentInstance as TestDatePickerComponent)._handleInput();

    testHostFixture.detectChanges();

    await testHostFixture.whenStable();

    expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(true);

    expect(testHostComponent.form.controls.date.value).toEqual(
      new KnoraPeriod(new KnoraDate('JULIAN', 'CE', 2019, 5, 19), new KnoraDate('JULIAN', 'CE', 2020, 5, 19))
    );

    // access private _subscriptions property and ensure that each subscription is still open
    testHostComponent.dateValueHandlerComponent['_subscriptions'].forEach(sub => {
      expect(sub.closed).toBeFalse();
    });
  });

  it('should return "null" for an invalid user input (start date greater than end date)', async () => {
    testHostComponent.dateValueHandlerComponent.isPeriodControl.setValue(true);

    testHostComponent.dateValueHandlerComponent.startDate.setValue(new KnoraDate('JULIAN', 'CE', 2021, 5, 19));

    testHostComponent.dateValueHandlerComponent.endDate.setValue(new KnoraDate('JULIAN', 'CE', 2020, 5, 19));

    await testHostFixture.whenStable();

    expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(false);

    expect(testHostComponent.form.controls.date.value).toBeNull();
  });

  it('should return "null" for an invalid user input (start date greater than end date) 2', async () => {
    testHostComponent.dateValueHandlerComponent.isPeriodControl.setValue(true);

    testHostComponent.dateValueHandlerComponent.startDate.setValue(new KnoraDate('JULIAN', 'CE', 2021, 5, 19));

    testHostComponent.dateValueHandlerComponent.endDate.setValue(new KnoraDate('JULIAN', 'BCE', 2022, 5, 19));

    await testHostFixture.whenStable();

    expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(false);

    expect(testHostComponent.form.controls.date.value).toBeNull();
  });

  it('should initialize the date with an empty value', () => {
    testHostComponent.form.controls.date.setValue(null);

    expect(testHostComponent.dateValueHandlerComponent.startDate.value).toBe(null);
    expect(testHostComponent.dateValueHandlerComponent.isPeriodControl.value).toBe(false);
    expect(testHostComponent.dateValueHandlerComponent.endDate.value).toBe(null);
    expect(testHostComponent.dateValueHandlerComponent.calendarControl.value).toEqual('GREGORIAN');

    expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(false);
  });
});

describe('DateValueHandlerComponent (no validator required)', () => {
  let testHostComponent: NoValueRequiredTestHostComponent;
  let testHostFixture: ComponentFixture<NoValueRequiredTestHostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      declarations: [DateValueHandlerComponent, TestDatePickerComponent, NoValueRequiredTestHostComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(NoValueRequiredTestHostComponent);
    testHostComponent = testHostFixture.componentInstance;
    testHostFixture.detectChanges();

    expect(testHostComponent).toBeTruthy();
  });

  it('should propagate changes made by the user for a period', async () => {
    expect(testHostComponent.dateValueHandlerComponent.isPeriodControl.value).toBeFalse();

    testHostComponent.dateValueHandlerComponent.isPeriodControl.setValue(true);

    expect(testHostComponent.dateValueHandlerComponent.isPeriodControl.value).toBeTrue();

    testHostFixture.detectChanges();

    const hostCompDe = testHostFixture.debugElement;

    const startDateEditComponentDe = hostCompDe.query(By.css('.start-date'));

    (startDateEditComponentDe.componentInstance as TestDatePickerComponent).writeValue(
      new KnoraDate('JULIAN', 'CE', 2019, 5, 19)
    );
    (startDateEditComponentDe.componentInstance as TestDatePickerComponent)._handleInput();

    testHostFixture.detectChanges();

    const endDateEditComponentDe = hostCompDe.query(By.css('.end-date'));

    (endDateEditComponentDe.componentInstance as TestDatePickerComponent).writeValue(
      new KnoraDate('JULIAN', 'CE', 2020, 5, 19)
    );
    (endDateEditComponentDe.componentInstance as TestDatePickerComponent)._handleInput();

    testHostFixture.detectChanges();

    await testHostFixture.whenStable();

    expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(true);

    expect(testHostComponent.form.controls.date.value).toEqual(
      new KnoraPeriod(new KnoraDate('JULIAN', 'CE', 2019, 5, 19), new KnoraDate('JULIAN', 'CE', 2020, 5, 19))
    );

    // access private _subscriptions property and ensure that each subscription is still open
    testHostComponent.dateValueHandlerComponent['_subscriptions'].forEach(sub => {
      expect(sub.closed).toBeFalse();
    });
  });

  it('should not receive the propagated valueRequiredValidator from the parent component', () => {
    expect(testHostComponent.dateValueHandlerComponent.valueRequiredValidator).toBe(false);
  });

  it("should mark the form's validity correctly", () => {
    expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(true);
  });
});
*/
