import {FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {v4 as uuidv4} from "uuid";

// the displayed order is determined by the formDefs array
export class DspFormGroupHandler {

    readonly formDefs: FormControlType[] = [];
    readonly deletedFormVals: FormControlType[] = []; // marked for deletion

    private _formGroup: FormGroup = new FormGroup({});

    constructor(private dspFormDef: FormControlType[]) {
        // clone all defs into a new array for not changing the original input
        this.formDefs = dspFormDef.map(def => def.clone());
        this.setFormGroup();
    }

    get formGroup() {
        return this._formGroup;
    }

    // create a formGroup with unique formControlNames
    private setFormGroup() {
        this._formGroup = new FormGroup({});
        this.formDefs.forEach( f => {
            this._formGroup.addControl(f.formControlName, f.toFormControl());
        });
    }

    // Todo: remove bc. of yagni
    private setFormControl(dspForm: FormControlType) {
        this._formGroup.setControl(dspForm.formControlName, dspForm.toFormControl());
    }

    // duplicate a form definition as well as a form and add it to the formgroup
    duplicateForm(formControlName: string) {
        // get the index of the formControlName to duplicate
        const idx = this.formDefs.findIndex(f => f.formControlName === formControlName);
        if (idx && idx !== -1 && this.formDefs[idx].hasMultipleCard) {
            // only duplicate if the formControl has multiple cardinality
            // clone the form definition but reset the value
            const duplicate = this.formDefs[idx]
                .clone()
                .withoutValue()
                .withIsUnstoredValue(); // a duplicate is never stored in the api
            this.addControl(duplicate, idx + 1 );
        }
    }

    // Insert the control at the specified index or at the end;
    // add the formControl to the formGroup
    addControl(formControlDef: FormControlType, targetIdx?: number) {
        const insertIdx = targetIdx !== undefined ? targetIdx : this.formDefs.length;
        this.formDefs.splice(insertIdx, 0, formControlDef);
        this._formGroup.addControl(formControlDef.formControlName, formControlDef.toFormControl());
    }

    // remove a control
    removeControl(formControlName: string) {
        const index = this.formDefs.findIndex(f => f.formControlName === formControlName);
        if (index !== -1) {
            this.formDefs.splice(index, 1); // Remove the control definition from the array
            // remove the formControl from all forms where it is listed as duplicate
            this._formGroup.removeControl(formControlName); // Remove the control from the form group
        }
    }


    // remove a control and delete its value by adding it to the deletedFormVals array
    deleteControl(formControlName: string) {
        const index = this.formDefs.findIndex(f => f.formControlName === formControlName);
        if (index !== -1) {
            this.deletedFormVals.push(this.formDefs[index]);
            this.formDefs.splice(index, 1); // Remove the control definition from the array
            this._formGroup.removeControl(formControlName); // Remove the control from the form group
        }
    }

    // determine if a given form is not the last existing required value of its
    // kind (label)
    isLastOfARequiredForm(label: string) {
        return this.formDefs.filter(f => {
            f.label === label && f.required
        }).length === 1
    }

    transact() {

    }
}

export type FormSizeClass = 'small-field' | 'medium-field' | 'large-field';

export interface Range {
    start: number;
    end: number;
}

export interface Pattern {
    pattern: string, // regex for value
    patternErrMsg: string // the error msg displayed if the forms value is invalid
}


// The factory's methods can not be static because we need to enforce instance based approach
// (const factory = new DspTextFormControlDef) in order to avoid multiple usage
// of the same factory instance which would lead to multiply the defined forms.
// could be also solved by using a singleton pattern/injectable service
export class DspFormControlFactory {

    private formControlDefs: FormControlType[] = [];

    textForm(label: string): DspTextFormControlDef {
        const control = new DspTextFormControlDef(label);
        this.formControlDefs.push(control);
        return control;
    }

    boolForm(label: string, isUnstored: boolean): DspBoolFormControlDef {
        const control = new DspBoolFormControlDef(label, isUnstored);
        this.formControlDefs.push(control);
        return control;
    }

    getFormControlDefs(): FormControlType[] {
        return this.formControlDefs;
    }
}
// abstract class with generic type T (i.e. the FormControlType) which is extended by all concrete formControlDefs
export abstract class DspFormControlDef<T> {
    // common properties for all subclasses/subtypes
    protected type: T; // the FormControlType which is passed to the constructor; used for returning the concrete type
    protected _formControlName: string;
    protected abstract _value: string | boolean | number | Range | undefined; // value of the formControl
    protected _required: boolean; // whether the form is required or not
    protected _disabled = false; // whether the form is disabled or not e.g. due to validation
    protected _hidden = false; // whether the form is hidden or not e.g. due to restrictions
    protected _hasMultipleCard = false; // whether the form has multiple cardinality or not (can be duplicated)
    protected _canBeDeleted = false; // by api
    protected _unStoredValue = true; // whether the resources property exists in the backend or not

    protected constructor( protected _label: string) {
        this._formControlName = uuidv4(); // unique name for every formDef
    }

    get formControlName() {
        return this._formControlName;
    }

    get label() {
        return this._label;
    }

    get value() {
        return this._value;
    }

    get required(): boolean {
        return this._required;
    }

    get disabled() {
        return this._disabled;
    }

    get hidden() {
        return this._hidden;
    }

    get hasMultipleCard() {
        return this._hasMultipleCard;
    }

    get unStoredValue() {
        return this._unStoredValue;
    }

    get canBeDeleted() {
        return this._canBeDeleted;
    }

    abstract clone(): DspFormControlDef<T>;

    // common builder methods to implement
    abstract withValue(value: string | boolean | number): DspFormControlDef<T>;

    withRequired(required = true): T {
        this._required = required;
        return this as unknown as T;
    }

    withDisabled(disabled = true) {
        this._disabled = disabled;
        return this as unknown as T;
    }

    withHiddenStatus(hidden = true) {
        this._hidden = hidden;
        return this as unknown as T;
    }

    withMultipleCardinality(multi = true) {
        this._hasMultipleCard = multi;
        return this as unknown as T;
    }

    withCanBeDeleted(canDelete = true) {
        this._canBeDeleted = canDelete;
        return this as unknown as T;
    }

    withIsUnstoredValue(isNotStored = true) {
        this._unStoredValue = isNotStored;
        return this as unknown as T;
    }

    public toFormControl(): FormControl {
        return new FormControl(
            {
                value: this.value,
                disabled: this.disabled
            },
            this.getValidators()
        );
    }

    protected abstract getValidators(): ValidatorFn[];
}

export class DspTextFormControlDef extends DspFormControlDef<DspTextFormControlDef>{

    protected _value: string = '';
    private _maxLength: number;
    private _minLength: number;
    private _pattern: string;
    private _patternErrMsg: string; // the error msg displayed if the forms value is invalid due to a wrong pattern
    private _formSizeClass: FormSizeClass = 'medium-field'; // default
    private _blackListedValues: string[]; // values that are not allowed

    constructor( protected _label: string) {
        super(_label);
    }

    get maxLength(): number {
        return this._maxLength;
    }

    get minLength(): number {
        return this._minLength;
    }

    get pattern(): string {
        return this._pattern;
    }

    get formSizeClass() {
        return this._formSizeClass;
    }

    get patternErrMsg() {
        return this._patternErrMsg;
    }

    get blackListedValues() {
        return this._blackListedValues;
    }

    // forms with value are coming from the api
    withValue(value: string): DspTextFormControlDef {
        this._value = value;

        this._unStoredValue = !value;
        return this;
    }

    // forms without value are freshly added forms/properties and not yet stored in the api;
    withoutValue(): DspTextFormControlDef {
        this._value = '';
        return this;
    }

    withMaxLength(maxLength: number): DspTextFormControlDef {
        this._maxLength = maxLength;
        return this;
    }

    withMinLength(minLength: number): DspTextFormControlDef {
        this._minLength = minLength;
        return this;
    }

    // set a regex pattern for the value
    withPattern(pattern: string): DspTextFormControlDef {
        this._pattern = pattern;
        return this;
    }

    // set a regex pattern for the value and a custom error message overriding default error message
    withPatternErrorMessage(pattern: Pattern): DspTextFormControlDef {
        this._pattern = pattern.pattern;
        this._patternErrMsg = pattern.patternErrMsg;
        return this;
    }

    withBlackListValues(blackList: string[]): DspTextFormControlDef {
        this._blackListedValues = blackList;
        return this;
    }

    withFormSize(formSize: FormSizeClass): DspTextFormControlDef {
        this._formSizeClass = formSize;
        return this;
    }

    // clone a DspFormControlDef to get a completely new instance of the
    // same control including the value
    clone(): DspTextFormControlDef {
        const cloned = new DspTextFormControlDef(this.label);
        cloned._value = this._value;
        cloned._disabled = this.disabled;
        cloned._required = this.required;
        cloned._maxLength = this.maxLength;
        cloned._minLength = this.minLength;
        cloned._pattern = this.pattern;
        cloned._patternErrMsg = this.patternErrMsg;
        cloned._formSizeClass = this.formSizeClass;
        cloned._hasMultipleCard = this.hasMultipleCard;
        cloned._canBeDeleted = this.canBeDeleted;
        cloned._unStoredValue = this.unStoredValue;
        return cloned;
    }

    protected getValidators(): ValidatorFn[] {
        {
            const validators: ValidatorFn[] = [];
            if (this.required) {
                validators.push(Validators.required);
            }
            if (this.maxLength) {
                validators.push(Validators.maxLength(this.maxLength));
            }
            if (this.minLength) {
                validators.push(Validators.minLength(this.minLength));
            }
            if (this.pattern) {
                validators.push(Validators.pattern(this.pattern));
            }

            if (this.blackListedValues) {
                validators.push(blacklistValidator(this.blackListedValues));
            }
            return validators;
        }
    }
}

export class DspBoolFormControlDef extends DspFormControlDef<DspBoolFormControlDef>{

    protected _value: boolean | undefined;

    constructor( protected _label: string, isUnStored: boolean) {
        super(_label);
        this._unStoredValue = isUnStored;
    }

    withValue(value: boolean): DspBoolFormControlDef {
        this._value = value;
        return this;
    }

    // booleans in the api can be unset/undefined
    withoutValue(): DspBoolFormControlDef {
        this._value = undefined;
        return this;
    }

    // clone a DspBoolFormControlDef to get a completely new instance of the
    // same control including the value
    clone(): DspBoolFormControlDef {
        const cloned = new DspBoolFormControlDef(this.label, this._unStoredValue);
        cloned._value = this._value;
        cloned._disabled = this.disabled;
        cloned._required = this.required;
        cloned._hasMultipleCard = this.hasMultipleCard;
        cloned._canBeDeleted = this.canBeDeleted;
        cloned._unStoredValue = this.unStoredValue;
        return cloned;
    }

    protected getValidators(): ValidatorFn[] {
        const validators: ValidatorFn[] = [];
        if (this.required) {
            validators.push(Validators.required);
        }
        return validators;
    }
}

function blacklistValidator(blacklist: string[]): ValidatorFn {
    return (control: FormControl) => {
        const value = control.value;
        const isBlacklisted = blacklist.includes(value);

        return isBlacklisted ? { blacklistedValue: true } : null;
    };
}

export type FormControlType = DspTextFormControlDef | DspBoolFormControlDef; // add Other Types
