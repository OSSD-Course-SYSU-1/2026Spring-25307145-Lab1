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
import { ToDoListItem } from '../view/TodoListItem';
import { AddTodoDialog } from '../view/AddTodoDialog';
import { STYLE_CONFIG, Constant } from '../common/Constants';
import { DatabaseHelper } from '../common/DatabaseHelper';
import { ContinuationState } from '../entryability/EntryAbility';
import { BusinessError } from '@kit.BasicServicesKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { display } from '@kit.ArkUI';

@Extend(Image)
function ImageStyle() {
  .width(STYLE_CONFIG.IMAGE_SIZE)
  .aspectRatio(1)
  .margin(STYLE_CONFIG.IMAGE_MARGIN)
}

@Entry
@Component
struct ToDoList {
  @State toDoData: ToDo[] = [];
  @State achieveData: ToDo[] = [];
  @State categoryList: Category[] = [];
  @State searchText: string = '';
  @State selectedCategoryFilter: string = '';
  @State isWideScreen: boolean = false;
  @State categoryRefreshKey: number = 0;

  private dbHelper: DatabaseHelper = DatabaseHelper.getInstance();
  private addDialogController: CustomDialogController | null = null;
  private clearConfirmController: CustomDialogController | null = null;
  private addCategoryDialogController: CustomDialogController | null = null;
  private deleteCategoryDialogController: CustomDialogController | null = null;
  private detailDialogController: CustomDialogController | null = null;

  async aboutToAppear(): Promise<void> {
    try {
      // Detect screen width for responsive layout
      try {
        const defaultDisplay = display.getDefaultDisplaySync();
        this.isWideScreen = defaultDisplay.width >= 600;
      } catch (error) {
        // Fallback: assume phone layout if display API unavailable
        this.isWideScreen = false;
      }

      const context = this.getUIContext().getHostContext();
      if (context) {
        await this.dbHelper.initDatabase(context);
        const result = await this.dbHelper.loadAllTodos();
        this.toDoData = result.todoList;
        this.achieveData = result.achieveList;
        this.categoryList = await this.dbHelper.getAllCategories();

        // Restore continuation state (from free flow / cross-device migration)
        if (ContinuationState.searchText.length > 0) {
          this.searchText = ContinuationState.searchText;
        }
        if (ContinuationState.filterCategory.length > 0) {
          this.selectedCategoryFilter = ContinuationState.filterCategory;
        }
      }
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Database init failed: ' + err.message);
    }
  }

  /**
   * Opens the add-todo dialog.
   */
  private openAddDialog(): void {
    this.addDialogController = new CustomDialogController({
      builder: AddTodoDialog({
        categories: this.categoryList,
        onConfirm: (todo: ToDo) => {
          this.onAddTodoConfirm(todo);
        }
      }),
      autoCancel: true,
      customStyle: true,
      cornerRadius: 16
    });
    this.addDialogController.open();
  }

  /**
   * Handles confirmation from the add-todo dialog.
   */
  private async onAddTodoConfirm(todo: ToDo): Promise<void> {
    try {
      await this.dbHelper.insertTodo(todo);
      this.toDoData = [todo, ...this.toDoData];
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Insert todo failed: ' + err.message);
    }
  }

  /**
   * Deletes a to-do/completed item from both DB and UI.
   */
  private async deleteTodoItem(item: ToDo): Promise<void> {
    try {
      await this.dbHelper.deleteTodo(item.key);
      if (item.isCompleted) {
        this.achieveData = this.achieveData.filter(todoItem => item.key !== todoItem.key);
      } else {
        this.toDoData = this.toDoData.filter(todoItem => item.key !== todoItem.key);
      }
      this.getUIContext().getPromptAction().showToast({ message: $r('app.string.deleted') });
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Delete failed: ' + err.message);
    }
  }

  /**
   * Handles completion status toggle - syncs with DB.
   */
  async onTodoStatusChanged(item: ToDo): Promise<void> {
    try {
      await this.dbHelper.updateTodoStatus(item.key, item.isCompleted);
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Update status failed: ' + err.message);
    }
  }

  /**
   * Handles todo update (edit name etc.) - syncs with DB.
   */
  async onTodoUpdated(item: ToDo): Promise<void> {
    try {
      await this.dbHelper.updateTodo(item);
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Update todo failed: ' + err.message);
    }
  }

