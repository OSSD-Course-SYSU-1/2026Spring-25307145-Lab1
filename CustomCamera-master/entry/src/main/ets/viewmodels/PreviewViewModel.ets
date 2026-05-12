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

import { curves, display } from '@kit.ArkUI';
import { camera } from '@kit.CameraKit';
import { image } from '@kit.ImageKit';
import { media } from '@kit.MediaKit';
import { sensor } from '@kit.SensorServiceKit';
import { Logger } from 'commons';
import { ImageReceiverManager, MetadataManager, PhotoManager, PreviewManager, VideoManager } from 'camera';
import WindowUtil from '../utils/WindowUtil';
import CameraConstant from '../constants/Constants';
import { CameraManagerModel } from '../models/CameraManagerModel';
import RefreshableTimer from '../utils/RefreshableTimer';

export enum CameraMode {
  PHOTO,
  VIDEO
}

const TAG = 'PreviewViewModel';

/**
 * States and methods related to preview.
 */
@Observed
class PreviewViewModel {
  // [Start isFront]
  public isFront: boolean = false;
  // [StartExclude isFront]
  public cameraMode: CameraMode = CameraMode.PHOTO;
  public xComponentController: XComponentController = new XComponentController();
  public surfaceId: string = '';
  public previewSize: Size = WindowUtil.getMaxDisplaySize(CameraConstant.RATIO_PHOTO);
  public rates?: number[] = [];
  public currentRate: number = 0;
  public blurRadius: number = 0;
  public blurRotation: RotateOptions = { y: 0.5, angle: 0 };
  public faceBoundingBoxArr: camera.Rect[] = [];
  // Accelerometer data.
  public acc: sensor.AccelerometerResponse = { x: 0, y: 0, z: 0 } as sensor.AccelerometerResponse;

  // Timer photo settings params.
  public isDelayTakePhoto: boolean = false;
  public photoDelayTime: number = 0;
  public photoRemainder: number = 0;

  public isStabilizationEnabled: boolean = false;
  // Focal length params.
  public zoomRange: number[] = [];
  public zooms: number[] = [1, 5, 10];
  public currentZoom: number = 1;

  public isGridLineVisible: boolean = false;
  public isLevelIndicatorVisible: boolean = false;
  public isSinglePhoto: boolean = false;
  public isLivePhoto: boolean = false;
  public isPreviewImageVisible: boolean = false;
  public previewImage: PixelMap | ResourceStr = '';
  public isSleeping: boolean = false;
  public sleepTimer: RefreshableTimer | undefined = undefined;
  // [Start getProfile]
  // Get the camera's width, height, and format params.
  public getProfile: (cameraOrientation: number) => camera.Profile = cameraOrientation => {
    const displaySize: Size = WindowUtil.getMaxDisplaySize(this.getPreviewRatio());
    let displayDefault: display.Display | null = null;
    try {
      displayDefault = display.getDefaultDisplaySync();
    } catch (exception) {
      Logger.error(TAG, `getDefaultDisplaySync failed, code is ${exception.code}, message is ${exception.message}`);
    }
    // Get actual rotation angle.
    const displayRotation = (displayDefault?.rotation ?? 0) * 90;
    const isRevert = (cameraOrientation + displayRotation) % 180 !== 0;
    return {
      format: camera.CameraFormat.CAMERA_FORMAT_YUV_420_SP,
      size: {
        height: isRevert ? displaySize.width : displaySize.height,
        width: isRevert ? displaySize.height : displaySize.width
      }
    };
  };
  // [End getProfile]

  private context: Context | undefined;
  private uiContext: UIContext;
  private cameraManagerModel: CameraManagerModel;

  constructor(uiContext: UIContext) {
    this.uiContext = uiContext;
    let context = this.uiContext.getHostContext()!;
    this.context = context;

    // Create camera management variables.
    let previewManager = new PreviewManager(() => {
      this.closePreviewBlur();
    });
    let photoManager = new PhotoManager(this.context, true, this.isSinglePhoto);
    let videoManager = new VideoManager(this.context);
    let imageReceiverManager = new ImageReceiverManager(px => {
      this.onImageReceiver(px);
    });
    let metadataManager = new MetadataManager(faceBoxArr => {
      this.onMetadataObjectsAvailable(faceBoxArr);
    });
    this.cameraManagerModel = new CameraManagerModel(context, previewManager,
      photoManager, videoManager, imageReceiverManager, metadataManager);
  }

