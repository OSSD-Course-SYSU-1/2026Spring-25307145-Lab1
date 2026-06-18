/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
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

import { STYLE_CONFIG, Constant } from '../common/Constants';
import { ToDo } from '../model/ToDo';
import { Category } from '../model/Category';

const PRIORITY_COLORS: string[] = ['#2ECC71', '#F39C12', '#E74C3C'];

@Component
export struct ToDoListItem {
  UIContext = this.getUIContext()
  @Link achieveData: ToDo[];
  @Link toDoData: ToDo[];
  @ObjectLink toDoItem: ToDo;
  @State isEdited: boolean = false;
  categoryList: Category[] = [];
  onStatusChanged?: (item: ToDo) => void;
  onTodoUpdated?: (item: ToDo) => void;
  onDeleteItem?: (item: ToDo) => void;
  onShowDetail?: (item: ToDo) => void;

  /**
   * Gets the category object for this todo item.
   */
  private getItemCategory(): Category | undefined {
    if (this.toDoItem.category.length === 0) {
      return undefined;
    }
    for (const cat of this.categoryList) {
      if (cat.id === this.toDoItem.category) {
        return cat;
      }
    }
    return undefined;
  }

  /**
   * Checks if the due date is past.
   */
  private isOverdue(): boolean {
    if (this.toDoItem.dueDate <= 0) {
      return false;
    }
    return Date.now() > this.toDoItem.dueDate && !this.toDoItem.isCompleted;
  }

  /**
   * Toggle completion status and notify parent.
   */
  addAchieveData() {
    this.toDoItem.isCompleted = !this.toDoItem.isCompleted;
    this.UIContext.animateTo({ duration: STYLE_CONFIG.ANIMATION_DURATION }, () => {
      if (this.toDoItem.isCompleted) {
        let tempData = this.toDoData.filter(item => item.key !== this.toDoItem.key);
        this.toDoData = tempData;
        this.achieveData.push(this.toDoItem);
      } else {
        let tempData = this.achieveData.filter(item => item.key !== this.toDoItem.key);
        this.achieveData = tempData;
        this.toDoData.push(this.toDoItem);
      }
    });
    if (this.onStatusChanged !== undefined && this.onStatusChanged !== null) {
      this.onStatusChanged(this.toDoItem);
    }
  }

  /**
   * Cycles priority: Low -> Medium -> High -> Low
   */
  private cyclePriority(): void {
    this.toDoItem.priority = (this.toDoItem.priority + 1) % 3;
    if (this.onTodoUpdated !== undefined && this.onTodoUpdated !== null) {
      this.onTodoUpdated(this.toDoItem);
    }
  }

  /**
   * Called when inline edit is confirmed.
   */
  private onEditConfirmed(): void {
    this.isEdited = false;
    if (this.onTodoUpdated !== undefined && this.onTodoUpdated !== null) {
      this.onTodoUpdated(this.toDoItem);
    }
  }

  /**
   * Renders the category label if a category exists.
   */
  @Builder
  categoryLabel(category: Category | undefined) {
    if (category !== undefined) {
      Row() {
        Text(category.name)
          .fontSize(11)
          .fontColor(category.color)
      }
      .padding({ left: 6, right: 6, top: 2, bottom: 2 })
      .borderRadius(8)
      .borderWidth(1)
      .borderColor(category.color)
    }
  }

  build() {
    Column() {
      Row({ space: STYLE_CONFIG.ICON_GUTTER }) {
        if (!this.isEdited) {
          // Priority indicator dot
          Row()
            .width(10)
            .height(10)
            .borderRadius(5)
            .backgroundColor(PRIORITY_COLORS[this.toDoItem.priority])
            .margin({ right: 4 })
            .onClick(() => {
              this.cyclePriority();
            })

          // Checkbox
          Row() {
            if (this.toDoItem.isCompleted) {
              Image($r('app.media.ic_public_ok_filled'))
                .width(STYLE_CONFIG.IMAGE_ICON_OK_SIZE)
                .aspectRatio(1)
                .borderRadius(STYLE_CONFIG.IMAGE_ICON_OK_SIZE)
                .fillColor(Color.White)
                .transition(TransitionEffect.IDENTITY)
            }
          }
          .width(STYLE_CONFIG.CUSTOM_CHECKBOX_SIZE)
          .justifyContent(FlexAlign.Center)
          .aspectRatio(1)
          .borderRadius(STYLE_CONFIG.CUSTOM_CHECKBOX_SIZE)
          .backgroundColor(this.toDoItem.isCompleted ? $r('sys.color.ohos_id_color_floating_button_bg_normal') :
            Color.Transparent)
          .borderWidth(1)
          .borderColor($r('sys.color.ohos_id_color_focused_content_tertiary'))
          .onClick(() => {
            this.addAchieveData();
          })

          // Name
          Text(`${this.toDoItem.name}`)
            .maxLines(1)
            .fontSize($r('sys.float.ohos_id_text_size_headline9'))
            .layoutWeight(1)
            .decoration({ type: this.toDoItem.isCompleted ? TextDecorationType.LineThrough : TextDecorationType.None })
        } else {
          TextInput({ text: `${this.toDoItem.name}` })
            .maxLines(1)
            .fontSize($r('sys.float.ohos_id_text_size_headline9'))
            .layoutWeight(1)
            .backgroundColor(Color.Transparent)
            .id('textEdit')
            .onChange((value: string) => {
              this.toDoItem.name = value;
            })
            .onAppear(() => {
              focusControl.requestFocus('textEdit');
            })
        }
        Blank()
        if (this.isEdited) {
          Image($r('app.media.ic_public_ok_filled'))
            .width(STYLE_CONFIG.MENU_IMAGE_SIZE)
            .aspectRatio(1)
            .onClick(() => {
              this.onEditConfirmed();
            })
        } else {
          Text($r('app.string.edit'))
            .fontColor($r('sys.color.ohos_id_color_text_secondary'))
            .onClick(() => {
              this.isEdited = true;
            })
        }
        Image($r('app.media.ic_public_delete_filled'))
          .width(STYLE_CONFIG.MENU_IMAGE_SIZE)
          .aspectRatio(1)
          .margin({ left: 8 })
          .onClick(() => {
            if (this.onDeleteItem !== undefined && this.onDeleteItem !== null) {
              this.onDeleteItem(this.toDoItem);
            }
          })
      }
      .width(Constant.PERCENT_FULL)

      // Category below the main row (right-aligned, below edit)
      if (!this.isEdited) {
        Row() {
          Blank()
          this.categoryLabel(this.getItemCategory())
        }
        .width('100%')
        .margin({ top: 2 })
      }
    }
    .width(Constant.PERCENT_FULL)
    .padding({
      left: $r('sys.float.ohos_id_default_padding_start'),
      right: $r('sys.float.ohos_id_default_padding_end'),
      top: STYLE_CONFIG.TODO_ITEM_PADDING_VERTICAL,
      bottom: STYLE_CONFIG.TODO_ITEM_PADDING_VERTICAL
    })
    .borderRadius($r('sys.float.ohos_id_corner_radius_default_m'))
    .backgroundColor(Color.White)
    .onClick(() => {
      if (!this.isEdited && this.onShowDetail !== undefined && this.onShowDetail !== null) {
        this.onShowDetail(this.toDoItem);
      }
    })
  }
}