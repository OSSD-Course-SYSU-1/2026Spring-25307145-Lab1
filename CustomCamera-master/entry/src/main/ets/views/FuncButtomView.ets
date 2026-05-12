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

import { showToast } from '../utils/CommonUtil';
import PreviewViewModel from '../viewmodels/PreviewViewModel';

@Extend(SymbolGlyph)
function funcButtonStyle() {
  .fontSize(22)
  .fontColor([Color.White])
  .borderRadius('50%')
  .padding(12)
  .backgroundColor('#664D4D4D')
}
/**
 * Camera preview accessibility features, including controls and displays for grid lines,
 * a level, and dual-preview images
 */
@Component
export struct FuncButtonView {
  @ObjectLink previewVM: PreviewViewModel;

  @Builder
  gridLineButton() {
    SymbolGlyph(
      this.previewVM.isGridLineVisible
        ? $r('sys.symbol.camera_assistive_grid')
        : $r('sys.symbol.camera_assistive_grid_slash')
    )
      .funcButtonStyle()
      .onClick(() => {
        this.previewVM.isGridLineVisible = !this.previewVM.isGridLineVisible;
        const message = this.previewVM.isGridLineVisible ? $r('app.string.grid_line_open') : $r('app.string.grid_line_close');
        showToast(this.getUIContext(), message);
      })
  }

  @Builder
  levelButton() {
    SymbolGlyph($r('sys.symbol.horizontal_level'))
      .funcButtonStyle()
      .onClick(() => {
        this.previewVM.isLevelIndicatorVisible = !this.previewVM.isLevelIndicatorVisible;
        const message = this.previewVM.isLevelIndicatorVisible ? $r('app.string.level_open') : $r('app.string.level_close');
        showToast(this.getUIContext(), message);
      })
  }

  @Builder
  previewImageButton() {
    SymbolGlyph(this.previewVM.isPreviewImageVisible ? $r('sys.symbol.eye') : $r('sys.symbol.eye_slash'))
      .funcButtonStyle()
      .onClick(() => {
        this.previewVM.isPreviewImageVisible = !this.previewVM.isPreviewImageVisible;
        const message =
          this.previewVM.isPreviewImageVisible ? $r('app.string.preview_image_open') : $r('app.string.preview_image_close');
        showToast(this.getUIContext(), message);
      })
  }


  build() {
    Column({ space: 24 }) {
      this.gridLineButton()
      this.levelButton()
      this.previewImageButton()
    }
    .alignRules({
      top: { anchor: 'settingButtonsView', align: VerticalAlign.Bottom },
      right: { anchor: 'settingButtonsView', align: HorizontalAlign.End }
    })
    .margin({
      top: 40,
      right: 10
    })
  }
}