  /**
   * Shows confirmation dialog before clearing completed items.
   */
  private confirmClearCompleted(): void {
    this.clearConfirmController = new CustomDialogController({
      builder: ConfirmDialog({
        message: 'Clear all completed tasks?',
        onConfirm: () => {
          this.clearAllCompleted();
        }
      }),
      autoCancel: true,
      customStyle: true,
      cornerRadius: 16
    });
    this.clearConfirmController.open();
  }

  private async clearAllCompleted(): Promise<void> {
    try {
      await this.dbHelper.deleteAllCompleted();
      this.achieveData = [];
      this.getUIContext().getPromptAction().showToast({ message: 'Completed tasks cleared' });
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Clear completed failed: ' + err.message);
    }
  }

  /**
   * Shows confirmation dialog before clearing uncompleted items.
   */
  private confirmClearUncompleted(): void {
    this.clearConfirmController = new CustomDialogController({
      builder: ConfirmDialog({
        message: 'Clear all uncompleted tasks?',
        onConfirm: () => {
          this.clearAllUncompleted();
        }
      }),
      autoCancel: true,
      customStyle: true,
      cornerRadius: 16
    });
    this.clearConfirmController.open();
  }

  private async clearAllUncompleted(): Promise<void> {
    try {
      await this.dbHelper.deleteAllUncompleted();
      this.toDoData = [];
      this.getUIContext().getPromptAction().showToast({ message: 'Uncompleted tasks cleared' });
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Clear uncompleted failed: ' + err.message);
    }
  }

  /**
   * Opens the add-category dialog.
   */
  private openAddCategoryDialog(): void {
    this.addCategoryDialogController = new CustomDialogController({
      builder: AddCategoryDialog({
        onConfirm: (name: string, color: string) => {
          this.onAddCategoryConfirm(name, color);
        }
      }),
      autoCancel: true,
      customStyle: true,
      cornerRadius: 16
    });
    this.addCategoryDialogController.open();
  }

  /**
   * Handles confirmation from the add-category dialog.
   */
  private async onAddCategoryConfirm(name: string, color: string): Promise<void> {
    try {
      const category = new Category(name, color);
      await this.dbHelper.insertCategory(category);
      this.categoryList = await this.dbHelper.getAllCategories();
      this.getUIContext().getPromptAction().showToast({ message: 'Category added' });
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Add category failed: ' + err.message);
    }
  }

  /**
   * Shows options dialog for a category (edit / delete).
   */
  private showCategoryOptions(category: Category): void {
    this.deleteCategoryDialogController = new CustomDialogController({
      builder: ConfirmDialog({
        message: 'Category: "' + category.name + '"',
        onConfirm: () => {
          this.openEditCategoryDialog(category);
        },
        onCancelText: 'Delete',
        onCancel: () => {
          this.onDeleteCategory(category);
        },
        confirmText: 'Edit'
      }),
      autoCancel: true,
      customStyle: true,
      cornerRadius: 16
    });
    this.deleteCategoryDialogController.open();
  }

  /**
   * Opens the edit-category dialog with pre-filled values.
   */
  private openEditCategoryDialog(category: Category): void {
    this.addCategoryDialogController = new CustomDialogController({
      builder: EditCategoryDialog({
        categoryId: category.id,
        currentName: category.name,
        currentColor: category.color,
        onConfirm: (name: string, color: string) => {
          this.onEditCategoryConfirm(category.id, name, color);
        }
      }),
      autoCancel: true,
      customStyle: true,
      cornerRadius: 16
    });
    this.addCategoryDialogController.open();
  }

  /**
   * Handles confirmation from the edit-category dialog.
   */
  private async onEditCategoryConfirm(id: string, name: string, color: string): Promise<void> {
    try {
      const category = new Category(name, color);
      category.id = id;
      await this.dbHelper.updateCategory(category);
      // Build a new array with the updated category
      const updatedList: Category[] = [];
      for (const cat of this.categoryList) {
        if (cat.id === id) {
          updatedList.push(category);
        } else {
          updatedList.push(cat);
        }
      }
      this.categoryList = updatedList;
      // Force ForEach to recreate components by changing the key
      this.categoryRefreshKey++;
      this.getUIContext().getPromptAction().showToast({ message: 'Category updated' });
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Update category failed: ' + err.message);
    }
  }

