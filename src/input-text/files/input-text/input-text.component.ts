import { Component, forwardRef, Input, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const CUSTOM_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputTextComponent),
    multi: true
};
const noop = () => {
};

@Component({
    selector: 'input-text',
    templateUrl: './input-text.component.html',
    providers: [CUSTOM_INPUT_VALUE_ACCESSOR]
})
export class InputTextComponent implements ControlValueAccessor {
    @Input() label: string;
    @Input() type: string;
    @Input() placeholder:string;
    disabled: boolean;

    protected _onTouchedCallback: () => void = noop;
    protected _onChangeCallback: (_: any) => void = noop;

    constructor(private cd: ChangeDetectorRef) {
    }

    protected _value: any = '';

    get value(): any {
        return this._value;
    }

    @Input() set value(v: any) {
        if (v !== this._value) {
            this._value = v;
            /** _OnChangeCallback will register value change into the formControl */
            this._onChangeCallback(v);
            this.cd.markForCheck();
        }
    }

    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: (_: any) => void): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: () => any): void {
        this._onTouchedCallback = fn;
    }

    onValueChange(ev: any) {
        this.value = ev.target.value;
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }


}
