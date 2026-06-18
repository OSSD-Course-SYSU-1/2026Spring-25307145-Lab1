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

import { ToDo } from '../model/ToDo';
import { Category } from '../model/Category';

/**
 * Date picker range generation
 */
const YEAR_RANGE: string[] = [];
const START_YEAR = 2020;
const END_YEAR = 2040;
for (let y = START_YEAR; y <= END_YEAR; y++) {
  YEAR_RANGE.push(y + '年');
}
const MONTH_RANGE: string[] = ['1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'];
const DAY_RANGE: string[] = [];
for (let d = 1; d <= 31; d++) {
  DAY_RANGE.push(d + '日');
}

/**
 * Priority constants
 */
const PRIORITY_LOW: number = 0;
const PRIORITY_MEDIUM: number = 1;
const PRIORITY_HIGH: number = 2;

const PRIORITY_LABELS: string[] = ['Low', 'Medium', 'High'];
const PRIORITY_COLORS: string[] = ['#2ECC71', '#F39C12', '#E74C3C'];

@CustomDialog
export struct AddTodoDialog {
  controller?: CustomDialogController;
  categories: Category[] = [];
  onConfirm?: (todo: ToDo) => void;

  @State todoName: string = '';
  @State selectedPriority: number = PRIORITY_MEDIUM;
  @State hasDueDate: boolean = false;
  @State selectedDate: Date = new Date();
  @State selectedHour: number = new Date().getHours();
  @State selectedMinute: number = new Date().getMinutes();
  @State selectedCategory: string = '';
  @State todoNotes: string = '';
  @State nameError: string = '';

  // Initial display indices for TextPickers (non-@State to avoid re-render loop)
  private initialYearIndex: number = this.selectedDate.getFullYear() - START_YEAR;
  private initialMonthIndex: number = this.selectedDate.getMonth();
  private initialDayIndex: number = this.selectedDate.getDate() - 1;

  private getDueDateTime(): number {
    if (!this.hasDueDate) {
      return 0;
    }
    const date = new Date(this.selectedDate);
    date.setHours(this.selectedHour, this.selectedMinute, 0, 0);
    return date.getTime();
  }

  private resetForm(): void {
    this.todoName = '';
    this.selectedPriority = PRIORITY_MEDIUM;
    this.hasDueDate = false;
    const now = new Date();
    this.selectedDate = now;
    this.selectedHour = now.getHours();
    this.selectedMinute = now.getMinutes();
    this.selectedCategory = '';
    this.todoNotes = '';
    this.nameError = '';
    this.initialYearIndex = now.getFullYear() - START_YEAR;
    this.initialMonthIndex = now.getMonth();
    this.initialDayIndex = now.getDate() - 1;
  }

  private onDialogConfirm(): void {
    const trimmedName = this.todoName.trim();
    if (trimmedName.length === 0) {
      this.nameError = 'Task name cannot be empty';
      return;
    }

    const todo = new ToDo(trimmedName);
    todo.priority = this.selectedPriority;
    todo.dueDate = this.getDueDateTime();
    todo.category = this.selectedCategory;
    todo.notes = this.todoNotes;
    todo.createTime = Date.now();
    todo.updateTime = Date.now();

    if (this.onConfirm !== undefined && this.onConfirm !== null) {
      this.onConfirm(todo);
    }
    this.resetForm();
    if (this.controller !== undefined && this.controller !== null) {
      this.controller.close();
    }
  }

  private onDialogCancel(): void {
    this.resetForm();
    if (this.controller !== undefined && this.controller !== null) {
      this.controller.close();
    }
  }