  onPreviewStart(): void {
    this.closePreviewBlur();
  }

  onImageReceiver(pixelMap: PixelMap): void {
    this.previewImage = pixelMap;
  }

  // [Start onMetadataObjectsAvailable]
  onMetadataObjectsAvailable(faceBoxArr: camera.Rect[]): void {
    faceBoxArr.forEach((value) => {
      // Convert normalized coordinates to actual coordinates.
      value.topLeftX *= this.getPreviewWidth();
      value.topLeftY *= this.getPreviewHeight();
      value.width *= this.getPreviewWidth();
      value.height *= this.getPreviewHeight();
    });
    this.faceBoundingBoxArr = faceBoxArr;
  }
  // [End onMetadataObjectsAvailable]

  async cameraManagerStart(): Promise<void> {
    let cameraPosition = this.getCameraPosition();
    let sceneMode = this.getSceneMode();
    await this.cameraManagerModel.cameraManager.start(this.surfaceId, cameraPosition, sceneMode, this.getProfile,
      this.isStabilizationEnabled);
  }

  async cameraManagerRelease(): Promise<void> {
    await this.cameraManagerModel.cameraManager.release();
  }

  getCameraZoomRange(): number[] {
    return this.cameraManagerModel.cameraManager.getZoomRange();
  }

  setCameraZoomRatio(): void {
  this.cameraManagerModel.cameraManager.setZoomRatio(this.currentZoom);
  }

  setCameraFocusMode(focusMode: camera.FocusMode): void {
    this.cameraManagerModel.cameraManager.setFocusMode(focusMode);
  }

  setCameraExposureMode(exposureMode: camera.ExposureMode): void {
    this.cameraManagerModel.cameraManager.setExposureMode(exposureMode);
  }

  setCameraFocusPoint(cameraPoint: camera.Point): void {
    this.cameraManagerModel.cameraManager.setFocusPoint(cameraPoint);
  }

  setCameraMeteringPoint(cameraPoint: camera.Point): void {
    this.cameraManagerModel.cameraManager.setMeteringPoint(cameraPoint);
  }

  setCameraFlashMode(mode: camera.FlashMode): void {
    this.cameraManagerModel.cameraManager.setFlashMode(mode);
  }

  setCameraSmoothZoom(zoom: number): void {
    this.cameraManagerModel.cameraManager.setSmoothZoom(zoom);
  }

  syncButtonSettings(): void {
    this.cameraManagerModel.previewManager.setFrameRate(this.currentRate, this.currentRate);
    this.cameraManagerModel.photoManager.enableMovingPhoto(this.isLivePhoto);
    this.cameraManagerModel.photoManager.setPhotoOutputCallback(this.isSinglePhoto);
    this.currentZoom = 1;
    this.faceBoundingBoxArr.length = 0;
  }

  isPreviewManagerExist(): boolean {
    if (this.cameraManagerModel.previewManager) {
      return true;
    }
    return false;
  }

  setPhotoIsActive(): void {
    this.cameraManagerModel.photoManager.setIsActive(this.isPhotoMode() ? true : false);
  }

  setVideoIsActive(): void {
    this.cameraManagerModel.videoManager.setIsActive(this.isPhotoMode() ? false : true);
  }

  setPhotoCallback(cb: (pixelMap: image.PixelMap, url: string) => void): void {
    this.cameraManagerModel.photoManager.setCallback(cb);
  }

  setVideoCallback(cb: (pixelMap: image.PixelMap, url: string) => void): void {
    this.cameraManagerModel.videoManager.setVideoCallback(cb);
  }

  async photoCapture(): Promise<void> {
    this.cameraManagerModel.photoManager.capture(this.isFront);
  }

  async videoStart(): Promise<void> {
    this.cameraManagerModel.videoManager.start(this.isFront);
  }

  async videoPause(): Promise<void> {
    this.cameraManagerModel.videoManager.pause();
  }