  /**
   * Deletes a category after confirmation.
   */
  private async onDeleteCategory(category: Category): Promise<void> {
    try {
      await this.dbHelper.deleteCategory(category.id);
      this.categoryList = await this.dbHelper.getAllCategories();
      if (this.selectedCategoryFilter === category.id) {
        this.selectedCategoryFilter = '';
        ContinuationState.filterCategory = '';
      }
      this.getUIContext().getPromptAction().showToast({ message: 'Category deleted' });
    } catch (error) {
      let err = error as BusinessError;
      hilog.error(0x0000, 'Index', 'Delete category failed: ' + err.message);
    }
  }

  /**
   * Opens the task detail dialog.
   */
  private openTaskDetail(todo: ToDo): void {
    this.detailDialogController = new CustomDialogController({
      builder: TaskDetailDialog({
        todo: todo,
        categoryList: this.categoryList
      }),
      autoCancel: true,
      customStyle: true,
      cornerRadius: 16
    });
    this.detailDialogController.open();
  }

  /**
   * Gets filtered to-do data based on search text and category filter.
   */
  private getFilteredTodoData(): ToDo[] {
    let data = this.toDoData;
    if (this.searchText.length > 0) {
      data = data.filter(item => item.name.toLowerCase().includes(this.searchText.toLowerCase()));
    }
    if (this.selectedCategoryFilter.length > 0) {
      data = data.filter(item => item.category === this.selectedCategoryFilter);
    }
    return data;
  }

  /**
   * Gets filtered achieved data based on search text and category filter.
   */
  private getFilteredAchieveData(): ToDo[] {
    let data = this.achieveData;
    if (this.searchText.length > 0) {
      data = data.filter(item => item.name.toLowerCase().includes(this.searchText.toLowerCase()));
    }
    if (this.selectedCategoryFilter.length > 0) {
      data = data.filter(item => item.category === this.selectedCategoryFilter);
    }
    return data;
  }

  // Item Swipe left to display the toolbar.
  @Builder
  itemEnd(item: ToDo) {
    Row({ space: STYLE_CONFIG.ICON_GUTTER }) {
      Image($r('app.media.ic_public_settings_filled')).ImageStyle()
        .onClick(() => {
          this.getUIContext().getPromptAction().showToast({ message: $r('app.string.incomplete') });
        })
      Image($r('app.media.ic_public_detail_filled')).ImageStyle()
        .onClick(() => {
          this.getUIContext().getPromptAction().showToast({ message: $r('app.string.incomplete') });
        })
      Image($r('app.media.ic_public_delete_filled')).ImageStyle()
        .onClick(() => {
          this.deleteTodoItem(item);
        })
    }
    .padding(STYLE_CONFIG.OPERATION_BUTTON_PADDING)
    .justifyContent(FlexAlign.SpaceEvenly)
  }

