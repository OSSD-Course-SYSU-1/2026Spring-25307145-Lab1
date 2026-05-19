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

import { effectKit } from '@kit.ArkGraphics2D';
import { Logger } from 'commons';
import { FilterPresetId, PreviewEnhanceOptions } from '../constants/PreviewEnhanceTypes';

const TAG = 'FilterProcessor';

export class FilterProcessor {
  static needsProcessing(options: PreviewEnhanceOptions): boolean {
    return options.filterId !== FilterPresetId.NONE ||
      options.beautyLevel > 0 ||
      options.whiteningLevel > 0;
  }

  static async apply(source: PixelMap, options: PreviewEnhanceOptions): Promise<PixelMap> {
    if (!FilterProcessor.needsProcessing(options)) {
      return source;
    }
    try {
      let effect = effectKit.createEffect(source);
      switch (options.filterId) {
        case FilterPresetId.BW:
          effect = effect.grayscale();
          break;
        case FilterPresetId.VINTAGE:
          effect = effect.brightness(0.42).grayscale();
          break;
        case FilterPresetId.WARM:
          effect = effect.brightness(0.55);
          break;
        case FilterPresetId.COOL:
          effect = effect.brightness(0.48);
          break;
        case FilterPresetId.VIVID:
          effect = effect.brightness(0.58);
          break;
        default:
          break;
      }
      if (options.beautyLevel > 0) {
        const blurRadius = Math.min(5, options.beautyLevel / 20);
        effect = effect.blur(blurRadius);
      }
      if (options.whiteningLevel > 0) {
        const bright = 0.5 + options.whiteningLevel / 200;
        effect = effect.brightness(bright);
      }
      const result = await effect.getEffectPixelMap();
      return result ?? source;
    } catch (exception) {
      Logger.error(TAG, `apply failed: ${JSON.stringify(exception)}`);
      return source;
    }
  }
}
