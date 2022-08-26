import { NgModule } from '@angular/core';
import { SafehtmlPipe } from './safehtml.pipe';

@NgModule({
    imports: [],
    declarations: [SafehtmlPipe],
    exports: [SafehtmlPipe],
})

export class SafehtmlPipeModule {

    static forRoot() {
        return {
            ngModule: SafehtmlPipeModule,
            providers: [],
        };
    }
}