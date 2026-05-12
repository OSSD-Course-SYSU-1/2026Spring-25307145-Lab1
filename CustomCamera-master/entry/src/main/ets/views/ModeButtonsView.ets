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

import PreviewViewModel, { CameraMode } from '../viewmodels/PreviewViewModel';

export interface CameraModeButton {
  title: ResourceStr;
  mode: CameraMode;
  onClick?: () => void;
}

/**
 * Camera photo and video mode switch component.
 */
@Component
struct ModeButtonsView {
  @ObjectLink previewVM: PreviewViewModel;
  private cameraModeButtons: CameraModeButton[] = [
    {
      title: $r('app.string.photo'),
      mode: CameraMode.PHOTO
    },
    {
      title: $r('app.string.video'),
      mode: CameraMode.VIDEO
    }
  ];

  build() {
    Row() {
      ForEach(this.cameraModeButtons, (modeBtn: CameraModeButton) => {
        Text(modeBtn.title)
          .fontColor(Color.White)
          .fontSize(14)
          .fontWeight(this.previewVM.isCurrentCameraMode(modeBtn.mode) ? FontWeight.Bold : FontWeight.Normal)
          .onClick(async () => {
            if (modeBtn.onClick) {
              modeBtn.onClick();
            } else {
              if (this.previewVM.isCurrentCameraMode(modeBtn.mode)) {
                return;
              }
              // Recreate preview stream when switching modes.
              this.previewVM.openPreviewBlur();
              this.previewVM.cameraMode = modeBtn.mode;
              this.previewVM.setPreviewSize();
              await this.previewVM.cameraManagerRelease();
              this.previewVM.setPhotoIsActive();
              this.previewVM.setVideoIsActive();
              await this.previewVM.cameraManagerStart();
              this.previewVM.syncButtonSettings();
            }
          })
      }, (modeBtn: CameraModeButton) => modeBtn.mode.toString());
    }
    .id('modeButtonsView')
    .width('40%')
    .justifyContent(FlexAlign.SpaceAround)
    .alignRules({
      bottom: { anchor: 'operateButtonsView', align: VerticalAlign.Top },
      middle: { anchor: 'operateButtonsView', align: HorizontalAlign.Center }
    })
    .margin({ bottom: 40 })
  }
}

export default ModeButtonsView;