  build() {
    Column() {
      // Header row
      Row({ space: STYLE_CONFIG.LIST_ITEM_GUTTER }) {
        Text($r('app.string.todo'))
          .fontSize($r('sys.float.ohos_id_text_size_headline7'))
        Blank()
        Image($r('app.media.ic_public_add_filled'))
          .width(STYLE_CONFIG.MENU_IMAGE_SIZE)
          .aspectRatio(1)
          .onClick(() => {
            this.openAddDialog();
          })
      }
      .height(Constant.PERCENT_12)
      .width(Constant.PERCENT_FULL)
      .padding({
        left: $r('sys.float.ohos_id_max_padding_start'),
        right: $r('sys.float.ohos_id_max_padding_end'),
      })
      .backgroundColor(Color.White)

      // Search bar
      Search({ placeholder: 'Search tasks...', value: this.searchText })
        .width('100%')
        .height(40)
        .searchButton('')
        .onChange((value: string) => {
          this.searchText = value;
          ContinuationState.searchText = value;
        })
        .margin({
          left: $r('sys.float.ohos_id_default_padding_start'),
          right: $r('sys.float.ohos_id_default_padding_end'),
          bottom: 8
        })

      // Category filter chips
      Scroll() {
        Row({ space: 8 }) {
          // "All" chip
          Button('All')
            .height(32)
            .backgroundColor(this.selectedCategoryFilter.length === 0 ? '#007BFF' : '#E8E8E8')
            .fontColor(this.selectedCategoryFilter.length === 0 ? Color.White : '#333333')
            .borderRadius(16)
            .fontSize(14)
            .onClick(() => {
              this.selectedCategoryFilter = '';
              ContinuationState.filterCategory = '';
            })

          ForEach(this.categoryList, (category: Category) => {
            Text(category.name)
              .height(32)
              .padding({ left: 14, right: 14 })
              .textAlign(TextAlign.Center)
              .fontSize(14)
              .backgroundColor(this.selectedCategoryFilter === category.id ? category.color : '#E8E8E8')
              .fontColor(this.selectedCategoryFilter === category.id ? Color.White : '#333333')
              .borderRadius(16)
              .gesture(
                GestureGroup(GestureMode.Exclusive,
                  TapGesture()
                    .onAction(() => {
                      this.selectedCategoryFilter = this.selectedCategoryFilter === category.id ? '' : category.id;
                      ContinuationState.filterCategory = this.selectedCategoryFilter;
                    }),
                  LongPressGesture({ repeat: false, duration: 500 })
                    .onAction(() => {
                      this.showCategoryOptions(category);
                    })
                )
              )
          }, (category: Category) => category.id + '_' + this.categoryRefreshKey)

          // Add category button
          Button('+')
            .height(32)
            .width(32)
            .backgroundColor('#007BFF')
            .fontColor(Color.White)
            .borderRadius(16)
            .fontSize(20)
            .margin({ left: 8 })
            .onClick(() => {
              this.openAddCategoryDialog();
            })
        }
        .padding({
          left: $r('sys.float.ohos_id_default_padding_start'),
          right: $r('sys.float.ohos_id_default_padding_end')
        })
      }
      .scrollable(ScrollDirection.Horizontal)
      .scrollBar(BarState.Off)
      .width('100%')
      .height(44)

      // To-do list - responsive layout
      if (this.isWideScreen) {
        // Tablet/Foldable: two-column layout
        Row() {
          // Ongoing column
          Column() {
            Row() {
              Text($r('app.string.undo'))
                .fontSize($r('sys.float.ohos_id_text_size_headline8'))
              Blank()
              Text('Clear')
                .fontSize(14)
                .fontColor('#E74C3C')
                .onClick(() => {
                  this.confirmClearUncompleted();
                })
            }
            .width('100%')
            .margin({ bottom: 8 })

            List({ initialIndex: 0, space: STYLE_CONFIG.LIST_ITEM_GUTTER }) {
              ForEach(this.getFilteredTodoData(), (toDoItem: ToDo) => {
                ListItem() {
                  ToDoListItem({
                    toDoItem: toDoItem,
                    achieveData: this.achieveData,
                    toDoData: this.toDoData,
                    categoryList: this.categoryList,
                    onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                    onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                    onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                    onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                  })
                }
                .swipeAction({ end: this.itemEnd(toDoItem), edgeEffect: SwipeEdgeEffect.Spring })
              }, (toDoItem: ToDo) => toDoItem.key)
            }
            .layoutWeight(1)
            .listDirection(Axis.Vertical)
            .edgeEffect(EdgeEffect.Spring)
          }
          .layoutWeight(1)
          .padding({ right: 8 })

          // Completed column
          Column() {
            Row() {
              Text($r('app.string.done'))
                .fontSize($r('sys.float.ohos_id_text_size_headline8'))
              Blank()
              Text('Clear')
                .fontSize(14)
                .fontColor('#E74C3C')
                .onClick(() => {
                  this.confirmClearCompleted();
                })
            }
            .width('100%')
            .margin({ bottom: 8 })

            List({ initialIndex: 0, space: STYLE_CONFIG.LIST_ITEM_GUTTER }) {
              ForEach(this.getFilteredAchieveData(), (toDoItem: ToDo) => {
                ListItem() {
                  ToDoListItem({
                    toDoItem: toDoItem,
                    achieveData: this.achieveData,
                    toDoData: this.toDoData,
                    categoryList: this.categoryList,
                    onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                    onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                    onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                    onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                  })
                }
                .swipeAction({ end: this.itemEnd(toDoItem), edgeEffect: SwipeEdgeEffect.Spring })
              }, (toDoItem: ToDo) => toDoItem.key)
            }
            .layoutWeight(1)
            .listDirection(Axis.Vertical)
            .edgeEffect(EdgeEffect.Spring)
          }
          .layoutWeight(1)
          .padding({ left: 8 })
        }
        .layoutWeight(1)
        .padding({
          top: $r('sys.float.ohos_id_default_padding_top'),
          left: $r('sys.float.ohos_id_default_padding_start'),
          right: $r('sys.float.ohos_id_default_padding_end'),
        })
      } else {
        // Phone: single-column layout
        List({ initialIndex: 0, space: STYLE_CONFIG.LIST_ITEM_GUTTER }) {
          // Ongoing section
          if (this.getFilteredTodoData().length !== 0) {
            ListItem() {
              Row() {
                Text($r('app.string.undo'))
                  .fontSize($r('sys.float.ohos_id_text_size_headline8'))
                Blank()
                Text('Clear')
                  .fontSize(14)
                  .fontColor('#E74C3C')
                  .onClick(() => {
                    this.confirmClearUncompleted();
                  })
              }
              .width('100%')
            }
          }
          ForEach(this.getFilteredTodoData(), (toDoItem: ToDo) => {
            ListItem() {
              ToDoListItem({
                toDoItem: toDoItem,
                achieveData: this.achieveData,
                toDoData: this.toDoData,
                categoryList: this.categoryList,
                onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                onShowDetail: (item: ToDo) => this.openTaskDetail(item)
              })
            }
            .swipeAction({ end: this.itemEnd(toDoItem), edgeEffect: SwipeEdgeEffect.Spring })
          }, (toDoItem: ToDo) => toDoItem.key)

          // Completed section
          if (this.getFilteredAchieveData().length !== 0) {
            ListItem() {
              Row() {
                Text($r('app.string.done'))
                  .fontSize($r('sys.float.ohos_id_text_size_headline8'))
                Blank()
                Text('Clear')
                  .fontSize(14)
                  .fontColor('#E74C3C')
                  .onClick(() => {
                    this.confirmClearCompleted();
                  })
              }
              .width('100%')
            }
          }
          ForEach(this.getFilteredAchieveData(), (toDoItem: ToDo) => {
            ListItem() {
              ToDoListItem({
                toDoItem: toDoItem,
                achieveData: this.achieveData,
                toDoData: this.toDoData,
                categoryList: this.categoryList,
                onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                onShowDetail: (item: ToDo) => this.openTaskDetail(item)
              })
            }
            .swipeAction({ end: this.itemEnd(toDoItem), edgeEffect: SwipeEdgeEffect.Spring })
          }, (toDoItem: ToDo) => toDoItem.key)
        }
        .layoutWeight(1)
        .listDirection(Axis.Vertical)
        .edgeEffect(EdgeEffect.Spring)
        .padding({
          top: $r('sys.float.ohos_id_default_padding_top'),
          left: $r('sys.float.ohos_id_default_padding_start'),
          right: $r('sys.float.ohos_id_default_padding_end'),
        })
      }
    }
    .backgroundColor($r('app.color.background_color'))
    .height(Constant.PERCENT_FULL)
    .width(Constant.PERCENT_FULL)
  }
}

