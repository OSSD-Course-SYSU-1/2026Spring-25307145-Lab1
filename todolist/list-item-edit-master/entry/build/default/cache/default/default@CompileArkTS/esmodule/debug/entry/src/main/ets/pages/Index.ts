if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface EditCategoryDialog_Params {
    controller?: CustomDialogController;
    categoryId?: string;
    currentName?: string;
    currentColor?: string;
    onConfirm?: (name: string, color: string) => void;
    editName?: string;
    editColor?: string;
    nameError?: string;
}
interface DetailRow_Params {
    label?: string;
    value?: string;
    valueColor?: string;
}
interface TaskDetailDialog_Params {
    controller?: CustomDialogController;
    todo?: ToDo | null;
    categoryList?: Category[];
}
interface AddCategoryDialog_Params {
    controller?: CustomDialogController;
    onConfirm?: (name: string, color: string) => void;
    categoryName?: string;
    selectedColor?: string;
    nameError?: string;
}
interface ConfirmDialog_Params {
    controller?: CustomDialogController;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    onCancelText?: string;
}
interface ToDoList_Params {
    toDoData?: ToDo[];
    achieveData?: ToDo[];
    categoryList?: Category[];
    searchText?: string;
    selectedCategoryFilter?: string;
    isWideScreen?: boolean;
    categoryRefreshKey?: number;
    dbHelper?: DatabaseHelper;
    addDialogController?: CustomDialogController | null;
    clearConfirmController?: CustomDialogController | null;
    addCategoryDialogController?: CustomDialogController | null;
    deleteCategoryDialogController?: CustomDialogController | null;
    detailDialogController?: CustomDialogController | null;
}
import type { ToDo } from '../model/ToDo';
import { Category } from "@bundle:com.example.listitemedit/entry/ets/model/Category";
import { ToDoListItem } from "@bundle:com.example.listitemedit/entry/ets/view/TodoListItem";
import { AddTodoDialog } from "@bundle:com.example.listitemedit/entry/ets/view/AddTodoDialog";
import { STYLE_CONFIG, Constant } from "@bundle:com.example.listitemedit/entry/ets/common/Constants";
import { DatabaseHelper } from "@bundle:com.example.listitemedit/entry/ets/common/DatabaseHelper";
import { ContinuationState } from "@bundle:com.example.listitemedit/entry/ets/entryability/EntryAbility";
import type { BusinessError } from "@ohos:base";
import hilog from "@ohos:hilog";
import display from "@ohos:display";
function __Image__ImageStyle(): void {
    Image.width(STYLE_CONFIG.IMAGE_SIZE);
    Image.aspectRatio(1);
    Image.margin(STYLE_CONFIG.IMAGE_MARGIN);
}
class ToDoList extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__toDoData = new ObservedPropertyObjectPU([], this, "toDoData");
        this.__achieveData = new ObservedPropertyObjectPU([], this, "achieveData");
        this.__categoryList = new ObservedPropertyObjectPU([], this, "categoryList");
        this.__searchText = new ObservedPropertySimplePU('', this, "searchText");
        this.__selectedCategoryFilter = new ObservedPropertySimplePU('', this, "selectedCategoryFilter");
        this.__isWideScreen = new ObservedPropertySimplePU(false, this, "isWideScreen");
        this.__categoryRefreshKey = new ObservedPropertySimplePU(0, this, "categoryRefreshKey");
        this.dbHelper = DatabaseHelper.getInstance();
        this.addDialogController = null;
        this.clearConfirmController = null;
        this.addCategoryDialogController = null;
        this.deleteCategoryDialogController = null;
        this.detailDialogController = null;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ToDoList_Params) {
        if (params.toDoData !== undefined) {
            this.toDoData = params.toDoData;
        }
        if (params.achieveData !== undefined) {
            this.achieveData = params.achieveData;
        }
        if (params.categoryList !== undefined) {
            this.categoryList = params.categoryList;
        }
        if (params.searchText !== undefined) {
            this.searchText = params.searchText;
        }
        if (params.selectedCategoryFilter !== undefined) {
            this.selectedCategoryFilter = params.selectedCategoryFilter;
        }
        if (params.isWideScreen !== undefined) {
            this.isWideScreen = params.isWideScreen;
        }
        if (params.categoryRefreshKey !== undefined) {
            this.categoryRefreshKey = params.categoryRefreshKey;
        }
        if (params.dbHelper !== undefined) {
            this.dbHelper = params.dbHelper;
        }
        if (params.addDialogController !== undefined) {
            this.addDialogController = params.addDialogController;
        }
        if (params.clearConfirmController !== undefined) {
            this.clearConfirmController = params.clearConfirmController;
        }
        if (params.addCategoryDialogController !== undefined) {
            this.addCategoryDialogController = params.addCategoryDialogController;
        }
        if (params.deleteCategoryDialogController !== undefined) {
            this.deleteCategoryDialogController = params.deleteCategoryDialogController;
        }
        if (params.detailDialogController !== undefined) {
            this.detailDialogController = params.detailDialogController;
        }
    }
    updateStateVars(params: ToDoList_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__toDoData.purgeDependencyOnElmtId(rmElmtId);
        this.__achieveData.purgeDependencyOnElmtId(rmElmtId);
        this.__categoryList.purgeDependencyOnElmtId(rmElmtId);
        this.__searchText.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedCategoryFilter.purgeDependencyOnElmtId(rmElmtId);
        this.__isWideScreen.purgeDependencyOnElmtId(rmElmtId);
        this.__categoryRefreshKey.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__toDoData.aboutToBeDeleted();
        this.__achieveData.aboutToBeDeleted();
        this.__categoryList.aboutToBeDeleted();
        this.__searchText.aboutToBeDeleted();
        this.__selectedCategoryFilter.aboutToBeDeleted();
        this.__isWideScreen.aboutToBeDeleted();
        this.__categoryRefreshKey.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __toDoData: ObservedPropertyObjectPU<ToDo[]>;
    get toDoData() {
        return this.__toDoData.get();
    }
    set toDoData(newValue: ToDo[]) {
        this.__toDoData.set(newValue);
    }
    private __achieveData: ObservedPropertyObjectPU<ToDo[]>;
    get achieveData() {
        return this.__achieveData.get();
    }
    set achieveData(newValue: ToDo[]) {
        this.__achieveData.set(newValue);
    }
    private __categoryList: ObservedPropertyObjectPU<Category[]>;
    get categoryList() {
        return this.__categoryList.get();
    }
    set categoryList(newValue: Category[]) {
        this.__categoryList.set(newValue);
    }
    private __searchText: ObservedPropertySimplePU<string>;
    get searchText() {
        return this.__searchText.get();
    }
    set searchText(newValue: string) {
        this.__searchText.set(newValue);
    }
    private __selectedCategoryFilter: ObservedPropertySimplePU<string>;
    get selectedCategoryFilter() {
        return this.__selectedCategoryFilter.get();
    }
    set selectedCategoryFilter(newValue: string) {
        this.__selectedCategoryFilter.set(newValue);
    }
    private __isWideScreen: ObservedPropertySimplePU<boolean>;
    get isWideScreen() {
        return this.__isWideScreen.get();
    }
    set isWideScreen(newValue: boolean) {
        this.__isWideScreen.set(newValue);
    }
    private __categoryRefreshKey: ObservedPropertySimplePU<number>;
    get categoryRefreshKey() {
        return this.__categoryRefreshKey.get();
    }
    set categoryRefreshKey(newValue: number) {
        this.__categoryRefreshKey.set(newValue);
    }
    private dbHelper: DatabaseHelper;
    private addDialogController: CustomDialogController | null;
    private clearConfirmController: CustomDialogController | null;
    private addCategoryDialogController: CustomDialogController | null;
    private deleteCategoryDialogController: CustomDialogController | null;
    private detailDialogController: CustomDialogController | null;
    async aboutToAppear(): Promise<void> {
        try {
            // Detect screen width for responsive layout
            try {
                const defaultDisplay = display.getDefaultDisplaySync();
                this.isWideScreen = defaultDisplay.width >= 600;
            }
            catch (error) {
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
        }
        catch (error) {
            let err = error as BusinessError;
            hilog.error(0x0000, 'Index', 'Database init failed: ' + err.message);
        }
    }
    /**
     * Opens the add-todo dialog.
     */
    private openAddDialog(): void {
        this.addDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new AddTodoDialog(this, {
                    categories: this.categoryList,
                    onConfirm: (todo: ToDo) => {
                        this.onAddTodoConfirm(todo);
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 90, col: 16 });
                jsDialog.setController(this.addDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        categories: this.categoryList,
                        onConfirm: (todo: ToDo) => {
                            this.onAddTodoConfirm(todo);
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            customStyle: true,
            cornerRadius: 16
        }, this);
        this.addDialogController.open();
    }
    /**
     * Handles confirmation from the add-todo dialog.
     */
    private async onAddTodoConfirm(todo: ToDo): Promise<void> {
        try {
            await this.dbHelper.insertTodo(todo);
            this.toDoData = [todo, ...this.toDoData];
        }
        catch (error) {
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
            }
            else {
                this.toDoData = this.toDoData.filter(todoItem => item.key !== todoItem.key);
            }
            this.getUIContext().getPromptAction().showToast({ message: { "id": 16777220, "type": 10003, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" } });
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            let err = error as BusinessError;
            hilog.error(0x0000, 'Index', 'Update todo failed: ' + err.message);
        }
    }
    /**
     * Shows confirmation dialog before clearing completed items.
     */
    private confirmClearCompleted(): void {
        this.clearConfirmController = new CustomDialogController({
            builder: () => {
                let jsDialog = new ConfirmDialog(this, {
                    message: 'Clear all completed tasks?',
                    onConfirm: () => {
                        this.clearAllCompleted();
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 163, col: 16 });
                jsDialog.setController(this.clearConfirmController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        message: 'Clear all completed tasks?',
                        onConfirm: () => {
                            this.clearAllCompleted();
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            customStyle: true,
            cornerRadius: 16
        }, this);
        this.clearConfirmController.open();
    }
    private async clearAllCompleted(): Promise<void> {
        try {
            await this.dbHelper.deleteAllCompleted();
            this.achieveData = [];
            this.getUIContext().getPromptAction().showToast({ message: 'Completed tasks cleared' });
        }
        catch (error) {
            let err = error as BusinessError;
            hilog.error(0x0000, 'Index', 'Clear completed failed: ' + err.message);
        }
    }
    /**
     * Shows confirmation dialog before clearing uncompleted items.
     */
    private confirmClearUncompleted(): void {
        this.clearConfirmController = new CustomDialogController({
            builder: () => {
                let jsDialog = new ConfirmDialog(this, {
                    message: 'Clear all uncompleted tasks?',
                    onConfirm: () => {
                        this.clearAllUncompleted();
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 192, col: 16 });
                jsDialog.setController(this.clearConfirmController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        message: 'Clear all uncompleted tasks?',
                        onConfirm: () => {
                            this.clearAllUncompleted();
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            customStyle: true,
            cornerRadius: 16
        }, this);
        this.clearConfirmController.open();
    }
    private async clearAllUncompleted(): Promise<void> {
        try {
            await this.dbHelper.deleteAllUncompleted();
            this.toDoData = [];
            this.getUIContext().getPromptAction().showToast({ message: 'Uncompleted tasks cleared' });
        }
        catch (error) {
            let err = error as BusinessError;
            hilog.error(0x0000, 'Index', 'Clear uncompleted failed: ' + err.message);
        }
    }
    /**
     * Opens the add-category dialog.
     */
    private openAddCategoryDialog(): void {
        this.addCategoryDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new AddCategoryDialog(this, {
                    onConfirm: (name: string, color: string) => {
                        this.onAddCategoryConfirm(name, color);
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 221, col: 16 });
                jsDialog.setController(this.addCategoryDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        onConfirm: (name: string, color: string) => {
                            this.onAddCategoryConfirm(name, color);
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            customStyle: true,
            cornerRadius: 16
        }, this);
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
        }
        catch (error) {
            let err = error as BusinessError;
            hilog.error(0x0000, 'Index', 'Add category failed: ' + err.message);
        }
    }
    /**
     * Shows options dialog for a category (edit / delete).
     */
    private showCategoryOptions(category: Category): void {
        this.deleteCategoryDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new ConfirmDialog(this, {
                    message: 'Category: "' + category.name + '"',
                    onConfirm: () => {
                        this.openEditCategoryDialog(category);
                    },
                    onCancelText: 'Delete',
                    onCancel: () => {
                        this.onDeleteCategory(category);
                    },
                    confirmText: 'Edit'
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 253, col: 16 });
                jsDialog.setController(this.deleteCategoryDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        message: 'Category: "' + category.name + '"',
                        onConfirm: () => {
                            this.openEditCategoryDialog(category);
                        },
                        onCancelText: 'Delete',
                        onCancel: () => {
                            this.onDeleteCategory(category);
                        },
                        confirmText: 'Edit'
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            customStyle: true,
            cornerRadius: 16
        }, this);
        this.deleteCategoryDialogController.open();
    }
    /**
     * Opens the edit-category dialog with pre-filled values.
     */
    private openEditCategoryDialog(category: Category): void {
        this.addCategoryDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new EditCategoryDialog(this, {
                    categoryId: category.id,
                    currentName: category.name,
                    currentColor: category.color,
                    onConfirm: (name: string, color: string) => {
                        this.onEditCategoryConfirm(category.id, name, color);
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 276, col: 16 });
                jsDialog.setController(this.addCategoryDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        categoryId: category.id,
                        currentName: category.name,
                        currentColor: category.color,
                        onConfirm: (name: string, color: string) => {
                            this.onEditCategoryConfirm(category.id, name, color);
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            customStyle: true,
            cornerRadius: 16
        }, this);
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
                }
                else {
                    updatedList.push(cat);
                }
            }
            this.categoryList = updatedList;
            // Force ForEach to recreate components by changing the key
            this.categoryRefreshKey++;
            this.getUIContext().getPromptAction().showToast({ message: 'Category updated' });
        }
        catch (error) {
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
        }
        catch (error) {
            let err = error as BusinessError;
            hilog.error(0x0000, 'Index', 'Delete category failed: ' + err.message);
        }
    }
    /**
     * Opens the task detail dialog.
     */
    private openTaskDetail(todo: ToDo): void {
        this.detailDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new TaskDetailDialog(this, {
                    todo: todo,
                    categoryList: this.categoryList
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 341, col: 16 });
                jsDialog.setController(this.detailDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        todo: todo,
                        categoryList: this.categoryList
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            customStyle: true,
            cornerRadius: 16
        }, this);
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
    itemEnd(item: ToDo, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: STYLE_CONFIG.ICON_GUTTER });
            Row.padding(STYLE_CONFIG.OPERATION_BUTTON_PADDING);
            Row.justifyContent(FlexAlign.SpaceEvenly);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777236, "type": 20000, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
            __Image__ImageStyle();
            Image.onClick(() => {
                this.getUIContext().getPromptAction().showToast({ message: { "id": 16777223, "type": 10003, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" } });
            });
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777234, "type": 20000, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
            __Image__ImageStyle();
            Image.onClick(() => {
                this.getUIContext().getPromptAction().showToast({ message: { "id": 16777223, "type": 10003, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" } });
            });
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777233, "type": 20000, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
            __Image__ImageStyle();
            Image.onClick(() => {
                this.deleteTodoItem(item);
            });
        }, Image);
        Row.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor({ "id": 16777228, "type": 10001, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
            Column.height(Constant.PERCENT_FULL);
            Column.width(Constant.PERCENT_FULL);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Header row
            Row.create({ space: STYLE_CONFIG.LIST_ITEM_GUTTER });
            // Header row
            Row.height(Constant.PERCENT_12);
            // Header row
            Row.width(Constant.PERCENT_FULL);
            // Header row
            Row.padding({
                left: { "id": 125829724, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                right: { "id": 125829726, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
            });
            // Header row
            Row.backgroundColor(Color.White);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777225, "type": 10003, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
            Text.fontSize({ "id": 125829675, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777232, "type": 20000, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
            Image.width(STYLE_CONFIG.MENU_IMAGE_SIZE);
            Image.aspectRatio(1);
            Image.onClick(() => {
                this.openAddDialog();
            });
        }, Image);
        // Header row
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Search bar
            Search.create({ placeholder: 'Search tasks...', value: this.searchText });
            // Search bar
            Search.width('100%');
            // Search bar
            Search.height(40);
            // Search bar
            Search.searchButton('');
            // Search bar
            Search.onChange((value: string) => {
                this.searchText = value;
                ContinuationState.searchText = value;
            });
            // Search bar
            Search.margin({
                left: { "id": 125829723, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                right: { "id": 125829725, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                bottom: 8
            });
        }, Search);
        // Search bar
        Search.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Category filter chips
            Scroll.create();
            // Category filter chips
            Scroll.scrollable(ScrollDirection.Horizontal);
            // Category filter chips
            Scroll.scrollBar(BarState.Off);
            // Category filter chips
            Scroll.width('100%');
            // Category filter chips
            Scroll.height(44);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.padding({
                left: { "id": 125829723, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                right: { "id": 125829725, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" }
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // "All" chip
            Button.createWithLabel('All');
            // "All" chip
            Button.height(32);
            // "All" chip
            Button.backgroundColor(this.selectedCategoryFilter.length === 0 ? '#007BFF' : '#E8E8E8');
            // "All" chip
            Button.fontColor(this.selectedCategoryFilter.length === 0 ? Color.White : '#333333');
            // "All" chip
            Button.borderRadius(16);
            // "All" chip
            Button.fontSize(14);
            // "All" chip
            Button.onClick(() => {
                this.selectedCategoryFilter = '';
                ContinuationState.filterCategory = '';
            });
        }, Button);
        // "All" chip
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const category = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(category.name);
                    Text.height(32);
                    Text.padding({ left: 14, right: 14 });
                    Text.textAlign(TextAlign.Center);
                    Text.fontSize(14);
                    Text.backgroundColor(this.selectedCategoryFilter === category.id ? category.color : '#E8E8E8');
                    Text.fontColor(this.selectedCategoryFilter === category.id ? Color.White : '#333333');
                    Text.borderRadius(16);
                    Gesture.create(GesturePriority.Low);
                    GestureGroup.create(GestureMode.Exclusive);
                    TapGesture.create();
                    TapGesture.onAction(() => {
                        this.selectedCategoryFilter = this.selectedCategoryFilter === category.id ? '' : category.id;
                        ContinuationState.filterCategory = this.selectedCategoryFilter;
                    });
                    TapGesture.pop();
                    LongPressGesture.create({ repeat: false, duration: 500 });
                    LongPressGesture.onAction(() => {
                        this.showCategoryOptions(category);
                    });
                    LongPressGesture.pop();
                    GestureGroup.pop();
                    Gesture.pop();
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, this.categoryList, forEachItemGenFunction, (category: Category) => category.id + '_' + this.categoryRefreshKey, false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Add category button
            Button.createWithLabel('+');
            // Add category button
            Button.height(32);
            // Add category button
            Button.width(32);
            // Add category button
            Button.backgroundColor('#007BFF');
            // Add category button
            Button.fontColor(Color.White);
            // Add category button
            Button.borderRadius(16);
            // Add category button
            Button.fontSize(20);
            // Add category button
            Button.margin({ left: 8 });
            // Add category button
            Button.onClick(() => {
                this.openAddCategoryDialog();
            });
        }, Button);
        // Add category button
        Button.pop();
        Row.pop();
        // Category filter chips
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // To-do list - responsive layout
            if (this.isWideScreen) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Tablet/Foldable: two-column layout
                        Row.create();
                        // Tablet/Foldable: two-column layout
                        Row.layoutWeight(1);
                        // Tablet/Foldable: two-column layout
                        Row.padding({
                            top: { "id": 125829727, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                            left: { "id": 125829723, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                            right: { "id": 125829725, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                        });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Ongoing column
                        Column.create();
                        // Ongoing column
                        Column.layoutWeight(1);
                        // Ongoing column
                        Column.padding({ right: 8 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create({ "id": 16777226, "type": 10003, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                        Text.fontSize({ "id": 125829676, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('Clear');
                        Text.fontSize(14);
                        Text.fontColor('#E74C3C');
                        Text.onClick(() => {
                            this.confirmClearUncompleted();
                        });
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ initialIndex: 0, space: STYLE_CONFIG.LIST_ITEM_GUTTER });
                        List.layoutWeight(1);
                        List.listDirection(Axis.Vertical);
                        List.edgeEffect(EdgeEffect.Spring);
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const toDoItem = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                    ListItem.swipeAction({ end: this.itemEnd.bind(this, toDoItem), edgeEffect: SwipeEdgeEffect.Spring });
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            if (isInitialRender) {
                                                let componentCall = new ToDoListItem(this, {
                                                    toDoItem: toDoItem,
                                                    achieveData: this.__achieveData,
                                                    toDoData: this.__toDoData,
                                                    categoryList: this.categoryList,
                                                    onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                                                    onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                                                    onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                                                    onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 523, col: 19 });
                                                ViewPU.create(componentCall);
                                                let paramsLambda = () => {
                                                    return {
                                                        toDoItem: toDoItem,
                                                        achieveData: this.achieveData,
                                                        toDoData: this.toDoData,
                                                        categoryList: this.categoryList,
                                                        onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                                                        onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                                                        onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                                                        onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                                                    };
                                                };
                                                componentCall.paramsGenerator_ = paramsLambda;
                                            }
                                            else {
                                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                                    toDoItem: toDoItem
                                                });
                                            }
                                        }, { name: "ToDoListItem" });
                                    }
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.getFilteredTodoData(), forEachItemGenFunction, (toDoItem: ToDo) => toDoItem.key, false, false);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                    // Ongoing column
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Completed column
                        Column.create();
                        // Completed column
                        Column.layoutWeight(1);
                        // Completed column
                        Column.padding({ left: 8 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create({ "id": 16777221, "type": 10003, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                        Text.fontSize({ "id": 125829676, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('Clear');
                        Text.fontSize(14);
                        Text.fontColor('#E74C3C');
                        Text.onClick(() => {
                            this.confirmClearCompleted();
                        });
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ initialIndex: 0, space: STYLE_CONFIG.LIST_ITEM_GUTTER });
                        List.layoutWeight(1);
                        List.listDirection(Axis.Vertical);
                        List.edgeEffect(EdgeEffect.Spring);
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const toDoItem = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                    ListItem.swipeAction({ end: this.itemEnd.bind(this, toDoItem), edgeEffect: SwipeEdgeEffect.Spring });
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            if (isInitialRender) {
                                                let componentCall = new ToDoListItem(this, {
                                                    toDoItem: toDoItem,
                                                    achieveData: this.__achieveData,
                                                    toDoData: this.__toDoData,
                                                    categoryList: this.categoryList,
                                                    onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                                                    onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                                                    onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                                                    onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 563, col: 19 });
                                                ViewPU.create(componentCall);
                                                let paramsLambda = () => {
                                                    return {
                                                        toDoItem: toDoItem,
                                                        achieveData: this.achieveData,
                                                        toDoData: this.toDoData,
                                                        categoryList: this.categoryList,
                                                        onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                                                        onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                                                        onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                                                        onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                                                    };
                                                };
                                                componentCall.paramsGenerator_ = paramsLambda;
                                            }
                                            else {
                                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                                    toDoItem: toDoItem
                                                });
                                            }
                                        }, { name: "ToDoListItem" });
                                    }
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.getFilteredAchieveData(), forEachItemGenFunction, (toDoItem: ToDo) => toDoItem.key, false, false);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                    // Completed column
                    Column.pop();
                    // Tablet/Foldable: two-column layout
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Phone: single-column layout
                        List.create({ initialIndex: 0, space: STYLE_CONFIG.LIST_ITEM_GUTTER });
                        // Phone: single-column layout
                        List.layoutWeight(1);
                        // Phone: single-column layout
                        List.listDirection(Axis.Vertical);
                        // Phone: single-column layout
                        List.edgeEffect(EdgeEffect.Spring);
                        // Phone: single-column layout
                        List.padding({
                            top: { "id": 125829727, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                            left: { "id": 125829723, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                            right: { "id": 125829725, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                        });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // Ongoing section
                        if (this.getFilteredTodoData().length !== 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                {
                                    const itemCreation = (elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        ListItem.create(deepRenderFunction, true);
                                        if (!isInitialRender) {
                                            ListItem.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    };
                                    const itemCreation2 = (elmtId, isInitialRender) => {
                                        ListItem.create(deepRenderFunction, true);
                                    };
                                    const deepRenderFunction = (elmtId, isInitialRender) => {
                                        itemCreation(elmtId, isInitialRender);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.width('100%');
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create({ "id": 16777226, "type": 10003, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                                            Text.fontSize({ "id": 125829676, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Blank.create();
                                        }, Blank);
                                        Blank.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create('Clear');
                                            Text.fontSize(14);
                                            Text.fontColor('#E74C3C');
                                            Text.onClick(() => {
                                                this.confirmClearUncompleted();
                                            });
                                        }, Text);
                                        Text.pop();
                                        Row.pop();
                                        ListItem.pop();
                                    };
                                    this.observeComponentCreation2(itemCreation2, ListItem);
                                    ListItem.pop();
                                }
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const toDoItem = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                    ListItem.swipeAction({ end: this.itemEnd.bind(this, toDoItem), edgeEffect: SwipeEdgeEffect.Spring });
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            if (isInitialRender) {
                                                let componentCall = new ToDoListItem(this, {
                                                    toDoItem: toDoItem,
                                                    achieveData: this.__achieveData,
                                                    toDoData: this.__toDoData,
                                                    categoryList: this.categoryList,
                                                    onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                                                    onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                                                    onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                                                    onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 612, col: 15 });
                                                ViewPU.create(componentCall);
                                                let paramsLambda = () => {
                                                    return {
                                                        toDoItem: toDoItem,
                                                        achieveData: this.achieveData,
                                                        toDoData: this.toDoData,
                                                        categoryList: this.categoryList,
                                                        onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                                                        onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                                                        onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                                                        onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                                                    };
                                                };
                                                componentCall.paramsGenerator_ = paramsLambda;
                                            }
                                            else {
                                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                                    toDoItem: toDoItem
                                                });
                                            }
                                        }, { name: "ToDoListItem" });
                                    }
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.getFilteredTodoData(), forEachItemGenFunction, (toDoItem: ToDo) => toDoItem.key, false, false);
                    }, ForEach);
                    ForEach.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // Completed section
                        if (this.getFilteredAchieveData().length !== 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                {
                                    const itemCreation = (elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        ListItem.create(deepRenderFunction, true);
                                        if (!isInitialRender) {
                                            ListItem.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    };
                                    const itemCreation2 = (elmtId, isInitialRender) => {
                                        ListItem.create(deepRenderFunction, true);
                                    };
                                    const deepRenderFunction = (elmtId, isInitialRender) => {
                                        itemCreation(elmtId, isInitialRender);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.width('100%');
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create({ "id": 16777221, "type": 10003, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                                            Text.fontSize({ "id": 125829676, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Blank.create();
                                        }, Blank);
                                        Blank.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create('Clear');
                                            Text.fontSize(14);
                                            Text.fontColor('#E74C3C');
                                            Text.onClick(() => {
                                                this.confirmClearCompleted();
                                            });
                                        }, Text);
                                        Text.pop();
                                        Row.pop();
                                        ListItem.pop();
                                    };
                                    this.observeComponentCreation2(itemCreation2, ListItem);
                                    ListItem.pop();
                                }
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const toDoItem = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                    ListItem.swipeAction({ end: this.itemEnd.bind(this, toDoItem), edgeEffect: SwipeEdgeEffect.Spring });
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            if (isInitialRender) {
                                                let componentCall = new ToDoListItem(this, {
                                                    toDoItem: toDoItem,
                                                    achieveData: this.__achieveData,
                                                    toDoData: this.__toDoData,
                                                    categoryList: this.categoryList,
                                                    onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                                                    onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                                                    onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                                                    onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 645, col: 15 });
                                                ViewPU.create(componentCall);
                                                let paramsLambda = () => {
                                                    return {
                                                        toDoItem: toDoItem,
                                                        achieveData: this.achieveData,
                                                        toDoData: this.toDoData,
                                                        categoryList: this.categoryList,
                                                        onStatusChanged: (item: ToDo) => this.onTodoStatusChanged(item),
                                                        onTodoUpdated: (item: ToDo) => this.onTodoUpdated(item),
                                                        onDeleteItem: (item: ToDo) => this.deleteTodoItem(item),
                                                        onShowDetail: (item: ToDo) => this.openTaskDetail(item)
                                                    };
                                                };
                                                componentCall.paramsGenerator_ = paramsLambda;
                                            }
                                            else {
                                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                                    toDoItem: toDoItem
                                                });
                                            }
                                        }, { name: "ToDoListItem" });
                                    }
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.getFilteredAchieveData(), forEachItemGenFunction, (toDoItem: ToDo) => toDoItem.key, false, false);
                    }, ForEach);
                    ForEach.pop();
                    // Phone: single-column layout
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "ToDoList";
    }
}
class ConfirmDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.message = '';
        this.onConfirm = undefined;
        this.onCancel = undefined;
        this.confirmText = 'Confirm';
        this.onCancelText = 'Cancel';
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ConfirmDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.message !== undefined) {
            this.message = params.message;
        }
        if (params.onConfirm !== undefined) {
            this.onConfirm = params.onConfirm;
        }
        if (params.onCancel !== undefined) {
            this.onCancel = params.onCancel;
        }
        if (params.confirmText !== undefined) {
            this.confirmText = params.confirmText;
        }
        if (params.onCancelText !== undefined) {
            this.onCancelText = params.onCancelText;
        }
    }
    updateStateVars(params: ConfirmDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private message: string;
    private onConfirm?: () => void;
    private onCancel?: () => void;
    private confirmText: string;
    private onCancelText: string;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(24);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.message);
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Medium);
            Text.textAlign(TextAlign.Center);
            Text.width('100%');
            Text.margin({ bottom: 24 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.onCancelText);
            Button.height(40);
            Button.layoutWeight(1);
            Button.backgroundColor('#E8E8E8');
            Button.fontColor('#333333');
            Button.borderRadius(20);
            Button.onClick(() => {
                if (this.onCancel !== undefined && this.onCancel !== null) {
                    this.onCancel();
                }
                if (this.controller !== undefined && this.controller !== null) {
                    this.controller.close();
                }
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.confirmText);
            Button.height(40);
            Button.layoutWeight(1);
            Button.backgroundColor('#007BFF');
            Button.fontColor(Color.White);
            Button.borderRadius(20);
            Button.onClick(() => {
                if (this.onConfirm !== undefined && this.onConfirm !== null) {
                    this.onConfirm();
                }
                if (this.controller !== undefined && this.controller !== null) {
                    this.controller.close();
                }
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
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
class AddCategoryDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.onConfirm = undefined;
        this.__categoryName = new ObservedPropertySimplePU('', this, "categoryName");
        this.__selectedColor = new ObservedPropertySimplePU(CATEGORY_COLORS[0], this, "selectedColor");
        this.__nameError = new ObservedPropertySimplePU('', this, "nameError");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: AddCategoryDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.onConfirm !== undefined) {
            this.onConfirm = params.onConfirm;
        }
        if (params.categoryName !== undefined) {
            this.categoryName = params.categoryName;
        }
        if (params.selectedColor !== undefined) {
            this.selectedColor = params.selectedColor;
        }
        if (params.nameError !== undefined) {
            this.nameError = params.nameError;
        }
    }
    updateStateVars(params: AddCategoryDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__categoryName.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedColor.purgeDependencyOnElmtId(rmElmtId);
        this.__nameError.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__categoryName.aboutToBeDeleted();
        this.__selectedColor.aboutToBeDeleted();
        this.__nameError.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private onConfirm?: (name: string, color: string) => void;
    private __categoryName: ObservedPropertySimplePU<string>;
    get categoryName() {
        return this.__categoryName.get();
    }
    set categoryName(newValue: string) {
        this.__categoryName.set(newValue);
    }
    private __selectedColor: ObservedPropertySimplePU<string>;
    get selectedColor() {
        return this.__selectedColor.get();
    }
    set selectedColor(newValue: string) {
        this.__selectedColor.set(newValue);
    }
    private __nameError: ObservedPropertySimplePU<string>;
    get nameError() {
        return this.__nameError.get();
    }
    set nameError(newValue: string) {
        this.__nameError.set(newValue);
    }
    private resetForm(): void {
        this.categoryName = '';
        this.selectedColor = CATEGORY_COLORS[0];
        this.nameError = '';
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(24);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Add Category');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.width('100%');
            Text.textAlign(TextAlign.Start);
            Text.margin({ bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Category name input
            TextInput.create({ placeholder: 'Category name...', text: this.categoryName });
            // Category name input
            TextInput.width('100%');
            // Category name input
            TextInput.height(48);
            // Category name input
            TextInput.onChange((value: string) => {
                this.categoryName = value;
                this.nameError = '';
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.nameError.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.nameError);
                        Text.fontSize(12);
                        Text.fontColor(Color.Red);
                        Text.width('100%');
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                });
            }
            // Color picker
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Color picker
            Text.create('Choose Color');
            // Color picker
            Text.fontSize(16);
            // Color picker
            Text.fontWeight(FontWeight.Medium);
            // Color picker
            Text.width('100%');
            // Color picker
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // Color picker
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Center });
            Flex.width('100%');
            Flex.margin({ bottom: 24 });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const color = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width(36);
                    Row.height(36);
                    Row.borderRadius(18);
                    Row.backgroundColor(color);
                    Row.margin(4);
                    Row.borderWidth(this.selectedColor === color ? 3 : 0);
                    Row.borderColor('#333333');
                    Row.onClick(() => {
                        this.selectedColor = color;
                    });
                }, Row);
                Row.pop();
            };
            this.forEachUpdateFunction(elmtId, CATEGORY_COLORS, forEachItemGenFunction, (color: string) => color, false, false);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Buttons
            Row.create({ space: 12 });
            // Buttons
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Cancel');
            Button.height(40);
            Button.layoutWeight(1);
            Button.backgroundColor('#E8E8E8');
            Button.fontColor('#333333');
            Button.borderRadius(20);
            Button.onClick(() => {
                this.resetForm();
                if (this.controller !== undefined && this.controller !== null) {
                    this.controller.close();
                }
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Add');
            Button.height(40);
            Button.layoutWeight(1);
            Button.backgroundColor('#007BFF');
            Button.fontColor(Color.White);
            Button.borderRadius(20);
            Button.onClick(() => {
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
            });
        }, Button);
        Button.pop();
        // Buttons
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
/**
 * Priority label mapping for detail display.
 */
const PRIORITY_LABEL_MAP: string[] = ['Low', 'Medium', 'High'];
class TaskDetailDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.todo = null;
        this.categoryList = [];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TaskDetailDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.todo !== undefined) {
            this.todo = params.todo;
        }
        if (params.categoryList !== undefined) {
            this.categoryList = params.categoryList;
        }
    }
    updateStateVars(params: TaskDetailDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private todo: ToDo | null;
    private categoryList: Category[];
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(24);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Title
            if (this.todo !== null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.todo.name}`);
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.width('100%');
                        Text.textAlign(TextAlign.Start);
                        Text.margin({ bottom: 20 });
                    }, Text);
                    Text.pop();
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new 
                                // Category
                                DetailRow(this, { label: 'Category', value: this.getCategoryName(), valueColor: this.getCategoryColor() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 931, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: 'Category',
                                        value: this.getCategoryName(),
                                        valueColor: this.getCategoryColor()
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {});
                            }
                        }, { name: "DetailRow" });
                    }
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new 
                                // Due date
                                DetailRow(this, { label: 'Due Date', value: this.formatDate(this.todo.dueDate) }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 934, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: 'Due Date',
                                        value: this.formatDate(this.todo.dueDate)
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {});
                            }
                        }, { name: "DetailRow" });
                    }
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new 
                                // Priority
                                DetailRow(this, { label: 'Priority', value: PRIORITY_LABEL_MAP[this.todo.priority] }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 937, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: 'Priority',
                                        value: PRIORITY_LABEL_MAP[this.todo.priority]
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {});
                            }
                        }, { name: "DetailRow" });
                    }
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // Notes
                        if (this.todo.notes.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('Notes');
                                    Text.fontSize(14);
                                    Text.fontWeight(FontWeight.Medium);
                                    Text.fontColor('#666666');
                                    Text.width('100%');
                                    Text.margin({ top: 12 });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.todo.notes);
                                    Text.fontSize(16);
                                    Text.width('100%');
                                    Text.margin({ top: 4 });
                                }, Text);
                                Text.pop();
                            });
                        }
                        // Close button
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Close button
                        Button.createWithLabel('Close');
                        // Close button
                        Button.height(40);
                        // Close button
                        Button.width('100%');
                        // Close button
                        Button.backgroundColor('#007BFF');
                        // Close button
                        Button.fontColor(Color.White);
                        // Close button
                        Button.borderRadius(20);
                        // Close button
                        Button.margin({ top: 24 });
                        // Close button
                        Button.onClick(() => {
                            if (this.controller !== undefined && this.controller !== null) {
                                this.controller.close();
                            }
                        });
                    }, Button);
                    // Close button
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class DetailRow extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.label = '';
        this.value = '';
        this.valueColor = '#333333';
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DetailRow_Params) {
        if (params.label !== undefined) {
            this.label = params.label;
        }
        if (params.value !== undefined) {
            this.value = params.value;
        }
        if (params.valueColor !== undefined) {
            this.valueColor = params.valueColor;
        }
    }
    updateStateVars(params: DetailRow_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private label: string;
    private value: string;
    private valueColor: string;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 8, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.label);
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.value);
            Text.fontSize(16);
            Text.fontColor(this.valueColor);
        }, Text);
        Text.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class EditCategoryDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.categoryId = '';
        this.currentName = '';
        this.currentColor = '';
        this.onConfirm = undefined;
        this.__editName = new ObservedPropertySimplePU('', this, "editName");
        this.__editColor = new ObservedPropertySimplePU('', this, "editColor");
        this.__nameError = new ObservedPropertySimplePU('', this, "nameError");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: EditCategoryDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.categoryId !== undefined) {
            this.categoryId = params.categoryId;
        }
        if (params.currentName !== undefined) {
            this.currentName = params.currentName;
        }
        if (params.currentColor !== undefined) {
            this.currentColor = params.currentColor;
        }
        if (params.onConfirm !== undefined) {
            this.onConfirm = params.onConfirm;
        }
        if (params.editName !== undefined) {
            this.editName = params.editName;
        }
        if (params.editColor !== undefined) {
            this.editColor = params.editColor;
        }
        if (params.nameError !== undefined) {
            this.nameError = params.nameError;
        }
    }
    updateStateVars(params: EditCategoryDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__editName.purgeDependencyOnElmtId(rmElmtId);
        this.__editColor.purgeDependencyOnElmtId(rmElmtId);
        this.__nameError.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__editName.aboutToBeDeleted();
        this.__editColor.aboutToBeDeleted();
        this.__nameError.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private categoryId: string;
    private currentName: string;
    private currentColor: string;
    private onConfirm?: (name: string, color: string) => void;
    private __editName: ObservedPropertySimplePU<string>;
    get editName() {
        return this.__editName.get();
    }
    set editName(newValue: string) {
        this.__editName.set(newValue);
    }
    private __editColor: ObservedPropertySimplePU<string>;
    get editColor() {
        return this.__editColor.get();
    }
    set editColor(newValue: string) {
        this.__editColor.set(newValue);
    }
    private __nameError: ObservedPropertySimplePU<string>;
    get nameError() {
        return this.__nameError.get();
    }
    set nameError(newValue: string) {
        this.__nameError.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(24);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Edit Category');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.width('100%');
            Text.textAlign(TextAlign.Start);
            Text.margin({ bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Category name input (pre-filled with currentName)
            TextInput.create({ placeholder: 'Category name...', text: this.currentName });
            // Category name input (pre-filled with currentName)
            TextInput.width('100%');
            // Category name input (pre-filled with currentName)
            TextInput.height(48);
            // Category name input (pre-filled with currentName)
            TextInput.onChange((value: string) => {
                this.editName = value;
                this.nameError = '';
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.nameError.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.nameError);
                        Text.fontSize(12);
                        Text.fontColor(Color.Red);
                        Text.width('100%');
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                });
            }
            // Color picker
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Color picker
            Text.create('Choose Color');
            // Color picker
            Text.fontSize(16);
            // Color picker
            Text.fontWeight(FontWeight.Medium);
            // Color picker
            Text.width('100%');
            // Color picker
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // Color picker
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Center });
            Flex.width('100%');
            Flex.margin({ bottom: 24 });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const color = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width(36);
                    Row.height(36);
                    Row.borderRadius(18);
                    Row.backgroundColor(color);
                    Row.margin(4);
                    Row.borderWidth(this.getSelectedColor() === color ? 3 : 0);
                    Row.borderColor('#333333');
                    Row.onClick(() => {
                        this.editColor = color;
                    });
                }, Row);
                Row.pop();
            };
            this.forEachUpdateFunction(elmtId, CATEGORY_COLORS, forEachItemGenFunction, (color: string) => color, false, false);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Buttons
            Row.create({ space: 12 });
            // Buttons
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Cancel');
            Button.height(40);
            Button.layoutWeight(1);
            Button.backgroundColor('#E8E8E8');
            Button.fontColor('#333333');
            Button.borderRadius(20);
            Button.onClick(() => {
                if (this.controller !== undefined && this.controller !== null) {
                    this.controller.close();
                }
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Save');
            Button.height(40);
            Button.layoutWeight(1);
            Button.backgroundColor('#007BFF');
            Button.fontColor(Color.White);
            Button.borderRadius(20);
            Button.onClick(() => {
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
            });
        }, Button);
        Button.pop();
        // Buttons
        Row.pop();
        Column.pop();
    }
    /**
     * Returns the effective selected color (user-chosen or initial).
     */
    private getSelectedColor(): string {
        return this.editColor.length > 0 ? this.editColor : this.currentColor;
    }
    rerender() {
        this.updateDirtyElements();
    }
}
registerNamedRoute(() => new ToDoList(undefined, {}), "", { bundleName: "com.example.listitemedit", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
