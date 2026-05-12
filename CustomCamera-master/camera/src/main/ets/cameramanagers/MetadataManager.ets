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

import { BusinessError } from '@kit.BasicServicesKit';
import { camera } from '@kit.CameraKit';
import { Logger } from 'commons';
import { OutputManager, CreateOutputConfig } from './OutputManager';

const TAG_LOG = 'MetadataManager';

/**
 * Metadata output stream management class, responsible for managing the creation,
 * configuration, and release of the output stream.
 */
export class MetadataManager implements OutputManager {
  public output?: camera.MetadataOutput;
  public isActive: boolean = true;
  public onMetadataObjectsAvailable: (faceBoxArr: camera.Rect[]) => void;

  constructor(onMetadataObjectsAvailable: (faceBoxArr: camera.Rect[]) => void) {
    this.onMetadataObjectsAvailable = onMetadataObjectsAvailable;
  }

  // [Start MetadataOutput]
  async createOutput(config: CreateOutputConfig): Promise<camera.CameraOutput | undefined> {
    const cameraOutputCap = config.cameraManager?.getSupportedOutputCapability(config.device, config.sceneMode);
    if (!cameraOutputCap) {
      Logger.error(TAG_LOG, 'Failed to get supported output capability.');
      return undefined;
    }
    let metadataObjectTypes: camera.MetadataObjectType[] = cameraOutputCap!.supportedMetadataObjectTypes;
    try {
      this.output = config.cameraManager?.createMetadataOutput(metadataObjectTypes);
      if (this.output) {
        this.addOutputListener(this.output);
      }
    } catch (error) {
      Logger.error(TAG_LOG, `Failed to createMetadataOutput, error code: ${error.code}`);
    }
    return this.output;
  }
  // [End MetadataOutput]

  addOutputListener(output: camera.MetadataOutput): void {
    this.addMetadataObjectsAvailableListener(output);
    this.addMetadataErrorListener(output);
  }

  // [Start metadataObjectsAvailable]
  addMetadataObjectsAvailableListener(metadataOutput: camera.MetadataOutput): void {
    metadataOutput.on('metadataObjectsAvailable',
      (err: BusinessError, metadataObjectArr: Array<camera.MetadataObject>) => {
      if (err && err.code !== 0) {
        Logger.error(TAG_LOG, `Metadata output on metadataObjectsAvailable error code: ${err.code}`);
        return;
      }
      let boxRectArr: camera.Rect[] = [];
      metadataObjectArr.forEach((obj: camera.MetadataObject)=>{
        boxRectArr.push(obj.boundingBox);
      });
      this.onMetadataObjectsAvailable(boxRectArr);
    });
  }
  // [End metadataObjectsAvailable]

  addMetadataErrorListener(metadataOutput: camera.MetadataOutput): void {
    metadataOutput.on('error', (metadataOutputError: BusinessError) => {
      Logger.error(TAG_LOG, `Metadata output error code: ${metadataOutputError.code}`);
    });
  }

  async release(): Promise<void> {
    try {
      await this.output?.release();
    } catch (exception) {
      Logger.error(TAG_LOG, `release failed, code is ${exception.code}, message is ${exception.message}`);
    }
    this.output = undefined;
  }
}