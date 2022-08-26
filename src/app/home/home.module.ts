import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { TranslocoModule } from '@ngneat/transloco';
import 'img-comparison-slider';
import { SafehtmlPipe } from '../utils/pipes/safepipe/safehtml.pipe';
import { SafehtmlPipeModule } from '../utils/pipes/safepipe/safehtml.pipe.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HomePageRoutingModule,
        TranslocoModule,
        SafehtmlPipeModule],
    declarations: [HomePage],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePageModule { }
