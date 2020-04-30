import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ControllerSelectComponent } from './controller-select/controller-select.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ControllerSelectComponent],
  exports: [ControllerSelectComponent],
  providers: [CookieService]
})
export class CommonNesModule { }