/**
 * Confirmation / option dialog with customizable button text.
 */
@CustomDialog
struct ConfirmDialog {
  controller?: CustomDialogController;
  message: string = '';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText: string = 'Confirm';
  onCancelText: string = 'Cancel';

  build() {
    Column() {
      Text(this.message)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .textAlign(TextAlign.Center)
        .width('100%')
        .margin({ bottom: 24 })

      Row({ space: 12 }) {
        Button(this.onCancelText)
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#E8E8E8')
          .fontColor('#333333')
          .borderRadius(20)
          .onClick(() => {
            if (this.onCancel !== undefined && this.onCancel !== null) {
              this.onCancel();
            }
            if (this.controller !== undefined && this.controller !== null) {
              this.controller.close();
            }
          })

        Button(this.confirmText)
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#007BFF')
          .fontColor(Color.White)
          .borderRadius(20)
          .onClick(() => {
            if (this.onConfirm !== undefined && this.onConfirm !== null) {
              this.onConfirm();
            }
            if (this.controller !== undefined && this.controller !== null) {
              this.controller.close();
            }
          })
      }
      .width('100%')
    }
    .width('100%')
    .padding(24)
    .backgroundColor(Color.White)
    .borderRadius(16)
  }
}

/**
 * Preset colors for category selection.
 */
