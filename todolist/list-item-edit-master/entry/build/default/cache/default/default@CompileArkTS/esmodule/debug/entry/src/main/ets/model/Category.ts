import util from "@ohos:util";
/**
 * Indicates the type of a category.
 * @class
 */
@Observed
export class Category {
    id: string = util.generateRandomUUID(true);
    name: string;
    color: string;
    constructor(name: string, color: string) {
        this.name = name;
        this.color = color;
    }
}
