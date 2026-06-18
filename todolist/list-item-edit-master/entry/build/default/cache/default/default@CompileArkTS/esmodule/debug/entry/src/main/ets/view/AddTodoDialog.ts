if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface AddTodoDialog_Params {
    controller?: CustomDialogController;
    categories?: Category[];
    onConfirm?: (todo: ToDo) => void;
    todoName?: string;
    selectedPriority?: number;
    hasDueDate?: boolean;
    selectedDate?: Date;
    selectedHour?: number;
    selectedMinute?: number;
    selectedCategory?: string;
    todoNotes?: string;
    nameError?: string;
    initialYearIndex?: number;
    initialMonthIndex?: number;
    initialDayIndex?: number;
}
import { ToDo } from "@bundle:com.example.listitemedit/entry/ets/model/ToDo";
import type { Category } from '../model/Category';
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
export class AddTodoDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.categories = [];
        this.onConfirm = undefined;
        this.__todoName = new ObservedPropertySimplePU('', this, "todoName");
        this.__selectedPriority = new ObservedPropertySimplePU(PRIORITY_MEDIUM, this, "selectedPriority");
        this.__hasDueDate = new ObservedPropertySimplePU(false, this, "hasDueDate");
        this.__selectedDate = new ObservedPropertyObjectPU(new Date(), this, "selectedDate");
        this.__selectedHour = new ObservedPropertySimplePU(new Date().getHours(), this, "selectedHour");
        this.__selectedMinute = new ObservedPropertySimplePU(new Date().getMinutes(), this, "selectedMinute");
        this.__selectedCategory = new ObservedPropertySimplePU('', this, "selectedCategory");
        this.__todoNotes = new ObservedPropertySimplePU('', this, "todoNotes");
        this.__nameError = new ObservedPropertySimplePU('', this, "nameError");
        this.initialYearIndex = this.selectedDate.getFullYear() - START_YEAR;
        this.initialMonthIndex = this.selectedDate.getMonth();
        this.initialDayIndex = this.selectedDate.getDate() - 1;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: AddTodoDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.categories !== undefined) {
            this.categories = params.categories;
        }
        if (params.onConfirm !== undefined) {
            this.onConfirm = params.onConfirm;
        }
        if (params.todoName !== undefined) {
            this.todoName = params.todoName;
        }
        if (params.selectedPriority !== undefined) {
            this.selectedPriority = params.selectedPriority;
        }
        if (params.hasDueDate !== undefined) {
            this.hasDueDate = params.hasDueDate;
        }
        if (params.selectedDate !== undefined) {
            this.selectedDate = params.selectedDate;
        }
        if (params.selectedHour !== undefined) {
            this.selectedHour = params.selectedHour;
        }
        if (params.selectedMinute !== undefined) {
            this.selectedMinute = params.selectedMinute;
        }
        if (params.selectedCategory !== undefined) {
            this.selectedCategory = params.selectedCategory;
        }
        if (params.todoNotes !== undefined) {
            this.todoNotes = params.todoNotes;
        }
        if (params.nameError !== undefined) {
            this.nameError = params.nameError;
        }
        if (params.initialYearIndex !== undefined) {
            this.initialYearIndex = params.initialYearIndex;
        }
        if (params.initialMonthIndex !== undefined) {
            this.initialMonthIndex = params.initialMonthIndex;
        }
        if (params.initialDayIndex !== undefined) {
            this.initialDayIndex = params.initialDayIndex;
        }
    }
    updateStateVars(params: AddTodoDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__todoName.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedPriority.purgeDependencyOnElmtId(rmElmtId);
        this.__hasDueDate.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedDate.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedHour.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedMinute.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedCategory.purgeDependencyOnElmtId(rmElmtId);
        this.__todoNotes.purgeDependencyOnElmtId(rmElmtId);
        this.__nameError.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__todoName.aboutToBeDeleted();
        this.__selectedPriority.aboutToBeDeleted();
        this.__hasDueDate.aboutToBeDeleted();
        this.__selectedDate.aboutToBeDeleted();
        this.__selectedHour.aboutToBeDeleted();
        this.__selectedMinute.aboutToBeDeleted();
        this.__selectedCategory.aboutToBeDeleted();
        this.__todoNotes.aboutToBeDeleted();
        this.__nameError.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private categories: Category[];
    private onConfirm?: (todo: ToDo) => void;
    private __todoName: ObservedPropertySimplePU<string>;
    get todoName() {
        return this.__todoName.get();
    }
    set todoName(newValue: string) {
        this.__todoName.set(newValue);
    }
    private __selectedPriority: ObservedPropertySimplePU<number>;
    get selectedPriority() {
        return this.__selectedPriority.get();
    }
    set selectedPriority(newValue: number) {
        this.__selectedPriority.set(newValue);
    }
    private __hasDueDate: ObservedPropertySimplePU<boolean>;
    get hasDueDate() {
        return this.__hasDueDate.get();
    }
    set hasDueDate(newValue: boolean) {
        this.__hasDueDate.set(newValue);
    }
    private __selectedDate: ObservedPropertyObjectPU<Date>;
    get selectedDate() {
        return this.__selectedDate.get();
    }
    set selectedDate(newValue: Date) {
        this.__selectedDate.set(newValue);
    }
    private __selectedHour: ObservedPropertySimplePU<number>;
    get selectedHour() {
        return this.__selectedHour.get();
    }
    set selectedHour(newValue: number) {
        this.__selectedHour.set(newValue);
    }
    private __selectedMinute: ObservedPropertySimplePU<number>;
    get selectedMinute() {
        return this.__selectedMinute.get();
    }
    set selectedMinute(newValue: number) {
        this.__selectedMinute.set(newValue);
    }
    private __selectedCategory: ObservedPropertySimplePU<string>;
    get selectedCategory() {
        return this.__selectedCategory.get();
    }
    set selectedCategory(newValue: string) {
        this.__selectedCategory.set(newValue);
    }
    private __todoNotes: ObservedPropertySimplePU<string>;
    get todoNotes() {
        return this.__todoNotes.get();
    }
    set todoNotes(newValue: string) {
        this.__todoNotes.set(newValue);
    }
    private __nameError: ObservedPropertySimplePU<string>;
    get nameError() {
        return this.__nameError.get();
    }
    set nameError(newValue: string) {
        this.__nameError.set(newValue);
    }
    // Initial display indices for TextPickers (non-@State to avoid re-render loop)
    private initialYearIndex: number;
    private initialMonthIndex: number;
    private initialDayIndex: number;
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(24);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Title
            Text.create('Add Task');
            // Title
            Text.fontSize(20);
            // Title
            Text.fontWeight(FontWeight.Bold);
            // Title
            Text.width('100%');
            // Title
            Text.textAlign(TextAlign.Start);
            // Title
            Text.margin({ bottom: 16 });
        }, Text);
        // Title
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Scrollable form area
            Scroll.create();
            // Scrollable form area
            Scroll.scrollable(ScrollDirection.Vertical);
            // Scrollable form area
            Scroll.scrollBar(BarState.Off);
            // Scrollable form area
            Scroll.layoutWeight(1);
            // Scrollable form area
            Scroll.width('100%');
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Task name input
            TextInput.create({ placeholder: 'Enter task name...', text: this.todoName });
            // Task name input
            TextInput.width('100%');
            // Task name input
            TextInput.height(48);
            // Task name input
            TextInput.onChange((value: string) => {
                this.todoName = value;
                this.nameError = '';
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Error message
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
            // Notes input
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Notes input
            Text.create('Notes');
            // Notes input
            Text.fontSize(16);
            // Notes input
            Text.fontWeight(FontWeight.Medium);
            // Notes input
            Text.width('100%');
            // Notes input
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // Notes input
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ placeholder: 'Add notes...', text: this.todoNotes });
            TextArea.width('100%');
            TextArea.height(80);
            TextArea.onChange((value: string) => {
                this.todoNotes = value;
            });
        }, TextArea);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Priority selector
            Text.create('Priority');
            // Priority selector
            Text.fontSize(16);
            // Priority selector
            Text.fontWeight(FontWeight.Medium);
            // Priority selector
            Text.width('100%');
            // Priority selector
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // Priority selector
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.width('100%');
            Row.justifyContent(FlexAlign.SpaceEvenly);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const priority = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Button.createWithLabel(PRIORITY_LABELS[priority]);
                    Button.height(36);
                    Button.backgroundColor(this.selectedPriority === priority ? PRIORITY_COLORS[priority] : '#E8E8E8');
                    Button.fontColor(this.selectedPriority === priority ? Color.White : '#333333');
                    Button.borderRadius(18);
                    Button.onClick(() => {
                        this.selectedPriority = priority;
                    });
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(elmtId, [PRIORITY_LOW, PRIORITY_MEDIUM, PRIORITY_HIGH], forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Due date toggle (tappable to expand/collapse)
            Row.create({ space: 12 });
            // Due date toggle (tappable to expand/collapse)
            Row.width('100%');
            // Due date toggle (tappable to expand/collapse)
            Row.margin({ top: 16 });
            // Due date toggle (tappable to expand/collapse)
            Row.onClick(() => {
                this.hasDueDate = !this.hasDueDate;
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Due Date');
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Toggle.create({ type: ToggleType.Switch, isOn: this.hasDueDate });
            Toggle.onChange((value: boolean) => {
                this.hasDueDate = value;
            });
        }, Toggle);
        Toggle.pop();
        // Due date toggle (tappable to expand/collapse)
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Date and Time pickers (only visible when hasDueDate is true)
            if (this.hasDueDate) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Three independent TextPickers for year, month, day
                        Row.create({ space: 4 });
                        // Three independent TextPickers for year, month, day
                        Row.width('100%');
                        // Three independent TextPickers for year, month, day
                        Row.justifyContent(FlexAlign.Center);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextPicker.create({ range: YEAR_RANGE, selected: this.initialYearIndex });
                        TextPicker.width(100);
                        TextPicker.onChange((value: string | string[], index: number | number[]) => {
                            const idx = index as number;
                            const year = START_YEAR + idx;
                            const newDate = new Date(this.selectedDate);
                            newDate.setFullYear(year);
                            // Sync day index after potential overflow (e.g., Feb 29 in non-leap year)
                            this.selectedDate = newDate;
                        });
                    }, TextPicker);
                    TextPicker.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextPicker.create({ range: MONTH_RANGE, selected: this.initialMonthIndex });
                        TextPicker.width(80);
                        TextPicker.onChange((value: string | string[], index: number | number[]) => {
                            const idx = index as number;
                            const newDate = new Date(this.selectedDate);
                            newDate.setMonth(idx);
                            // Sync day index after potential overflow (e.g., 31 -> Feb)
                            this.selectedDate = newDate;
                        });
                    }, TextPicker);
                    TextPicker.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextPicker.create({ range: DAY_RANGE, selected: this.initialDayIndex });
                        TextPicker.width(80);
                        TextPicker.onChange((value: string | string[], index: number | number[]) => {
                            const idx = index as number;
                            const newDate = new Date(this.selectedDate);
                            newDate.setDate(idx + 1);
                            this.selectedDate = newDate;
                        });
                    }, TextPicker);
                    TextPicker.pop();
                    // Three independent TextPickers for year, month, day
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 8 });
                        Row.width('100%');
                        Row.margin({ top: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('Time:');
                        Text.fontSize(16);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TimePicker.create({
                            selected: new Date(0, 0, 0, this.selectedHour, this.selectedMinute)
                        });
                        TimePicker.width(120);
                        TimePicker.onChange((value: TimePickerResult) => {
                            if (value.hour !== undefined) {
                                this.selectedHour = value.hour;
                            }
                            if (value.minute !== undefined) {
                                this.selectedMinute = value.minute;
                            }
                        });
                    }, TimePicker);
                    TimePicker.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    Row.pop();
                    Column.pop();
                });
            }
            // Category selector
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Category selector
            Text.create('Category');
            // Category selector
            Text.fontSize(16);
            // Category selector
            Text.fontWeight(FontWeight.Medium);
            // Category selector
            Text.width('100%');
            // Category selector
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // Category selector
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.scrollable(ScrollDirection.Horizontal);
            Scroll.scrollBar(BarState.Off);
            Scroll.width('100%');
            Scroll.height(48);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.padding({ right: 24 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // "None" option
            Button.createWithLabel('None');
            // "None" option
            Button.height(32);
            // "None" option
            Button.backgroundColor(this.selectedCategory.length === 0 ? '#007BFF' : '#E8E8E8');
            // "None" option
            Button.fontColor(this.selectedCategory.length === 0 ? Color.White : '#333333');
            // "None" option
            Button.borderRadius(16);
            // "None" option
            Button.fontSize(14);
            // "None" option
            Button.onClick(() => {
                this.selectedCategory = '';
            });
        }, Button);
        // "None" option
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const category = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Button.createWithLabel(category.name);
                    Button.height(32);
                    Button.backgroundColor(this.selectedCategory === category.id ? category.color : '#E8E8E8');
                    Button.fontColor(this.selectedCategory === category.id ? Color.White : '#333333');
                    Button.borderRadius(16);
                    Button.fontSize(14);
                    Button.onClick(() => {
                        this.selectedCategory = category.id;
                    });
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(elmtId, this.categories, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Scroll.pop();
        Column.pop();
        // Scrollable form area
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Confirm and Cancel buttons
            Row.create({ space: 12 });
            // Confirm and Cancel buttons
            Row.width('100%');
            // Confirm and Cancel buttons
            Row.margin({ top: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Cancel');
            Button.height(40);
            Button.width(100);
            Button.backgroundColor('#E8E8E8');
            Button.fontColor('#333333');
            Button.borderRadius(20);
            Button.onClick(() => {
                this.onDialogCancel();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Confirm');
            Button.height(40);
            Button.width(100);
            Button.backgroundColor('#007BFF');
            Button.fontColor(Color.White);
            Button.borderRadius(20);
            Button.onClick(() => {
                this.onDialogConfirm();
            });
        }, Button);
        Button.pop();
        // Confirm and Cancel buttons
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
