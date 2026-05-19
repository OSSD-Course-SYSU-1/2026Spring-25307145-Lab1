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

import PreviewViewModel from '../viewmodels/PreviewViewModel';

/**
 * Bottom panel for beauty smoothing and whitening sliders.
 */
@Component
export struct FilterBeautyPanel {
  @ObjectLink previewVM: PreviewViewModel;

  build() {
    if (this.previewVM.isBeautyPanelVisible) {
      Column({ space: 12 }) {
        Row() {
          Text($r('app.string.beauty_smooth'))
            .fontColor(Color.White)
            .fontSize(14)
            .width(72)
          Slider({
            value: this.previewVM.beautyLevel,
            min: 0,
            max: 100,
            step: 1
          })
            .layoutWeight(1)
            .onChange(async (value: number) => {
              this.previewVM.beautyLevel = value;
              await this.previewVM.onBeautySettingsChanged();
            })
        }
        .width('100%')

        Row() {
          Text($r('app.string.beauty_whitening'))
            .fontColor(Color.White)
            .fontSize(14)
            .width(72)
          Slider({
            value: this.previewVM.whiteningLevel,
            min: 0,
            max: 100,
            step: 1
          })
            .layoutWeight(1)
            .onChange(async (value: number) => {
              this.previewVM.whiteningLevel = value;
              await this.previewVM.onBeautySettingsChanged();
            })
        }
        .width('100%')
      }
      .width('90%')
      .padding(16)
      .backgroundColor('rgba(0,0,0,0.55)')
      .borderRadius(12)
      .alignRules({
        bottom: { anchor: 'operateButtonsView', align: VerticalAlign.Top },
        middle: { anchor: 'operateButtonsView', align: HorizontalAlign.Center }
      })
      .margin({ bottom: 12 })
    }
  }
}
