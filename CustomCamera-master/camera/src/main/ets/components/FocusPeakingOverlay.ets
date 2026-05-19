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

import { PeakingPoint } from '../constants/PreviewEnhanceTypes';

@Component
export struct FocusPeakingOverlay {
  @Prop @Watch('redraw') points: PeakingPoint[] = [];
  private settings: RenderingContextSettings = new RenderingContextSettings(true);
  private context: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);

  redraw(): void {
    this.draw();
  }

  draw(): void {
    const ctx = this.context;
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.fillStyle = '#00FF88';
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      ctx.fillRect(p.x, p.y, 2, 2);
    }
  }

  build() {
    Canvas(this.context)
      .width('100%')
      .height('100%')
      .hitTestBehavior(HitTestMode.None)
      .onReady(() => this.draw())
      .onAppear(() => this.draw())
  }
}