  async videoResume(): Promise<void> {
    this.cameraManagerModel.videoManager.resume();
  }

  async videoStop(): Promise<void> {
    await this.cameraManagerModel.videoManager.stop();
  }

  isVideoRecording(): boolean {
    return this.cameraManagerModel.videoManager.isRecording();
  }

  checkVideoState(state: media.AVRecorderState): boolean {
    return this.cameraManagerModel.videoManager.state === state;
  }

  getPreviewSupportedFrameRates(): camera.FrameRateRange[] | undefined {
    return this.cameraManagerModel.previewManager.getSupportedFrameRates();
  }

  setPreviewFrameRate(minRate: number, maxRate: number): void {
    this.cameraManagerModel.previewManager.setFrameRate(minRate, maxRate);
  }

  enableMovingPhoto(): void {
    this.cameraManagerModel.photoManager.enableMovingPhoto(this.isLivePhoto);
  }

  setPhotoOutputCallback(): void {
    this.cameraManagerModel.photoManager.setPhotoOutputCallback(this.isSinglePhoto);
  }

  // [EndExclude isFront]
  getCameraPosition(): camera.CameraPosition {
    return this.isFront
      ? camera.CameraPosition.CAMERA_POSITION_FRONT
      : camera.CameraPosition.CAMERA_POSITION_BACK;
  }
  // [End isFront]

  getPreviewRatio(): number {
    return this.cameraMode === CameraMode.PHOTO
      ? CameraConstant.RATIO_PHOTO
      : CameraConstant.RATIO_VIDEO;
  }

  getSceneMode(): camera.SceneMode {
    return this.cameraMode === CameraMode.PHOTO
      ? camera.SceneMode.NORMAL_PHOTO
      : camera.SceneMode.NORMAL_VIDEO;
  }

  // [Start setPreviewSize]
  setPreviewSize(): void {
    const displaySize: Size = WindowUtil.getMaxDisplaySize(this.getPreviewRatio());
    this.previewSize = displaySize;
    this.xComponentController.setXComponentSurfaceRect({
      surfaceWidth: displaySize.width,
      surfaceHeight: displaySize.height
    });
  }
  // [End setPreviewSize]

  getPreviewTop(): number {
    const previewRatio = this.getPreviewRatio();
    return WindowUtil.getWindowRatio() > previewRatio ? 85 : 0;
  }

  getPreviewWidth(): number {
    return this.uiContext.px2vp(this.previewSize.width);
  }

  getPreviewHeight(): number {
    return this.uiContext.px2vp(this.previewSize.height);
  }

  isPhotoMode(): boolean {
    return this.cameraMode === CameraMode.PHOTO;
  }

  isVideoMode(): boolean {
    return this.cameraMode === CameraMode.VIDEO;
  }

  isCurrentCameraMode(mode: CameraMode): boolean {
    return this.cameraMode === mode;
  }

  // open blur animation
  openPreviewBlur(): void {
    animateToImmediately({
      duration: 200,
      curve: Curve.Friction
    }, () => {
      this.blurRadius = 150;
    });
  }

  // Blur animation when rotating is enabled.
  rotatePreviewBlur(): void {
    animateToImmediately({
      delay: 50,
      duration: 200,
      curve: curves.cubicBezierCurve(0.2, 0, 0.83, 1),
      onFinish: () => {
        this.rotatePreviewBlurSecond();
      }
    }, () => {
      this.blurRotation = { y: 0.5, angle: 90 };
    });
  }

  // Enable blur animation at the end of rotation.
  rotatePreviewBlurSecond(): void {
    this.blurRotation = { y: 0.5, angle: 270 };
    animateToImmediately({
      duration: 200,
      curve: curves.cubicBezierCurve(0.17, 0, 0.2, 1),
      onFinish: () => {
        this.blurRotation = { y: 0.5, angle: 0 };
      }
    }, () => {
      this.blurRotation = { y: 0.5, angle: 360 };
    });
  }

  // close blur animation.
  closePreviewBlur(): void {
    animateToImmediately({
      duration: 200,
      curve: Curve.FastOutSlowIn
    }, () => {
      this.blurRadius = 0;
    });
  }
}

export default PreviewViewModel;