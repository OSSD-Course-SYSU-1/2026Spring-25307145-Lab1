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

import WindowUtil from '../utils/WindowUtil';

export enum PreviewAspectRatio {
  AUTO,
  RATIO_4_3,
  RATIO_16_9,
  RATIO_1_1,
  FULL
}

export interface AspectRatioMenuItem {
  ratio: PreviewAspectRatio;
  label: ResourceStr;
  toast: ResourceStr;
}

export function getPreviewAspectRatioValue(aspectRatio: PreviewAspectRatio, isPhotoMode: boolean): number {
  switch (aspectRatio) {
    case PreviewAspectRatio.RATIO_4_3:
      return 4 / 3;
    case PreviewAspectRatio.RATIO_16_9:
      return 16 / 9;
    case PreviewAspectRatio.RATIO_1_1:
      return 1;
    case PreviewAspectRatio.FULL:
      return WindowUtil.getWindowRatio();
    case PreviewAspectRatio.AUTO:
    default:
      return isPhotoMode ? 4 / 3 : 16 / 9;
  }
}

export const ASPECT_RATIO_MENU_ITEMS: AspectRatioMenuItem[] = [
  { ratio: PreviewAspectRatio.AUTO, label: $r('app.string.aspect_ratio_auto'), toast: $r('app.string.aspect_ratio_auto') },
  { ratio: PreviewAspectRatio.RATIO_4_3, label: $r('app.string.aspect_ratio_4_3'), toast: $r('app.string.aspect_ratio_4_3') },
  { ratio: PreviewAspectRatio.RATIO_16_9, label: $r('app.string.aspect_ratio_16_9'), toast: $r('app.string.aspect_ratio_16_9') },
  { ratio: PreviewAspectRatio.RATIO_1_1, label: $r('app.string.aspect_ratio_1_1'), toast: $r('app.string.aspect_ratio_1_1') },
  { ratio: PreviewAspectRatio.FULL, label: $r('app.string.aspect_ratio_full'), toast: $r('app.string.aspect_ratio_full') }
];