const CATEGORY_COLORS: string[] = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#95A5A6',
  '#9B59B6', '#FF9FF3', '#54A0FF', '#5F27CD', '#01CBC6',
  '#FF6348', '#7BED9F', '#70A1FF', '#FFA502', '#2ED573'
];

/**
 * Dialog for adding a new category.
 */
@CustomDialog
struct AddCategoryDialog {
  controller?: CustomDialogController;
  onConfirm?: (name: string, color: string) => void;

  @State categoryName: string = '';
  @State selectedColor: string = CATEGORY_COLORS[0];
  @State nameError: string = '';

  private resetForm(): void {
    this.categoryName = '';
    this.selectedColor = CATEGORY_COLORS[0];
    this.nameError = '';
  }

  build() {
    Column() {
      Text('Add Category')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .width('100%')
        .textAlign(TextAlign.Start)
        .margin({ bottom: 16 })

      // Category name input
      TextInput({ placeholder: 'Category name...', text: this.categoryName })
        .width('100%')
        .height(48)
        .onChange((value: string) => {
          this.categoryName = value;
          this.nameError = '';
        })

      if (this.nameError.length > 0) {
        Text(this.nameError)
          .fontSize(12)
          .fontColor(Color.Red)
          .width('100%')
          .margin({ top: 4 })
      }

      // Color picker
      Text('Choose Color')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .width('100%')
        .margin({ top: 16, bottom: 8 })

      Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Center }) {
        ForEach(CATEGORY_COLORS, (color: string) => {
          Row()
            .width(36)
            .height(36)
            .borderRadius(18)
            .backgroundColor(color)
            .margin(4)
            .borderWidth(this.selectedColor === color ? 3 : 0)
            .borderColor('#333333')
            .onClick(() => {
              this.selectedColor = color;
            })
        }, (color: string) => color)
      }
      .width('100%')
      .margin({ bottom: 24 })

      // Buttons
      Row({ space: 12 }) {
        Button('Cancel')
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#E8E8E8')
          .fontColor('#333333')
          .borderRadius(20)
          .onClick(() => {
            this.resetForm();
            if (this.controller !== undefined && this.controller !== null) {
              this.controller.close();
            }
          })

        Button('Add')
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#007BFF')
          .fontColor(Color.White)
          .borderRadius(20)
          .onClick(() => {
            const trimmed = this.categoryName.trim();
            if (trimmed.length === 0) {
              this.nameError = 'Name cannot be empty';
              return;
            }
            if (this.onConfirm !== undefined && this.onConfirm !== null) {
              this.onConfirm(trimmed, this.selectedColor);
            }
            this.resetForm();
            if (this.controller !== undefined && this.controller !== null) {
              this.controller.close();
            }
          })
      }
      .width('100%')
    }
    .width('100%')
    .padding(24)
    .backgroundColor(Color.White)
    .borderRadius(16)
  }
}

/**
 * Priority label mapping for detail display.
 */
const PRIORITY_LABEL_MAP: string[] = ['Low', 'Medium', 'High'];

/**
 * Dialog for viewing task details.
 */
@CustomDialog
struct TaskDetailDialog {
  controller?: CustomDialogController;
  todo: ToDo | null = null;
  categoryList: Category[] = [];

  /**
   * Gets the category name for this todo item.
   */
  private getCategoryName(): string {
    if (this.todo === null || this.todo.category.length === 0) {
      return 'None';
    }
    for (const cat of this.categoryList) {
      if (cat.id === this.todo.category) {
        return cat.name;
      }
    }
    return 'Unknown';
  }

  /**
   * Gets the category color for this todo item.
   */
  private getCategoryColor(): string {
    if (this.todo === null || this.todo.category.length === 0) {
      return '#999999';
    }
    for (const cat of this.categoryList) {
      if (cat.id === this.todo.category) {
        return cat.color;
      }
    }
    return '#999999';
  }

  /**
   * Formats a timestamp to a readable date string.
   */
  private formatDate(timestamp: number): string {
    if (timestamp <= 0) {
      return 'None';
    }
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
  }

