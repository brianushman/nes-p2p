import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from "@angular/router";
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { DeviceDetectorModule } from 'ngx-device-detector';
//import { RecaptchaModule } from 'ng2-recaptcha';

import { ROUTES } from "./app.routes";
import { AppComponent } from './app.component';
import { SetupModule } from './setup/setup.module';
import { PlayModule } from './play/play.module';
import { CommonNesModule } from './common-nes/common-nes.module';
import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    SetupModule,
    PlayModule,
    CommonNesModule,
    AngularFontAwesomeModule,
    DeviceDetectorModule.forRoot(),
    RouterModule.forRoot(ROUTES),
    //RecaptchaModule.forRoot()
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
