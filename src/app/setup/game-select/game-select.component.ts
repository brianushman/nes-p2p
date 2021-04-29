import { Renderer2, Component, OnInit, AfterViewInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'game-select',
  templateUrl: './game-select.component.html',
  styleUrls: ['./game-select.component.scss']
})
export class GameSelectComponent implements OnInit {

  constructor(
    private router: Router,
    private http: HttpClient) { }

  alphabet: string[] = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  roms: any[];
  filteredRoms: any[] = [];
  filter: string;
  selectedRom: any;
  currentRom: any;

  @ViewChild('carousel') carousel:any;
  movies : Object[] = []
  slides : Array<Object> = []
  options : Object = {
    controls: true,
    clicking: true,
    sourceProp: 'src',
    visible: 7,
    perspective: 1,
    startSlide: 0,
    border: 3,
    dir: 'rtl',
    width: 230,
    height: 315,
    space: 220,
    loop: false
  }

  @Input() compact: boolean;
  @Output() onSelected = new EventEmitter<any>();

  ngOnInit() {  
    this.http.get(`${environment.expressjs}/roms`, { responseType: 'text' }).subscribe(data => {
      var results = JSON.parse(data);
      this.roms = results;
      this.filteredRoms = results;
    });
  }

  ngAfterViewInit() {
    $(".rom-list-container").height(`${$(window).height() - 100}px`);
    if(this.compact) {
      this.carousel.updateOptions({
        visible: 5,
        width: 161,
        height: 236,
        space: 150
      });
    }
  }

  filterChanged(value) {
    var term = value.toLowerCase();
    this.filteredRoms = this.roms.filter((f: any) => f.Name.toLowerCase().indexOf(term) >= 0);
  }

  RomSelected(rom) {
    var index = this.filteredRoms.indexOf(rom);
    this.carousel.slideClicked(index);
    this.selectedRom = this.filteredRoms[index];
    this.onSelected.emit(this.selectedRom);
  }

  AlphabetIndexStateClass(letter) {
    if(this.currentRom != undefined && (this.currentRom.Name.startsWith(letter) || (letter == "#" && /^\d/.test(this.currentRom.Name)))) return "selected";
    if(this.indexRomNameByLetter(letter) >= 0) return "enabled";
    return "disabled";
  }

  coverImageExists(rom) {
    return !(rom.CoverUrl == undefined || rom.CoverUrl.length == 0);
  }

  coverImageUrl(rom) {
    if(!this.coverImageExists(rom)) return 'assets/images/NoCover.png';
    return 'assets/covers/front/' + rom.CoverUrl;
  }

  MoveListToLetter(letter) {
    var index = this.indexRomNameByLetter(letter);
    this.carousel.goSlide(index);
  }

  private indexRomNameByLetter(letter) {
    for(var i = 0; i < this.filteredRoms.length; ++i) {
      let element = this.filteredRoms[i];
      if(element.Name.startsWith(letter) || (letter == "#" && /^\d/.test(element.Name))) return i;
    }
    return -1;
  }
}
