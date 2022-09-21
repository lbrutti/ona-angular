import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {
    constructor(private http: HttpClient) {
        this.http.get('/assets/version.json').subscribe((res: any) => {
            (window as any).FREE_FLOWING_RIVERS = { VERSION: res.SemVer };
        });
    }
}