  build() {
    Column() {
      // Title
      Text('Add Task')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .width('100%')
        .textAlign(TextAlign.Start)
        .margin({ bottom: 16 })

      // Scrollable form area
      Scroll() {
        Column() {
          // Task name input
          TextInput({ placeholder: 'Enter task name...', text: this.todoName })
            .width('100%')
            .height(48)
            .onChange((value: string) => {
              this.todoName = value;
              this.nameError = '';
            })

          // Error message
          if (this.nameError.length > 0) {
            Text(this.nameError)
              .fontSize(12)
              .fontColor(Color.Red)
              .width('100%')
              .margin({ top: 4 })
          }

          // Notes input
          Text('Notes')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .width('100%')
            .margin({ top: 16, bottom: 8 })

          TextArea({ placeholder: 'Add notes...', text: this.todoNotes })
            .width('100%')
            .height(80)
            .onChange((value: string) => {
              this.todoNotes = value;
            })

          // Priority selector
          Text('Priority')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .width('100%')
            .margin({ top: 16, bottom: 8 })

          Row({ space: 8 }) {
            ForEach([PRIORITY_LOW, PRIORITY_MEDIUM, PRIORITY_HIGH], (priority: number) => {
              Button(PRIORITY_LABELS[priority])
                .height(36)
                .backgroundColor(this.selectedPriority === priority ? PRIORITY_COLORS[priority] : '#E8E8E8')
                .fontColor(this.selectedPriority === priority ? Color.White : '#333333')
                .borderRadius(18)
                .onClick(() => {
                  this.selectedPriority = priority;
                })
            })
          }
          .width('100%')
          .justifyContent(FlexAlign.SpaceEvenly)

          // Due date toggle (tappable to expand/collapse)
          Row({ space: 12 }) {
            Text('Due Date')
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
            Blank()
            Toggle({ type: ToggleType.Switch, isOn: this.hasDueDate })
              .onChange((value: boolean) => {
                this.hasDueDate = value;
              })
          }
          .width('100%')
          .margin({ top: 16 })
          .onClick(() => {
            this.hasDueDate = !this.hasDueDate;
          })

          // Date and Time pickers (only visible when hasDueDate is true)
          if (this.hasDueDate) {
            Column() {
              // Three independent TextPickers for year, month, day
              Row({ space: 4 }) {
                TextPicker({ range: YEAR_RANGE, selected: this.initialYearIndex })
                  .width(100)
                  .onChange((value: string | string[], index: number | number[]) => {
                    const idx = index as number;
                    const year = START_YEAR + idx;
                    const newDate = new Date(this.selectedDate);
                    newDate.setFullYear(year);
                    // Sync day index after potential overflow (e.g., Feb 29 in non-leap year)
                    this.selectedDate = newDate;
                  })

                TextPicker({ range: MONTH_RANGE, selected: this.initialMonthIndex })
                  .width(80)
                  .onChange((value: string | string[], index: number | number[]) => {
                    const idx = index as number;
                    const newDate = new Date(this.selectedDate);
                    newDate.setMonth(idx);
                    // Sync day index after potential overflow (e.g., 31 -> Feb)
                    this.selectedDate = newDate;
                  })

                TextPicker({ range: DAY_RANGE, selected: this.initialDayIndex })
                  .width(80)
                  .onChange((value: string | string[], index: number | number[]) => {
                    const idx = index as number;
                    const newDate = new Date(this.selectedDate);
                    newDate.setDate(idx + 1);
                    this.selectedDate = newDate;
                  })
              }
              .width('100%')
              .justifyContent(FlexAlign.Center)

              Row({ space: 8 }) {
                Text('Time:')
                  .fontSize(16)
                TimePicker({
                  selected: new Date(0, 0, 0, this.selectedHour, this.selectedMinute)
                })
                  .width(120)
                  .onChange((value: TimePickerResult) => {
                    if (value.hour !== undefined) {
                      this.selectedHour = value.hour;
                    }
                    if (value.minute !== undefined) {
                      this.selectedMinute = value.minute;
                    }
                  })
                Blank()
              }
              .width('100%')
              .margin({ top: 8 })
            }
            .width('100%')
          }

          // Category selector
          Text('Category')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .width('100%')
            .margin({ top: 16, bottom: 8 })

          Scroll() {
            Row({ space: 8 }) {
              // "None" option
              Button('None')
                .height(32)
                .backgroundColor(this.selectedCategory.length === 0 ? '#007BFF' : '#E8E8E8')
                .fontColor(this.selectedCategory.length === 0 ? Color.White : '#333333')
                .borderRadius(16)
                .fontSize(14)
                .onClick(() => {
                  this.selectedCategory = '';
                })

              ForEach(this.categories, (category: Category) => {
                Button(category.name)
                  .height(32)
                  .backgroundColor(this.selectedCategory === category.id ? category.color : '#E8E8E8')
                  .fontColor(this.selectedCategory === category.id ? Color.White : '#333333')
                  .borderRadius(16)
                  .fontSize(14)
                  .onClick(() => {
                    this.selectedCategory = category.id;
                  })
              })
            }
            .padding({ right: 24 })
          }
          .scrollable(ScrollDirection.Horizontal)
          .scrollBar(BarState.Off)
          .width('100%')
          .height(48)
        }
        .width('100%')
      }
      .scrollable(ScrollDirection.Vertical)
      .scrollBar(BarState.Off)
      .layoutWeight(1)
      .width('100%')

      // Confirm and Cancel buttons
      Row({ space: 12 }) {
        Button('Cancel')
          .height(40)
          .width(100)
          .backgroundColor('#E8E8E8')
          .fontColor('#333333')
          .borderRadius(20)
          .onClick(() => {
            this.onDialogCancel();
          })

        Blank()

        Button('Confirm')
          .height(40)
          .width(100)
          .backgroundColor('#007BFF')
          .fontColor(Color.White)
          .borderRadius(20)
          .onClick(() => {
            this.onDialogConfirm();
          })
      }
      .width('100%')
      .margin({ top: 20 })
    }
    .width('100%')
    .padding(24)
    .backgroundColor(Color.White)
    .borderRadius(16)
  }
}
