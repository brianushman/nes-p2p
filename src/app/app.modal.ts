import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { environment } from '../environments/environment';
import { InputDevice } from './services/gamepad.service';
import { setTimeout, clearTimeout } from 'timers';
import { GamepadService } from './services/gamepad.service';

export class NesModal {

    private swal_inst: any;
    private timer: any;
    private increment:number = 100;
    private timer_value: number;

    public timeout: number = 0;
    public title: string = 'Title Text';
    public cancelButtonText: string = 'Cancel';
    public confirmButtonText: string = 'Confirm';
    public showDismissButton: boolean = false;
    public onCancel: () => void;
    public onConfirm: () => void;

    public constructor(init?:Partial<NesModal>) {
        Object.assign(this, init);
    }

    public static CloseAll() {
        swal.close();
    }

    open() {
        this.swal_inst = swal({
            title: this.title,
            customClass: 'animated bounceInDown swal-toaster',
            animation: false,
            showCancelButton: this.onCancel != undefined || this.showDismissButton,
            showConfirmButton: this.onConfirm != undefined,
            confirmButtonClass: 'btn btn-primary',
            cancelButtonClass: 'btn btn-white',
            confirmButtonText: this.confirmButtonText,
            cancelButtonText: this.showDismissButton ? 'OK' : this.cancelButtonText,
            backdrop: false,
            allowOutsideClick: false,
            buttonsStyling: false,
            position: 'top',
            footer: '<div class="progress"><div class="progress-bar swal-progress-bar" role="progressbar" style="width: 100%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div></div>'
        }).then((result) => {
            if (result.value) {
                if(this.onConfirm != undefined) this.onConfirm();
            } else if (result.dismiss === 'cancel') {
                if(this.onCancel != undefined) this.onCancel();
            }
            if(this.timer != undefined) clearInterval(this.timer);
        });

        if(this.timeout > 0) {
            this.timer_value = this.timeout;
            this.timer = setInterval(this.onIncrement.bind(this), this.increment);
        }

        return this;
    }

    send_invite(http: HttpClient) {
        this.swal_inst = swal({
            title: 'Let a friend know about NES P2P.',
            customClass: 'animated bounceInDown swal-toaster',
            animation: false,
            showConfirmButton: true,
            showCloseButton: true,
            confirmButtonClass: 'btn btn-primary',
            confirmButtonText: 'Send',
            backdrop: false,
            allowOutsideClick: true,
            buttonsStyling: false,
            footer: '<div class="row" style="height: 10px;"></div>',
            position: 'top-end',
            html: `
            <div class="col-sm-12 form-group">
                <input type="text" class="form-control" id="name" placeholder="Your Name">
                <input type="email" class="form-control" id="email-address" placeholder="Enter Email Address">
                <textarea id="email-text" rows="4" class="form-control" style="resize: none">Hey! Come play an NES game online with me.</textarea>
                <small class="form-text text-muted">We don't keep track of any information entered here.</small>
            </div>`,
            preConfirm: () => {
                var name = $('#name').val().toString();
                var emailAddress = $('#email-address').val().toString();
                var emailText = $('#email-text').val().toString();
                if(name.length < 5) {
                    swal.showValidationError('Enter a valid name');
                }
                else if(!this.isValidEmail(emailAddress)) {
                    swal.showValidationError('Enter a valid email address');
                }
                else if(emailText.length < 5) {
                    swal.showValidationError('Enter a valid message');                    
                }
                return [
                    name,
                    emailAddress,
                    emailText
                ];
            }
        }).then((result) => {
            if (result.value) {
                http.post(`${environment.expressjs}/mail`, {
                    name: result.value[0],
                    email: result.value[1],
                    message: result.value[2]
                }).
                subscribe(data => {
                    swal({
                        title: 'Success!',
                        type: 'success',
                        html:
                          `<i class="glyphicon glyphicon-envelope fa-2x"></i> &nbsp; <h5>Your invitation was sent!</h5>`,
                        confirmButtonText: 'Close',
                        confirmButtonClass: 'btn btn-white',
                        buttonsStyling: false,
                    });
                },
                error => {
                    swal({
                        title: 'Error!',
                        text: 'Unable to send invitation, please try again later.',
                        type: 'error',
                        confirmButtonText: 'Close',
                        confirmButtonClass: 'btn btn-white',
                        buttonsStyling: false,
                    });
                });
            }
        });

        return this;
    }

    discover_gamepads(gamepadService: GamepadService, callback: Function) {
        var devices: InputDevice[] = gamepadService.availableDevices();
        var timeout: any;

        swal({
            title: "Connect your gamepad and press any button...",
            customClass: 'animated bounceInDown swal-toaster dialog-lg',
            animation: false,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonClass: 'btn btn-primary',
            cancelButtonText: 'Done',
            backdrop: false,
            allowOutsideClick: false,
            buttonsStyling: false,
            footer: '<div class="row" style="height: 10px;"></div>',
            html: this.buildListHtml(devices)
        }).then((result) => {
            clearInterval(timeout);
        });

        timeout = setInterval(function() {
            var updated: InputDevice[] = gamepadService.availableDevices();
            if(updated.length > devices.length) {
                var newController = updated[updated.length-2];
                clearInterval(timeout);
                swal.close();
                callback();
                swal({
                    title: 'Success! Found New Device',
                    type: 'success',
                    backdrop: false,
                    html:
                      `<i class="fas fa-gamepad fa-2x"></i> &nbsp; <h5>${newController.name}</h5>`,
                    confirmButtonText: 'Close',
                    confirmButtonClass: 'btn btn-white',
                    buttonsStyling: false,
                });
            }
        }, 1000);
        
        return this;
    }

    private buildListHtml(devices: InputDevice[]): string {
        var list = "";
        if(devices.length > 1) {
            for(let device of devices.splice(-1,1)) {
                list += `
                <li>
                    <a>
                        <i class="fas ${device.isGamepad ? 'fa-gamepad' : 'fa-keyboard'}" style="font-size: 17px"></i>
                        <span>${ device.name }</span>
                    </a>
                </li>
                `
            }
        }
        else {
            list = '<h4>No Devices Found.</h4>'
        }

        return `
            <h2>Searching for New Devices</div>
            <div class="spinner" style="margin-bottom: 15px">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
                <div class="bounce4"></div>
            </div>
            <div>${list}</div>
        `;
    }

    private onIncrement() {
        this.timer_value -= this.increment;
        if(this.timer_value < 0) {
            clearInterval(this.timer);
            if(this.onCancel != undefined) this.onCancel();
            this.swal_inst.close();
        }
        $('.swal-toaster .swal-progress-bar').width(`${(this.timer_value / this.timeout) * 100}%`);
    }

    private isValidEmail(email: string) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }
}