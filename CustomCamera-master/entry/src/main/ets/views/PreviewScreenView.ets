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

import { camera } from '@kit.CameraKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { curves } from '@kit.ArkUI';
import { Logger } from 'commons';
import { GridLine, LevelIndicator } from 'camera';
import CameraConstant from '../constants/Constants';
import PermissionManager from '../utils/PermissionManager';
import PreviewViewModel from '../viewmodels/PreviewViewModel';
import RefreshableTimer from '../utils/RefreshableTimer';
import { calCameraPoint, calFaceBoxLinePoint, getClampedChildPosition, limitNumberInRange,
  LinePoint } from '../utils/CommonUtil';

/**
 * Preview stream display component,
 * showing the preview screen as well as focus frames and face detection frames
 */
@Component
export struct PreviewScreenView {
  @State isFocusBoxVisible: boolean = false;
  @State isZoomPinching: boolean = false;
  @State focusBoxPosition: Edges = { top: 0, left: 0 };
  @State flashBlackOpacity: number = 1;
  @State isShowBlack: boolean = false;
  @ObjectLink previewVM: PreviewViewModel;
  @StorageLink('captureClick') @Watch('onCaptureClick') captureClickFlag: number = 0;
  private context: Context = this.getUIContext().getHostContext()!;
  private applicationContext = this.context.getApplicationContext();
  private focusBoxTimer: RefreshableTimer = new RefreshableTimer(() => {
    this.isFocusBoxVisible = false;
    this.previewVM.setCameraFocusMode(camera.FocusMode.FOCUS_MODE_CONTINUOUS_AUTO);
    this.previewVM.setCameraExposureMode(camera.ExposureMode.EXPOSURE_MODE_CONTINUOUS_AUTO);
  }, 3 * 1000);
  private originZoomBeforePinch: number = 1; // record zoom after pinch, sale base it.
  private focusBoxSize: Size = { width: 80, height: 80 };
  private exposureFontSize: number = 24;

  exitApp(): void {
    this.applicationContext.killAllProcesses().catch((err: BusinessError) => {
      Logger.error('showToast', `showToast failed, code is ${err.code}, message is ${err.message}`);
    });
  }

  // Initialize the range of focal lengths that the current camera can be set to.
  initZooms(): void {
    const zoomRange = this.previewVM.getCameraZoomRange();
    const minZoom = zoomRange[0];
    this.previewVM.zoomRange = zoomRange;
    if (minZoom < this.previewVM.zooms[0]) {
      this.previewVM.zooms.unshift(minZoom);
    }
  }

  // Initialize the range of preview stream frame rates that can be set for the current camera.
  initRates(): void {
    const frameRates = this.previewVM.getPreviewSupportedFrameRates();
    if (frameRates && frameRates[0]) {
      const minRate = frameRates[0].min;
      const maxRate = frameRates[0].max;
      this.previewVM.rates = [minRate, maxRate];
      this.previewVM.currentRate = maxRate;
      this.previewVM.setPreviewFrameRate(maxRate, maxRate);
    }
  }

  // Get the exposure position through the focus frame position.
  getExposurePosition(): Edges {
    const focusBoxLeft = this.focusBoxPosition.left as number;
    const focusBoxTop = this.focusBoxPosition.top as number;
    const exposureWidth = this.exposureFontSize;
    const exposureHeight = this.exposureFontSize;
    const focusBoxWidth = this.focusBoxSize.width;
    const focusBoxHeight = this.focusBoxSize.height;
    const previewWidth = this.getUIContext().px2vp(this.previewVM.previewSize.width);
    const GAP = 10;
    const top = focusBoxTop - exposureHeight / 2 + focusBoxHeight / 2;
    const left = focusBoxLeft > previewWidth / 2
      ? focusBoxLeft - GAP - exposureWidth
      : focusBoxLeft + focusBoxWidth + GAP;
    return { top, left };
  }

  // The screen flashes black when taking a photo.
  flashBlackAnim(): void {
    this.flashBlackOpacity = 1;
    this.isShowBlack = true;
    animateToImmediately({
      curve: curves.interpolatingSpring(1, 1, 410, 38),
      delay: 50,
      onFinish: () => {
        this.isShowBlack = false;
        this.flashBlackOpacity = 1;
      }
    }, () => {
      this.flashBlackOpacity = 0;
    });
  }

  onCaptureClick(): void {
    this.flashBlackAnim();
  }

  // [Start faceBox]
  @Builder
  // Face detection box component.
  faceBox(faceBoxRect: camera.Rect) {
    ForEach(calFaceBoxLinePoint(faceBoxRect), (linePoint: LinePoint) => {
      Line()
        .startPoint([0, 0])
        .endPoint([linePoint.increment.x, linePoint.increment.y])
        .stroke(Color.White)
        .position({ x: linePoint.start.x, y: linePoint.start.y })
    }, (linePoint: LinePoint) => JSON.stringify(linePoint));
  }

