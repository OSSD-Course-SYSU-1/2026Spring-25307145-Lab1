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

import { image } from '@kit.ImageKit';
import { common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { AVRecorderState } from 'camera';
import { Logger } from 'commons';
import PreviewViewModel from '../viewmodels/PreviewViewModel';
import { inputConsumer, KeyCode, KeyEvent } from '@kit.InputKit';

const TAG = 'OperateButtonsView';

/**
 * Shooting operation button components, including taking photos, starting, pausing,
 * and stopping video recording, as well as switching cameras.
 */
@Component
struct OperateButtonsView {
  @State thumbnail: image.PixelMap | string = '';
  @State thumbnailUrl: string = '';
  @ObjectLink previewVM: PreviewViewModel;
  @StorageLink('captureClick') captureClickFlag: number = 0;
  private photoDelayTimer: number = 0;
  private context = this.getUIContext().getHostContext() as common.UIAbilityContext;
  private setThumbnail: (pixelMap: image.PixelMap, url: string) => void = (pixelMap: image.PixelMap, url: string) => {
    this.thumbnail = pixelMap;
    this.thumbnailUrl = url;
  };
  private volumeUpCallBackFunc: (event: KeyEvent) => void = () => {};
  private volumeDownCallBackFunc: (event: KeyEvent) => void = () => {};

  // [Start volume_key_pressed_listen]
  aboutToAppear(): void {
    // [StartExclude volume_key_pressed_listen]
    this.previewVM.setPhotoCallback(this.setThumbnail);
    this.previewVM.setVideoCallback(this.setThumbnail);
    // [EndExclude volume_key_pressed_listen]
    this.setVolumeKeyCallback(); // Register listener.
  }

  aboutToDisappear(): void {
    try {
      inputConsumer.off('keyPressed'); // Unregister listener.
    } catch (error) {
      Logger.error(TAG, `inputConsumer off keyPressed failed, code is ${error.code}, message is ${error.message}`);
    }
  }

  setVolumeKeyCallback(): void {
    // [StartExclude volume_key_pressed_listen]
    // [Start key_pressed_config]
    let volumeUpOptions: inputConsumer.KeyPressedConfig = {
      key: KeyCode.KEYCODE_VOLUME_UP,
      action: 1, // Key pressed.
      isRepeat: false
    };

    let volumeDownOptions: inputConsumer.KeyPressedConfig = {
      key: KeyCode.KEYCODE_VOLUME_DOWN,
      action: 1,
      isRepeat: false
    };
    // [End key_pressed_config]
    // [EndExclude volume_key_pressed_listen]
    // Define callbacks.
    this.volumeUpCallBackFunc = (event: KeyEvent): void => {
      Logger.info(TAG, 'KEYCODE_VOLUME_UP' + JSON.stringify(event));
      if (event.keys.length > 1) {
        return;
      }
      this.volumeKeyPressedFunc();
    };

    this.volumeDownCallBackFunc = (event: KeyEvent): void => {
      Logger.info(TAG, 'KEYCODE_VOLUME_DOWN' + JSON.stringify(event));
      if (event.keys.length > 1) {
        return;
      }
      this.volumeKeyPressedFunc();
    };

    // Enable listening.
    try {
      inputConsumer.on('keyPressed', volumeUpOptions, this.volumeUpCallBackFunc);
      inputConsumer.on('keyPressed', volumeDownOptions, this.volumeDownCallBackFunc);
    } catch (error) {
      Logger.error(TAG, `inputConsumer on keyPressed failed, code is ${error.code}, message is ${error.message}`);
    }
  }
  // [End volume_key_pressed_listen]

  // [Start volume_key_pressed_func]
  async volumeKeyPressedFunc(): Promise<void> {
    // Handle sleep wake-up.
    if (this.previewVM.isSleeping) {
      this.previewVM.isSleeping = false;
      this.previewVM.sleepTimer?.refresh();
      await this.previewVM.cameraManagerStart();
      this.previewVM.syncButtonSettings();
      return;
    }

    // Dispatch operations based on current mode.
    if (this.previewVM.isPhotoMode()) {
     this.takePhoto(); // Execute photo capture.
    }
    // [StartExclude volume_key_pressed_func]
    else {
      if (this.previewVM.isVideoRecording()) {
        this.stopRecord();
      } else {
        this.previewVM.videoStart();
      }
    }
    // [EndExclude volume_key_pressed_func]
  }
  // [End volume_key_pressed_func]

  takePhoto(): void {
    if (this.previewVM.photoDelayTime) {
      // Shooting logic in timer photo mode.
      this.previewVM.isDelayTakePhoto = true;
      this.previewVM.photoRemainder = this.previewVM.photoDelayTime;
      this.photoDelayTimer = setInterval(() => {
        this.previewVM.photoRemainder--;
        if (this.previewVM.photoRemainder === 0) {
          this.previewVM.photoCapture();
          this.captureClickFlag++;
          this.previewVM.isDelayTakePhoto = false;
          clearInterval(this.photoDelayTimer);
        }
      }, 1000);
    } else {
      // Shooting logic in normal photo mode.
      this.previewVM.photoCapture();
      this.captureClickFlag++;
    }
  }

  async stopRecord(): Promise<void> {
    // Check if the current status allows recording.
    if (this.previewVM.checkVideoState(AVRecorderState.STARTED) ||
    this.previewVM.checkVideoState(AVRecorderState.PAUSED)) {
      await this.previewVM.videoStop();
      // Release and reopen the camera.
      await this.previewVM.cameraManagerRelease();
      await this.previewVM.cameraManagerStart();
      this.previewVM.syncButtonSettings();
    }
  }

  @Builder
  photoButton() {
    Column() {
      Column()
        .width(48)
        .height(48)
        .borderRadius('50%')
        .border({
          color: Color.White,
          width: 24
        })
    }
    .width(64)
    .height(64)
    .borderRadius('50%')
    .border({
      color: Color.White,
      width: 1
    })
    .justifyContent(FlexAlign.Center)
    .onClick(() => {
      this.takePhoto();
    })
  }

  @Builder
  videoStartButton() {
    Column() {
      Column()
        .width(52)
        .height(52)
        .backgroundColor(Color.Red)
        .borderRadius('50%')
        .border({
          color: Color.White,
          width: 8
        })
    }
    .width(64)
    .height(64)
    .borderRadius('50%')
    .border({
      color: Color.White,
      width: 1
    })
    .justifyContent(FlexAlign.Center)
    .onClick(() => {
      this.previewVM.videoStart();
    })
  }

  @Builder
  videoStopButton() {
    Column() {
      Column()
        .width(28)
        .height(28)
        .borderRadius(10)
        .backgroundColor(Color.Red)
    }
    .width(64)
    .height(64)
    .borderRadius('50%')
    .border({
      color: Color.White,
      width: 1
    })
    .justifyContent(FlexAlign.Center)
    .onClick(async () => {
      this.stopRecord();
    })
  }

  @Builder
  videoPauseButton() {
    SymbolGlyph($r('sys.symbol.pause'))
      .fontColor([Color.White])
      .fontSize(22)
      .fontWeight(FontWeight.Bolder)
      .padding(11)
      .borderWidth(1)
      .borderColor(Color.White)
      .borderRadius('50%')
      .symbolEffect(new ReplaceSymbolEffect(EffectScope.WHOLE), true)
      .onClick(async () => {
        this.previewVM.videoPause();
      })
  }

  @Builder
  videoResumeButton() {
    SymbolGlyph($r('sys.symbol.play'))
      .renderingStrategy(SymbolRenderingStrategy.MULTIPLE_COLOR)
      .fontColor([Color.White])
      .fontSize(22)
      .padding(11)
      .borderWidth(1)
      .borderColor(Color.White)
      .borderRadius('50%')
      .onClick(async () => {
        this.previewVM.videoResume();
      })
  }

  @Builder
  thumbnailButton() {
    Image(this.thumbnail)
      .width(48)
      .height(48)
      .borderRadius('50%')
      .borderWidth(this.thumbnail ? 1 : 0)
      .borderColor(Color.White)
      .clip(true)
      .onClick(() => {
        if (this.thumbnailUrl) {
          this.context.startAbility({
            parameters: { uri: this.thumbnailUrl },
            action: 'ohos.want.action.viewData',
            bundleName: 'com.huawei.hmos.photos',
            abilityName: 'com.huawei.hmos.photos.MainAbility'
          }).catch((err: BusinessError) => {
            Logger.error(TAG, `showToast failed, code is ${err.code}, message is ${err.message}`);
          });
        }
      })
  }

  @Builder
  delayTakePhotoCancelButton() {
    SymbolGlyph($r('sys.symbol.pause'))
      .fontColor([Color.White])
      .fontSize(22)
      .fontWeight(FontWeight.Bolder)
      .padding(11)
      .borderWidth(1)
      .borderColor(Color.White)
      .borderRadius('50%')
      .symbolEffect(new ReplaceSymbolEffect(EffectScope.WHOLE), true)
      .onClick(async () => {
        this.previewVM.isDelayTakePhoto = false;
        clearInterval(this.photoDelayTimer);
        this.previewVM.photoRemainder = 0;
      })
  }

  // [Start toggleCameraPositionButton]
  @Builder
  toggleCameraPositionButton() {
    Image($r('app.media.toggle_position'))
      .width(48)
      .height(48)
      .onClick(async () => {
        // [StartExclude toggleCameraPositionButton]
        this.previewVM.openPreviewBlur();
        this.previewVM.rotatePreviewBlur();
        // [EndExclude toggleCameraPositionButton]
        this.previewVM.isFront = !this.previewVM.isFront;
        await this.previewVM.cameraManagerRelease();
        await this.previewVM.cameraManagerStart();
        // [StartExclude toggleCameraPositionButton]
        this.previewVM.syncButtonSettings();
        // [EndExclude toggleCameraPositionButton]
      })
  }

  // [End toggleCameraPositionButton]

  build() {
    Row() {
      this.thumbnailButton();
      // Different buttons are shown in photo and video modes.
      if (this.previewVM.isPhotoMode()) {
        this.photoButton();
      } else {
        if (this.previewVM.isVideoRecording()) {
          this.videoStopButton();
        } else {
          this.videoStartButton();
        }
      }
      // Different components are displayed for different states in video mode.
      if (!this.previewVM.isVideoRecording()) {
        this.toggleCameraPositionButton();
      }
      if (this.previewVM.isVideoMode() && this.previewVM.checkVideoState(AVRecorderState.STARTED)) {
        this.videoPauseButton();
      } else if (this.previewVM.isVideoMode() && this.previewVM.checkVideoState(AVRecorderState.PAUSED)) {
        this.videoResumeButton();
      }
    }
    .justifyContent(FlexAlign.SpaceAround)
    .id('operateButtonsView')
    .alignRules({
      bottom: { anchor: '__container__', align: VerticalAlign.Bottom },
      middle: { anchor: '__container__', align: HorizontalAlign.Center },
    })
    .margin({ bottom: 90 })
    .width('90%')
  }
}

export default OperateButtonsView;