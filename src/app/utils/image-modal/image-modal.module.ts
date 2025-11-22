import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslocoModule} from '@ngneat/transloco';
import {ImageModalComponent} from './image-modal.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TranslocoModule,
  ],
  declarations: [ImageModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageModalModule {
}
