import { CUSTOM_ELEMENTS_SCHEMA, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [BrowserModule, IonicModule.forRoot({
        platform: {
            /** The default `desktop` function returns false for devices with a touchscreen.
                This is not always wanted, so this function tests the User Agent instead.
             **/
            desktop: (win) => {
                let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(win.navigator.userAgent);
                isMobile = isMobile || /portrait-primary|portrait-secondary/i.test(screen.orientation.type);
                return !isMobile;
            },
            mobile: (win) => {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(win.navigator.userAgent);
                return isMobile || /portrait-primary|portrait-secondary/i.test(screen.orientation.type);
            },
            iphone: (win) => /iPhone/i.test(win.navigator.userAgent)
            ,
        },
    }), AppRoutingModule, HttpClientModule, TranslocoRootModule],
    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
