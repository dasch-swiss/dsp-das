import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-incoming-resource-pager',
  imports: [MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './incoming-resource-pager.component.html',
  styleUrls: ['./incoming-resource-pager.component.scss'],
})
export class IncomingResourcePagerComponent {
  @Input({ required: true }) pageIndex!: number;
  @Input({ required: true }) pageSize!: number;
  @Input({ required: true }) itemsNumber!: number;
  @Output() pageChanged = new EventEmitter<number>();

  get itemRangeStart(): number {
    return this.pageSize * this.pageIndex + 1;
  }

  get itemRangeEnd(): number {
    return Math.min(this.pageSize * (this.pageIndex + 1), this.itemsNumber);
  }

  changePage(dir: 1 | -1) {
    this.pageIndex += dir;
    this.pageChanged.emit(this.pageIndex);
  }
}
