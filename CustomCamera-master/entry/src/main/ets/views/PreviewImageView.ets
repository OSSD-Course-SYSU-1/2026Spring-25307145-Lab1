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

import { display } from '@kit.ArkUI';
import { Logger } from 'commons';
import PreviewViewModel from '../viewmodels/PreviewViewModel';

const TAG = 'PreviewImageView';
const DEFAULT_IMAGE_HEIGHT: number = 80;

/**
 * Dual preview image component, displaying the second preview stream.
 */
@Component
export struct PreviewImageView {
  @ObjectLink previewVM: PreviewViewModel;
  private previewImageHeight: number = DEFAULT_IMAGE_HEIGHT;

  // Determine the preview image size based on the current device size and rotation state.
  getPreviewImageWidth(): number {
    let displayDefault: display.Display | null = null;
    try {
      displayDefault = display.getDefaultDisplaySync();
    } catch (exception) {
      Logger.error(TAG, `getDefaultDisplaySync failed, code is ${exception.code}, message is ${exception.message}`);
    }
    const rotation = (displayDefault?.rotation ?? 0) * 90;
    const ratio = this.previewVM.getPreviewRatio();
    const displayRatio = rotation === 90 || rotation === 270 ? 1 / ratio : ratio;
    return this.previewImageHeight / displayRatio;
  }

  build() {
    Image(this.previewVM.previewImage)
      .width(this.getPreviewImageWidth())
      .height(this.previewImageHeight)
      .alignRules({
        bottom: { anchor: '__container__', align: VerticalAlign.Bottom },
        left: { anchor: '__container__', align: HorizontalAlign.Start }
      })
      .margin({
        bottom: 10,
        left: 10
      })
  }
}