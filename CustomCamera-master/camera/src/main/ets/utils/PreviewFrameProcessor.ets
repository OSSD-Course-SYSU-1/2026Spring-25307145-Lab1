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
import { Logger } from 'commons';
import { FilterProcessor } from './FilterProcessor';
import {
  FilterPresetId,
  PeakingPoint,
  PreviewEnhanceOptions,
  PreviewFrameProcessConfig,
  PreviewFrameProcessResult
} from '../constants/PreviewEnhanceTypes';

const TAG = 'PreviewFrameProcessor';
const ANALYSIS_WIDTH = 240;
const ANALYSIS_HEIGHT = 180;
const PEAKING_THRESHOLD = 42;
const MIN_PROCESS_INTERVAL_MS = 100;

export class PreviewFrameProcessor {
  private static lastProcessTime: number = 0;
  private static processing: boolean = false;

  static shouldThrottle(): boolean {
    const now = Date.now();
    return now - PreviewFrameProcessor.lastProcessTime < MIN_PROCESS_INTERVAL_MS;
  }

  static async process(pixelMap: PixelMap, config: PreviewFrameProcessConfig): Promise<PreviewFrameProcessResult> {
    if (PreviewFrameProcessor.processing || PreviewFrameProcessor.shouldThrottle()) {
      return {};
    }
    PreviewFrameProcessor.processing = true;
    PreviewFrameProcessor.lastProcessTime = Date.now();
    const result: PreviewFrameProcessResult = {};
    try {
      const analysisMap = await PreviewFrameProcessor.createAnalysisMap(pixelMap);
      if (config.needHistogram || config.needFocusPeaking) {
        const buffer = new ArrayBuffer(analysisMap.getPixelBytesNumber());
        await analysisMap.readPixelsToBuffer(buffer);
        const bytes = new Uint8Array(buffer);
        const info = await analysisMap.getImageInfo();
        const width = info.size.width;
        const height = info.size.height;
        const isNv21 = bytes.length <= width * height * 1.5;
        if (config.needHistogram) {
          result.histogramBins = PreviewFrameProcessor.computeHistogram(bytes, width, height, isNv21);
        }
        if (config.needFocusPeaking) {
          result.peakingPoints = PreviewFrameProcessor.detectEdges(bytes, width, height, isNv21,
            config.previewWidth, config.previewHeight);
        }
      }
      if (config.needFilter) {
        const options: PreviewEnhanceOptions = {
          filterId: config.filterId,
          beautyLevel: config.beautyLevel,
          whiteningLevel: config.whiteningLevel
        };
        result.filteredPixelMap = await FilterProcessor.apply(pixelMap, options);
      }
      analysisMap.release();
    } catch (exception) {
      Logger.error(TAG, `process failed: ${JSON.stringify(exception)}`);
    } finally {
      PreviewFrameProcessor.processing = false;
    }
    return result;
  }

  private static async createAnalysisMap(source: PixelMap): Promise<PixelMap> {
    const info = await source.getImageInfo();
    const buffer = new ArrayBuffer(source.getPixelBytesNumber());
    await source.readPixelsToBuffer(buffer);
    const copy = await image.createPixelMap(buffer, {
      size: { width: info.size.width, height: info.size.height },
      srcPixelFormat: info.pixelFormat
    });
    const scale = Math.min(ANALYSIS_WIDTH / info.size.width, ANALYSIS_HEIGHT / info.size.height, 1);
    if (scale < 1) {
      const targetW = Math.max(1, Math.floor(info.size.width * scale));
      const targetH = Math.max(1, Math.floor(info.size.height * scale));
      await copy.scale(targetW, targetH);
    }
    return copy;
  }

  private static computeHistogram(bytes: Uint8Array, width: number, height: number, isNv21: boolean): number[] {
    const bins = new Array<number>(256).fill(0);
    const pixelCount = width * height;
    const step = Math.max(1, Math.floor(pixelCount / 8000));
    for (let i = 0; i < pixelCount; i += step) {
      let luma = 0;
      if (isNv21) {
        luma = bytes[i];
      } else {
        const offset = i * 4;
        if (offset + 2 >= bytes.length) {
          break;
        }
        const r = bytes[offset];
        const g = bytes[offset + 1];
        const b = bytes[offset + 2];
        luma = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
      }
      bins[luma]++;
    }
    return bins;
  }

  private static detectEdges(bytes: Uint8Array, width: number, height: number, isNv21: boolean,
    previewWidth: number, previewHeight: number): PeakingPoint[] {
    const points: PeakingPoint[] = [];
    const step = 4;
    const scaleX = previewWidth / width;
    const scaleY = previewHeight / height;
    for (let y = 1; y < height - 1; y += step) {
      for (let x = 1; x < width - 1; x += step) {
        let gx = 0;
        let gy = 0;
        if (isNv21) {
          const idx = y * width + x;
          gx = Math.abs(bytes[idx + 1] - bytes[idx - 1]);
          gy = Math.abs(bytes[idx + width] - bytes[idx - width]);
        } else {
          const idx = (y * width + x) * 4;
          gx = Math.abs(bytes[idx + 4] - bytes[idx - 4]);
          gy = Math.abs(bytes[(y + 1) * width * 4 + x * 4] - bytes[(y - 1) * width * 4 + x * 4]);
        }
        if (gx + gy > PEAKING_THRESHOLD) {
          points.push({ x: x * scaleX, y: y * scaleY });
          if (points.length >= 500) {
            return points;
          }
        }
      }
    }
    return points;
  }
}
