import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Pipe({
    name: 'humanReadableError',
})
export class HumanReadableErrorPipe implements OnDestroy, PipeTransform {
    subscription: Subscription;
    transform(formControl: AbstractControl): string {
        this.subscription = formControl.valueChanges.subscribe(() => {
            if(formControl.valid) return '';

            console.log(formControl, this.humanReadable(formControl))

            return this.humanReadable(formControl);
        });


        return '';
    }

    ngOnDestroy() {
        if(this.subscription) this.subscription.unsubscribe();
    }

    private humanReadable(formControl: AbstractControl) {
        if (formControl.hasError('required')) {
            return 'This field is required';
        }

        if (formControl.hasError('minlength')) {
            const error = formControl.getError('minlength') as { requiredLength: number };
            console.log(error)
            return `Must be greater than or equal to ${error.requiredLength}`;
        }

        if (formControl.hasError('maxlength')) {
            const error = formControl.getError('maxlength') as { requiredLength: number };
            return `Must be less than or equal to ${error?.requiredLength}`;
        }

        throw Error(`Form control error ${formControl.errors[0]} is not handled`);
    }
}
