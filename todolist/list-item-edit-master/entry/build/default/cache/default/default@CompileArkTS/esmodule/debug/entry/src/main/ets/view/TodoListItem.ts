if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ToDoListItem_Params {
    UIContext?;
    achieveData?: ToDo[];
    toDoData?: ToDo[];
    toDoItem?: ToDo;
    isEdited?: boolean;
    categoryList?: Category[];
    onStatusChanged?: (item: ToDo) => void;
    onTodoUpdated?: (item: ToDo) => void;
    onDeleteItem?: (item: ToDo) => void;
    onShowDetail?: (item: ToDo) => void;
}
import { STYLE_CONFIG, Constant } from "@bundle:com.example.listitemedit/entry/ets/common/Constants";
import type { ToDo } from '../model/ToDo';
import type { Category } from '../model/Category';
const PRIORITY_COLORS: string[] = ['#2ECC71', '#F39C12', '#E74C3C'];
export class ToDoListItem extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.UIContext = this.getUIContext();
        this.__achieveData = new SynchedPropertyObjectTwoWayPU(params.achieveData, this, "achieveData");
        this.__toDoData = new SynchedPropertyObjectTwoWayPU(params.toDoData, this, "toDoData");
        this.__toDoItem = new SynchedPropertyNesedObjectPU(params.toDoItem, this, "toDoItem");
        this.__isEdited = new ObservedPropertySimplePU(false, this, "isEdited");
        this.categoryList = [];
        this.onStatusChanged = undefined;
        this.onTodoUpdated = undefined;
        this.onDeleteItem = undefined;
        this.onShowDetail = undefined;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ToDoListItem_Params) {
        if (params.UIContext !== undefined) {
            this.UIContext = params.UIContext;
        }
        this.__toDoItem.set(params.toDoItem);
        if (params.isEdited !== undefined) {
            this.isEdited = params.isEdited;
        }
        if (params.categoryList !== undefined) {
            this.categoryList = params.categoryList;
        }
        if (params.onStatusChanged !== undefined) {
            this.onStatusChanged = params.onStatusChanged;
        }
        if (params.onTodoUpdated !== undefined) {
            this.onTodoUpdated = params.onTodoUpdated;
        }
        if (params.onDeleteItem !== undefined) {
            this.onDeleteItem = params.onDeleteItem;
        }
        if (params.onShowDetail !== undefined) {
            this.onShowDetail = params.onShowDetail;
        }
    }
    updateStateVars(params: ToDoListItem_Params) {
        this.__toDoItem.set(params.toDoItem);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__achieveData.purgeDependencyOnElmtId(rmElmtId);
        this.__toDoData.purgeDependencyOnElmtId(rmElmtId);
        this.__toDoItem.purgeDependencyOnElmtId(rmElmtId);
        this.__isEdited.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__achieveData.aboutToBeDeleted();
        this.__toDoData.aboutToBeDeleted();
        this.__toDoItem.aboutToBeDeleted();
        this.__isEdited.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private UIContext;
    private __achieveData: SynchedPropertySimpleOneWayPU<ToDo[]>;
    get achieveData() {
        return this.__achieveData.get();
    }
    set achieveData(newValue: ToDo[]) {
        this.__achieveData.set(newValue);
    }
    private __toDoData: SynchedPropertySimpleOneWayPU<ToDo[]>;
    get toDoData() {
        return this.__toDoData.get();
    }
    set toDoData(newValue: ToDo[]) {
        this.__toDoData.set(newValue);
    }
    private __toDoItem: SynchedPropertyNesedObjectPU<ToDo>;
    get toDoItem() {
        return this.__toDoItem.get();
    }
    private __isEdited: ObservedPropertySimplePU<boolean>;
    get isEdited() {
        return this.__isEdited.get();
    }
    set isEdited(newValue: boolean) {
        this.__isEdited.set(newValue);
    }
    private categoryList: Category[];
    private onStatusChanged?: (item: ToDo) => void;
    private onTodoUpdated?: (item: ToDo) => void;
    private onDeleteItem?: (item: ToDo) => void;
    private onShowDetail?: (item: ToDo) => void;
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
            }
            else {
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
    categoryLabel(category: Category | undefined, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (category !== undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                        Row.borderRadius(8);
                        Row.borderWidth(1);
                        Row.borderColor(category.color);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(category.name);
                        Text.fontSize(11);
                        Text.fontColor(category.color);
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(Constant.PERCENT_FULL);
            Column.padding({
                left: { "id": 125829723, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                right: { "id": 125829725, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" },
                top: STYLE_CONFIG.TODO_ITEM_PADDING_VERTICAL,
                bottom: STYLE_CONFIG.TODO_ITEM_PADDING_VERTICAL
            });
            Column.borderRadius({ "id": 125829720, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
            Column.backgroundColor(Color.White);
            Column.onClick(() => {
                if (!this.isEdited && this.onShowDetail !== undefined && this.onShowDetail !== null) {
                    this.onShowDetail(ObservedObject.GetRawObject(this.toDoItem));
                }
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: STYLE_CONFIG.ICON_GUTTER });
            Row.width(Constant.PERCENT_FULL);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!this.isEdited) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Priority indicator dot
                        Row.create();
                        // Priority indicator dot
                        Row.width(10);
                        // Priority indicator dot
                        Row.height(10);
                        // Priority indicator dot
                        Row.borderRadius(5);
                        // Priority indicator dot
                        Row.backgroundColor(PRIORITY_COLORS[this.toDoItem.priority]);
                        // Priority indicator dot
                        Row.margin({ right: 4 });
                        // Priority indicator dot
                        Row.onClick(() => {
                            this.cyclePriority();
                        });
                    }, Row);
                    // Priority indicator dot
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Checkbox
                        Row.create();
                        // Checkbox
                        Row.width(STYLE_CONFIG.CUSTOM_CHECKBOX_SIZE);
                        // Checkbox
                        Row.justifyContent(FlexAlign.Center);
                        // Checkbox
                        Row.aspectRatio(1);
                        // Checkbox
                        Row.borderRadius(STYLE_CONFIG.CUSTOM_CHECKBOX_SIZE);
                        // Checkbox
                        Row.backgroundColor(this.toDoItem.isCompleted ? { "id": 125829528, "type": 10001, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" } :
                            Color.Transparent);
                        // Checkbox
                        Row.borderWidth(1);
                        // Checkbox
                        Row.borderColor({ "id": 125829177, "type": 10001, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                        // Checkbox
                        Row.onClick(() => {
                            this.addAchieveData();
                        });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.toDoItem.isCompleted) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Image.create({ "id": 16777235, "type": 20000, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                                    Image.width(STYLE_CONFIG.IMAGE_ICON_OK_SIZE);
                                    Image.aspectRatio(1);
                                    Image.borderRadius(STYLE_CONFIG.IMAGE_ICON_OK_SIZE);
                                    Image.fillColor(Color.White);
                                    Image.transition(TransitionEffect.IDENTITY);
                                }, Image);
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    // Checkbox
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Name
                        Text.create(`${this.toDoItem.name}`);
                        // Name
                        Text.maxLines(1);
                        // Name
                        Text.fontSize({ "id": 125829677, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                        // Name
                        Text.layoutWeight(1);
                        // Name
                        Text.decoration({ type: this.toDoItem.isCompleted ? TextDecorationType.LineThrough : TextDecorationType.None });
                    }, Text);
                    // Name
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    if (!If.canRetake('textEdit')) {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            TextInput.create({ text: `${this.toDoItem.name}` });
                            TextInput.maxLines(1);
                            TextInput.fontSize({ "id": 125829677, "type": 10002, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                            TextInput.layoutWeight(1);
                            TextInput.backgroundColor(Color.Transparent);
                            TextInput.id('textEdit');
                            TextInput.onChange((value: string) => {
                                this.toDoItem.name = value;
                            });
                            TextInput.onAppear(() => {
                                focusControl.requestFocus('textEdit');
                            });
                        }, TextInput);
                    }
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isEdited) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create({ "id": 16777235, "type": 20000, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                        Image.width(STYLE_CONFIG.MENU_IMAGE_SIZE);
                        Image.aspectRatio(1);
                        Image.onClick(() => {
                            this.onEditConfirmed();
                        });
                    }, Image);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create({ "id": 16777222, "type": 10003, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                        Text.fontColor({ "id": 125829216, "type": 10001, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
                        Text.onClick(() => {
                            this.isEdited = true;
                        });
                    }, Text);
                    Text.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777233, "type": 20000, params: [], "bundleName": "com.example.listitemedit", "moduleName": "entry" });
            Image.width(STYLE_CONFIG.MENU_IMAGE_SIZE);
            Image.aspectRatio(1);
            Image.margin({ left: 8 });
            Image.onClick(() => {
                if (this.onDeleteItem !== undefined && this.onDeleteItem !== null) {
                    this.onDeleteItem(ObservedObject.GetRawObject(this.toDoItem));
                }
            });
        }, Image);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Category below the main row (right-aligned, below edit)
            if (!this.isEdited) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ top: 2 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.categoryLabel.bind(this)(this.getItemCategory());
                    Row.pop();
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
