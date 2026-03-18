import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-results-placeholder',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="results-placeholder">
      @if (resultCount === 0) {
        <div class="no-results">
          <mat-icon>search</mat-icon>
          <p class="message">{{ hasFilters ? 'No results found' : 'No filters applied' }}</p>
          <p class="hint">{{ hasFilters ? 'Try adjusting your filters' : 'Add filters to search' }}</p>
        </div>
      } @else {
        <div class="results-header">
          <span class="count">{{ resultCount }} results</span>
          <span class="hint">(Mockup - placeholder data)</span>
        </div>
        <div class="results-list">
          @for (item of mockResults; track item.id) {
            <div class="result-item">
              <div class="result-icon">
                <mat-icon>description</mat-icon>
              </div>
              <div class="result-content">
                <div class="result-title">{{ item.title }}</div>
                <div class="result-meta">{{ item.type }} • {{ item.date }}</div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .results-placeholder {
        margin-top: 16px;
        padding: 16px;
        background: var(--mat-app-surface, #fff);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        min-height: 200px;
      }

      .no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 16px;
        color: rgba(0, 0, 0, 0.54);
      }

      .no-results mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .no-results .message {
        font-size: 16px;
        margin: 0 0 8px;
      }

      .no-results .hint {
        font-size: 14px;
        margin: 0;
        opacity: 0.7;
      }

      .results-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        margin-bottom: 12px;
      }

      .results-header .count {
        font-size: 16px;
        font-weight: 500;
      }

      .results-header .hint {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
        font-style: italic;
      }

      .results-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .result-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.02);
        transition: background 0.15s;
      }

      .result-item:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .result-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 4px;
        background: rgba(63, 81, 181, 0.1);
        color: var(--mat-primary, #3f51b5);
      }

      .result-content {
        flex: 1;
        min-width: 0;
      }

      .result-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .result-meta {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPlaceholderComponent {
  @Input() resultCount = 0;
  @Input() hasFilters = false;

  get mockResults(): Array<{ id: number; title: string; type: string; date: string }> {
    const count = Math.min(this.resultCount, 10);
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Resource ${i + 1} - Sample Title`,
      type: ['Document', 'Image', 'Audio', 'Video'][i % 4],
      date: `2026-03-${String(17 - i).padStart(2, '0')}`,
    }));
  }
}
