import { AbstractControl, ControlValueAccessor, NgModel, Validator, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

// export type ValidationResult = { [validator: string]: string | boolean };
// export type ValidatorArray = Array<Validator | ValidatorFn>;

// export const validate =
//     (validators: ValidatorArray, asyncValidators: AsyncValidatorArray) => {
//   return (control: AbstractControl) => {
//     const synchronousValid = () => composeValidators(validators)(control);

//     if (asyncValidators) {
//       const asyncValidator = composeValidators(asyncValidators);

//       return asyncValidator(control).map(v => {
//         const secondary = synchronousValid();
//         if (secondary || v) { // compose async and sync validator results
//           return Object.assign({}, secondary, v);
//         }
//       });
//     }

//     if (validators) {
//       return of(synchronousValid());
//     }

//     return of(null);
//   };
// };

export abstract class ValueAccessorBase<T> implements ControlValueAccessor {
    //protected abstract model: NgModel;


    private innerValue!: T;

    private changed = new Array<(value: T) => void>();
    private touched = new Array<() => void>();

    get hasTouched(): boolean {
        return this.touched.length > 0;
    }

    get value(): T {
        return this.innerValue;
    }

    set value(value: T) {
        if (this.innerValue !== value) {
            this.innerValue = value;
            this.changed.forEach(f => f(value));
        }
    }

    writeValue(value: T) {

        this.innerValue = value;
    }

    registerOnChange(fn: (value: T) => void) {
        this.changed.push(fn);
    }

    registerOnTouched(fn: () => void) {
        this.touched.push(fn);
    }

    touch() {
        this.touched.forEach(f => f());
    }

    // protected validate(): Observable<ValidationResult> {
    //     this.model = new NgModel(null, this.validators, null, null);
    //     return validate
    //         (this.validators, this.asyncValidators)
    //         (this.model.control);
    // }
}