  build() {
    Column() {
      // Title
      if (this.todo !== null) {
        Text(`${this.todo.name}`)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .width('100%')
          .textAlign(TextAlign.Start)
          .margin({ bottom: 20 })

        // Category
        DetailRow({ label: 'Category', value: this.getCategoryName(), valueColor: this.getCategoryColor() })

        // Due date
        DetailRow({ label: 'Due Date', value: this.formatDate(this.todo.dueDate) })

        // Priority
        DetailRow({ label: 'Priority', value: PRIORITY_LABEL_MAP[this.todo.priority] })

        // Notes
        if (this.todo.notes.length > 0) {
          Text('Notes')
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#666666')
            .width('100%')
            .margin({ top: 12 })

          Text(this.todo.notes)
            .fontSize(16)
            .width('100%')
            .margin({ top: 4 })
        }

        // Close button
        Button('Close')
          .height(40)
          .width('100%')
          .backgroundColor('#007BFF')
          .fontColor(Color.White)
          .borderRadius(20)
          .margin({ top: 24 })
          .onClick(() => {
            if (this.controller !== undefined && this.controller !== null) {
              this.controller.close();
            }
          })
      }
    }
    .width('100%')
    .padding(24)
    .backgroundColor(Color.White)
    .borderRadius(16)
  }
}

/**
 * Reusable row component for detail display.
 */
@Component
struct DetailRow {
  label: string = '';
  value: string = '';
  valueColor: string = '#333333';

  build() {
    Row() {
      Text(this.label)
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor('#666666')
      Blank()
      Text(this.value)
        .fontSize(16)
        .fontColor(this.valueColor)
    }
    .width('100%')
    .margin({ top: 8, bottom: 8 })
  }
}

/**
 * Dialog for editing an existing category (rename / change color).
 */
@CustomDialog
struct EditCategoryDialog {
  controller?: CustomDialogController;
  categoryId: string = '';
  currentName: string = '';
  currentColor: string = '';
  onConfirm?: (name: string, color: string) => void;

  @State editName: string = '';
  @State editColor: string = '';
  @State nameError: string = '';

  build() {
    Column() {
      Text('Edit Category')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .width('100%')
        .textAlign(TextAlign.Start)
        .margin({ bottom: 16 })

      // Category name input (pre-filled with currentName)
      TextInput({ placeholder: 'Category name...', text: this.currentName })
        .width('100%')
        .height(48)
        .onChange((value: string) => {
          this.editName = value;
          this.nameError = '';
        })

      if (this.nameError.length > 0) {
        Text(this.nameError)
          .fontSize(12)
          .fontColor(Color.Red)
          .width('100%')
          .margin({ top: 4 })
      }

      // Color picker
      Text('Choose Color')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .width('100%')
        .margin({ top: 16, bottom: 8 })

      Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Center }) {
        ForEach(CATEGORY_COLORS, (color: string) => {
          Row()
            .width(36)
            .height(36)
            .borderRadius(18)
            .backgroundColor(color)
            .margin(4)
            .borderWidth(this.getSelectedColor() === color ? 3 : 0)
            .borderColor('#333333')
            .onClick(() => {
              this.editColor = color;
            })
        }, (color: string) => color)
      }
      .width('100%')
      .margin({ bottom: 24 })

      // Buttons
      Row({ space: 12 }) {
        Button('Cancel')
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#E8E8E8')
          .fontColor('#333333')
          .borderRadius(20)
          .onClick(() => {
            if (this.controller !== undefined && this.controller !== null) {
              this.controller.close();
            }
          })

        Button('Save')
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#007BFF')
          .fontColor(Color.White)
          .borderRadius(20)
          .onClick(() => {
            const name = this.editName.length > 0 ? this.editName : this.currentName;
            const trimmed = name.trim();
            if (trimmed.length === 0) {
              this.nameError = 'Name cannot be empty';
              return;
            }
            const color = this.editColor.length > 0 ? this.editColor : this.currentColor;
            if (this.onConfirm !== undefined && this.onConfirm !== null) {
              this.onConfirm(trimmed, color);
            }
            if (this.controller !== undefined && this.controller !== null) {
              this.controller.close();
            }
          })
      }
      .width('100%')
    }
    .width('100%')
    .padding(24)
    .backgroundColor(Color.White)
    .borderRadius(16)
  }

  /**
   * Returns the effective selected color (user-chosen or initial).
   */
  private getSelectedColor(): string {
    return this.editColor.length > 0 ? this.editColor : this.currentColor;
  }
}