  // [End faceBox]

  build() {
    // [Start Stack]
    Stack({
      alignContent: Alignment.Center
    }) {
      // [Start XComponent]
      // [Start XComponent_gesture]
      XComponent({
        type: XComponentType.SURFACE,
        controller: this.previewVM.xComponentController
      })
      // [StartExclude Stack]
      // [StartExclude XComponent_gesture]
        .onLoad(async () => {
          // [StartExclude XComponent]
          await PermissionManager.request(CameraConstant.PERMISSIONS, this.context)
            .catch(() => {
              this.exitApp();
            });
          // [EndExclude XComponent]
          this.previewVM.surfaceId = this.previewVM.xComponentController.getXComponentSurfaceId();
          this.previewVM.setPreviewSize();
          this.previewVM.xComponentController.setXComponentSurfaceRotation({ lock: true });
          // [StartExclude XComponent]
          await this.previewVM.cameraManagerStart();
          this.initZooms();
          this.initRates();
          // [EndExclude XComponent]
        })
        // [StartExclude XComponent_gesture]
        // [End XComponent]
        .gesture(
          // Adjust focus with two fingers pinchGesture.
          PinchGesture({ fingers: 2 })
            .onActionStart(() => {
              this.originZoomBeforePinch = this.previewVM.currentZoom;
              this.isZoomPinching = true;
              this.previewVM.sleepTimer?.refresh();
            })
            .onActionUpdate((event: GestureEvent) => {
              if (this.previewVM.isVideoMode() && this.previewVM.isStabilizationEnabled) {
                return;
              }
              const targetZoom = this.originZoomBeforePinch * event.scale;
              this.previewVM.currentZoom = limitNumberInRange(targetZoom, this.previewVM.zoomRange);
              this.previewVM.setCameraZoomRatio();
            })
            .onActionEnd(() => {
              this.isZoomPinching = false;
            })
        )
        // [End XComponent_gesture]
        // Click to set the focus position.
        .onClick(event => {
          this.isFocusBoxVisible = true;
          const previewSize = this.previewVM.previewSize;
          const cameraPoint = calCameraPoint(
            this.getUIContext().vp2px(event.x),
            this.getUIContext().vp2px(event.y),
            previewSize.width,
            previewSize.height
          );
          this.previewVM.setCameraFocusMode(camera.FocusMode.FOCUS_MODE_AUTO);
          this.previewVM.setCameraExposureMode(camera.ExposureMode.EXPOSURE_MODE_AUTO);
          this.previewVM.setCameraFocusPoint(cameraPoint);
          this.previewVM.setCameraMeteringPoint(cameraPoint);
          this.focusBoxPosition = getClampedChildPosition(this.focusBoxSize, {
            width: this.getUIContext().px2vp(previewSize.width),
            height: this.getUIContext().px2vp(previewSize.height)
          }, event);
          this.focusBoxTimer.refresh();
        })
      // [EndExclude Stack]
      if (this.previewVM.isGridLineVisible) {
        GridLine();
      }
      // [StartExclude Stack]
      if (this.previewVM.isLevelIndicatorVisible) {
        LevelIndicator({
          acc: this.previewVM.acc
        });
      }
      // focus box
      if (this.isFocusBoxVisible) {
        Image($r('app.media.focus_box'))
          .width(80)
          .height(80)
          .position(this.focusBoxPosition)
        SymbolGlyph($r('sys.symbol.sun_max'))
          .fontSize(this.exposureFontSize)
          .fontColor([Color.White])
          .position(this.getExposurePosition())
      }

      if (!this.isFocusBoxVisible) {
        ForEach(this.previewVM.faceBoundingBoxArr, (value: camera.Rect) => {
          this.faceBox(value);
        }, (value: camera.Rect) => JSON.stringify(value));
      }

      if (this.previewVM.isDelayTakePhoto) {
        Text(`${this.previewVM.photoRemainder}S`)
          .fontSize(44)
          .fontWeight(FontWeight.Regular)
          .fontColor(Color.White)
      }
      // [EndExclude Stack]

      if (this.isShowBlack) {
        Column()
          .id('black')
          .width('100%')
          .height('100%')
          .backgroundColor(Color.Black)
          .opacity(this.flashBlackOpacity)
      }
    }
    // [End Stack]
    .alignRules({
      middle: { anchor: '__container__', align: HorizontalAlign.Center }
    })
    .width(this.previewVM.getPreviewWidth())
    .height(this.previewVM.getPreviewHeight())
    .margin({ top: this.previewVM.getPreviewTop() })
    .blur(this.previewVM.blurRadius)
    .rotate(this.previewVM.blurRotation)
  }
}