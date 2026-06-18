import util from "@ohos:util";
/**
 * Indicates the type of a to-do task.
 * @class
 */
@Observed
export class ToDo {
    key: string = util.generateRandomUUID(true);
    name: string;
    isCompleted: boolean = false;
    priority: number = 1; // 0: Low, 1: Medium, 2: High
    dueDate: number = 0; // timestamp, 0 means no due date
    category: string = ''; // category ID
    notes: string = '';
    createTime: number = Date.now();
    updateTime: number = Date.now();
    /**
     * Creates a new instance of a to-do item.
     * @param {string} name - To-do item name.
     */
    constructor(name: string) {
        this.name = name;
    }
}
