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

import { sensor } from '@kit.SensorServiceKit';
import { common } from '@kit.AbilityKit';
import { display, window } from '@kit.ArkUI';
import { camera } from '@kit.CameraKit';
import { Logger } from 'commons';
import RefreshableTimer from '../utils/RefreshableTimer';
import ZoomButtonsView from '../views/ZoomButtonsView';
import ModeButtonsView from '../views/ModeButtonsView';
import SettingButtonsView from '../views/SettingButtonsView';
import OperateButtonsView from '../views/OperateButtonsView';
import { PreviewScreenView } from '../views/PreviewScreenView';
import { FuncButtonView } from '../views/FuncButtomView';
import { PreviewImageView } from '../views/PreviewImageView';
import PreviewViewModel from '../viewmodels/PreviewViewModel';

const TAG = 'Index';

@Entry
@Component
struct Index {
  @State previewVM: PreviewViewModel = new PreviewViewModel(this.getUIContext());
  private context: Context = this.getUIContext().getHostContext()!;
  private applicationContext = this.context.getApplicationContext();
  private windowClass?: window.Window;

  async aboutToAppear() {
    // Add state listener when the page initializes.
    this.addGravityEventListener();
    this.initSleepTimer();
    this.registerApplicationStateChange();
    this.addOrientationChangeEventListener();

    // Get the current window.
    try {
      this.windowClass = (this.context as common.UIAbilityContext).windowStage.getMainWindowSync();
    } catch (exception) {
      Logger.error(TAG, `getMainWindowSync failed, code is ${exception.code}, message is ${exception.message}`);
    }

    // Monitor device fold state changes.
    try {
      display.on('foldStatusChange', () => {
        this.onFoldStatusChange();
      });
    } catch (exception) {
      Logger.error(TAG, `onFoldStatusChange failed, code is ${exception.code}, message is ${exception.message}`);
    }
  }

  aboutToDisappear(): void {
    sensor.off(sensor.SensorId.GRAVITY);
    this.previewVM.sleepTimer?.clear();
    this.applicationContext.off('applicationStateChange');
    this.removeOrientationChangeEventListener();
  }

  // [Start addGravityEventListener]
  // Add a gravity sensor listener callback function.
  addGravityEventListener(): void {
    try {
      sensor.on(sensor.SensorId.GRAVITY, (data) => {
        this.previewVM.acc = data;
      }, { interval: 100 * 1000 * 1000 }); // 100ms
    } catch (exception) {
      Logger.error(TAG, `addGravityEventListener failed, code is ${exception.code}, message is ${exception.message}`);
    }
  }

  // [End addGravityEventListener]

  // [Start initSleepTimer]
  initSleepTimer(): void {
    this.previewVM.sleepTimer = new RefreshableTimer(() => {
      this.previewVM.openPreviewBlur();
      this.previewVM.isSleeping = true;
      this.previewVM.cameraManagerRelease();
    }, 30 * 1000);
    this.previewVM.sleepTimer.start();
    const observer = this.getUIContext().getUIObserver();
    observer.on('willClick', () => {
      this.previewVM.sleepTimer?.refresh();
    });
  }

  // [End initSleepTimer]

  // [Start registerApplicationStateChange]
  registerApplicationStateChange(): void {
    this.applicationContext.on('applicationStateChange', {
      onApplicationForeground: async () => {
        await this.previewVM.cameraManagerStart();
        // [StartExclude registerApplicationStateChange]
        this.previewVM.syncButtonSettings();
        // [EndExclude registerApplicationStateChange]
      },
      onApplicationBackground: () => {
        // [StartExclude registerApplicationStateChange]
        this.previewVM.openPreviewBlur();
        // [EndExclude registerApplicationStateChange]
        this.previewVM.cameraManagerRelease();
      }
    });
  }
  // [End registerApplicationStateChange]

  // Rotation state listener.
  addOrientationChangeEventListener(): void {
    this.windowClass?.on('windowSizeChange', () => { this.previewVM.setPreviewSize(); });
  }

  removeOrientationChangeEventListener(): void {
    this.windowClass?.off('windowSizeChange');
  }

  // Fold state listener callback.
  async onFoldStatusChange(): Promise<void> {
    await this.previewVM.cameraManagerRelease();
    await this.previewVM.cameraManagerStart();
    this.previewVM.syncButtonSettings();
  }

  // [Start onMetadataObjectsAvailable]
  // Face detection information listener callback.
  onMetadataObjectsAvailable(faceBoxArr: camera.Rect[]): void {
    faceBoxArr.forEach((value) => {
      // Convert normalized coordinates to actual coordinates.
      value.topLeftX *= this.previewVM.getPreviewWidth();
      value.topLeftY *= this.previewVM.getPreviewHeight();
      value.width *= this.previewVM.getPreviewWidth();
      value.height *= this.previewVM.getPreviewHeight();
    });
    this.previewVM.faceBoundingBoxArr = faceBoxArr;
  }
  // [End onMetadataObjectsAvailable]

  // [Start wakeupMask]
  @Builder
  wakeupMask() {
    Column() {
      Text($r('app.string.wakeup_text'))
        .fontColor(Color.White)
        .opacity(0.6)
    }
    // [StartExclude wakeupMask]
    .width('100%')
    .height('100%')
    .backgroundColor(Color.Black)
    .justifyContent(FlexAlign.Center)
    // [EndExclude wakeupMask]
    .onClick(async () => {
      this.previewVM.isSleeping = false;
      this.previewVM.sleepTimer?.refresh();
      await this.previewVM.cameraManagerStart();
      this.previewVM.syncButtonSettings();
    })
  }

  // [End wakeupMask]

  build() {
    RelativeContainer() {
      if (this.previewVM.isPreviewManagerExist()) {
        // Display camera preview and related preview auxiliary components.
        PreviewScreenView({
          previewVM: this.previewVM
        });
      }

      if (this.previewVM.isPreviewImageVisible) {
        // Show a thumbnail of the last photo taken.
        PreviewImageView({
          previewVM: this.previewVM
        });
      }

      // Camera Shooting Assist Function Button.
      FuncButtonView({
        previewVM: this.previewVM
      });

      // Camera shooting settings button.
      SettingButtonsView({
        previewVM: this.previewVM
      });

      // Camera focal length setting button
      if (!this.previewVM.photoRemainder) {
        if (!this.previewVM.isFront &&
          !(this.previewVM.isStabilizationEnabled && this.previewVM.isVideoMode())) {
          ZoomButtonsView({
            previewVM: this.previewVM
          });
        }

        // Camera shooting mode setting button.
        ModeButtonsView({
          previewVM: this.previewVM
        });

        // Camera Shooting Operation Buttons.
        OperateButtonsView({
          previewVM: this.previewVM
        });
      }

      // Camera Sleep Prompt.
      if (this.previewVM.isSleeping) {
        this.wakeupMask();
      }
    }
    .height('100%')
    .width('100%')
    .backgroundColor(Color.Black)
    .onClick(() => {
    })
  }
}