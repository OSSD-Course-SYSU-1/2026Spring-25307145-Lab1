/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 ("the License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

@Component
export struct HistogramOverlay {
  @Prop @Watch('redraw') bins: number[] = [];
  private settings: RenderingContextSettings = new RenderingContextSettings(true);
  private context: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);

  redraw(): void {
    this.draw();
  }

  draw(): void {
    const ctx = this.context;
    const w = ctx.width;
    const h = ctx.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, w, h);
    if (this.bins.length === 0) {
      return;
    }
    let max = 1;
    for (let i = 0; i < this.bins.length; i++) {
      if (this.bins[i] > max) {
        max = this.bins[i];
      }
    }
    const barW = w / 256;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 256; i++) {
      const barH = (this.bins[i] / max) * (h - 4);
      ctx.fillRect(i * barW, h - barH, Math.max(1, barW), barH);
    }
  }

  build() {
    Canvas(this.context)
      .width(120)
      .height(60)
      .backgroundColor('rgba(0,0,0,0.3)')
      .hitTestBehavior(HitTestMode.None)
      .onReady(() => this.draw())
      .onAppear(() => this.draw())
  }
}
