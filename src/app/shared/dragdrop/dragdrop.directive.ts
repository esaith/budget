
import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[app-dragdrop]',
    standalone: true
})
export class DragDropDirective {
    isMouseDown = false;

    constructor(el: ElementRef, renderer: Renderer2) {
    }


    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.isMouseDown = true;
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove = (event: MouseEvent): void => {
        if (this.isMouseDown) {
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp = (event: MouseEvent): void => {
        this.isMouseDown = false;
    }
}
