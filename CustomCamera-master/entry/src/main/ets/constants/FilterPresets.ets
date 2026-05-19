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

import { FilterPresetId } from 'camera';

export interface FilterMenuItem {
  id: FilterPresetId;
  label: ResourceStr;
  toast: ResourceStr;
}

export const FILTER_MENU_ITEMS: FilterMenuItem[] = [
  { id: FilterPresetId.NONE, label: $r('app.string.filter_none'), toast: $r('app.string.filter_none') },
  { id: FilterPresetId.VINTAGE, label: $r('app.string.filter_vintage'), toast: $r('app.string.filter_vintage') },
  { id: FilterPresetId.BW, label: $r('app.string.filter_bw'), toast: $r('app.string.filter_bw') },
  { id: FilterPresetId.WARM, label: $r('app.string.filter_warm'), toast: $r('app.string.filter_warm') },
  { id: FilterPresetId.COOL, label: $r('app.string.filter_cool'), toast: $r('app.string.filter_cool') },
  { id: FilterPresetId.VIVID, label: $r('app.string.filter_vivid'), toast: $r('app.string.filter_vivid') }
];
