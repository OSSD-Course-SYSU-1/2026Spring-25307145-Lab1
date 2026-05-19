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

export enum FilterPresetId {
  NONE = 0,
  VINTAGE = 1,
  BW = 2,
  WARM = 3,
  COOL = 4,
  VIVID = 5
}

export interface PreviewEnhanceOptions {
  filterId: FilterPresetId;
  beautyLevel: number;
  whiteningLevel: number;
}

export interface PeakingPoint {
  x: number;
  y: number;
}

export interface PreviewFrameProcessConfig {
  needHistogram: boolean;
  needFocusPeaking: boolean;
  needFilter: boolean;
  filterId: FilterPresetId;
  beautyLevel: number;
  whiteningLevel: number;
  previewWidth: number;
  previewHeight: number;
}

export interface PreviewFrameProcessResult {
  histogramBins?: number[];
  peakingPoints?: PeakingPoint[];
  filteredPixelMap?: PixelMap;
}
