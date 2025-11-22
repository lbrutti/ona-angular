import {Component} from "@angular/core";
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss'],
})
export class ImageModalComponent {
  name: string;
  imgPath: string;

  constructor(private readonly modalCtrl: ModalController) {
  }

  dispose() {
    this.modalCtrl.dismiss(null, 'cancel');
  }


}
