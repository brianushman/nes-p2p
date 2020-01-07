import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieModule } from 'ngx-cookie';
import { ControllerSelectComponent } from './controller-select/controller-select.component';

@NgModule({
  imports: [
    CommonModule,
    CookieModule.forRoot()
  ],
  declarations: [ControllerSelectComponent],
  exports: [ControllerSelectComponent]
})
export class CommonNesModule { }
