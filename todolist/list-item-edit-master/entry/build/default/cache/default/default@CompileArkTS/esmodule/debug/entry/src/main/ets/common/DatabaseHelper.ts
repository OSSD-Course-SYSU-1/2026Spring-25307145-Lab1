import relationalStore from "@ohos:data.relationalStore";
import type { Context } from "@ohos:abilityAccessCtrl";
import { ToDo } from "@bundle:com.example.listitemedit/entry/ets/model/ToDo";
import { Category } from "@bundle:com.example.listitemedit/entry/ets/model/Category";
/**
 * Interface for the result of loadAllTodos.
 */
interface TodoLists {
    todoList: ToDo[];
    achieveList: ToDo[];
}
/**
 * Database helper for managing to-do data persistence.
 * Uses RdbStore for relational data storage.
 */
export class DatabaseHelper {
    private static instance: DatabaseHelper;
    private rdbStore: relationalStore.RdbStore | null = null;
    private constructor() {
    }
    /**
     * Gets the singleton instance of DatabaseHelper.
     */
    static getInstance(): DatabaseHelper {
        if (DatabaseHelper.instance === null || DatabaseHelper.instance === undefined) {
            DatabaseHelper.instance = new DatabaseHelper();
        }
        return DatabaseHelper.instance;
    }
    /**
     * Initializes the database, creating tables and default data if needed.
     * @param {Context} context - The application context.
     */
    async initDatabase(context: Context): Promise<void> {
        if (this.rdbStore !== null) {
            return;
        }
        const config: relationalStore.StoreConfig = {
            name: 'todo.db',
            securityLevel: relationalStore.SecurityLevel.S1
        };
        this.rdbStore = await relationalStore.getRdbStore(context, config);
        // Create todo table
        await this.rdbStore.executeSql('CREATE TABLE IF NOT EXISTS todo (' +
            'id TEXT PRIMARY KEY, ' +
            'name TEXT NOT NULL, ' +
            'isCompleted INTEGER NOT NULL DEFAULT 0, ' +
            'priority INTEGER NOT NULL DEFAULT 1, ' +
            'dueDate INTEGER NOT NULL DEFAULT 0, ' +
            'category TEXT NOT NULL DEFAULT \'\', ' +
            'notes TEXT NOT NULL DEFAULT \'\', ' +
            'createTime INTEGER NOT NULL, ' +
            'updateTime INTEGER NOT NULL' +
            ')');
        // Create category table
        await this.rdbStore.executeSql('CREATE TABLE IF NOT EXISTS category (' +
            'id TEXT PRIMARY KEY, ' +
            'name TEXT NOT NULL, ' +
            'color TEXT NOT NULL DEFAULT \'#007BFF\'' +
            ')');
        // Migration: add notes column for existing databases
        try {
            await this.rdbStore.executeSql('ALTER TABLE todo ADD COLUMN notes TEXT NOT NULL DEFAULT \'\'');
        }
        catch (error) {
            // Column already exists, ignore
        }
        // Insert default categories if table is empty
        await this.insertDefaultCategories();
    }
    /**
     * Inserts default categories if none exist.
     */
    private async insertDefaultCategories(): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        const predicates = new relationalStore.RdbPredicates('category');
        const resultSet = await this.rdbStore.query(predicates);
        const count = resultSet.rowCount;
        resultSet.close();
        if (count === 0) {
            const defaultCategoryNames: string[] = ['Work', 'Personal', 'Study', 'Shopping', 'Other'];
            const defaultCategoryColors: string[] = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#95A5A6'];
            for (let i = 0; i < defaultCategoryNames.length; i++) {
                const category = new Category(defaultCategoryNames[i], defaultCategoryColors[i]);
                const value: relationalStore.ValuesBucket = {
                    'id': category.id,
                    'name': category.name,
                    'color': category.color
                };
                await this.rdbStore.insert('category', value);
            }
        }
    }
    /**
     * Sets the RdbStore instance (used when initialized externally).
     */
    setRdbStore(store: relationalStore.RdbStore): void {
        this.rdbStore = store;
    }
    /**
     * Inserts a new to-do item into the database.
     * @param {ToDo} todo - The to-do item to insert.
     */
    async insertTodo(todo: ToDo): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        const value: relationalStore.ValuesBucket = {
            'id': todo.key,
            'name': todo.name,
            'isCompleted': todo.isCompleted ? 1 : 0,
            'priority': todo.priority,
            'dueDate': todo.dueDate,
            'category': todo.category,
            'notes': todo.notes,
            'createTime': todo.createTime,
            'updateTime': todo.updateTime
        };
        await this.rdbStore.insert('todo', value);
    }
    /**
     * Updates a to-do item in the database.
     * @param {ToDo} todo - The to-do item with updated values.
     */
    async updateTodo(todo: ToDo): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        todo.updateTime = Date.now();
        const value: relationalStore.ValuesBucket = {
            'name': todo.name,
            'isCompleted': todo.isCompleted ? 1 : 0,
            'priority': todo.priority,
            'dueDate': todo.dueDate,
            'category': todo.category,
            'notes': todo.notes,
            'updateTime': todo.updateTime
        };
        const predicates = new relationalStore.RdbPredicates('todo');
        predicates.equalTo('id', todo.key);
        await this.rdbStore.update(value, predicates);
    }
    /**
     * Updates the completion status of a to-do item.
     * @param {string} id - The ID of the to-do item.
     * @param {boolean} isCompleted - The new completion status.
     */
    async updateTodoStatus(id: string, isCompleted: boolean): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        const value: relationalStore.ValuesBucket = {
            'isCompleted': isCompleted ? 1 : 0,
            'updateTime': Date.now()
        };
        const predicates = new relationalStore.RdbPredicates('todo');
        predicates.equalTo('id', id);
        await this.rdbStore.update(value, predicates);
    }
    /**
     * Deletes a to-do item by ID.
     * @param {string} id - The ID of the to-do item to delete.
     */
    async deleteTodo(id: string): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        const predicates = new relationalStore.RdbPredicates('todo');
        predicates.equalTo('id', id);
        await this.rdbStore.delete(predicates);
    }
    /**
     * Deletes all completed to-do items.
     */
    async deleteAllCompleted(): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        const predicates = new relationalStore.RdbPredicates('todo');
        predicates.equalTo('isCompleted', 1);
        await this.rdbStore.delete(predicates);
    }
    /**
     * Deletes all uncompleted (ongoing) to-do items from the database.
     */
    async deleteAllUncompleted(): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        const predicates = new relationalStore.RdbPredicates('todo');
        predicates.equalTo('isCompleted', 0);
        await this.rdbStore.delete(predicates);
    }
    /**
     * Queries to-do items with optional filters.
     * @param {string} searchText - Optional text to search in name.
     * @param {string} categoryId - Optional category ID to filter.
     * @param {number} priorityFilter - Optional priority filter (-1 for all).
     * @returns {Promise<ToDo[]>} Array of matching to-do items.
     */
    async queryTodos(searchText?: string, categoryId?: string, priorityFilter?: number): Promise<ToDo[]> {
        if (this.rdbStore === null) {
            return [];
        }
        const predicates = new relationalStore.RdbPredicates('todo');
        if (searchText !== undefined && searchText.length > 0) {
            predicates.like('name', '%' + searchText + '%');
        }
        if (categoryId !== undefined && categoryId.length > 0) {
            predicates.equalTo('category', categoryId);
        }
        if (priorityFilter !== undefined && priorityFilter >= 0) {
            predicates.equalTo('priority', priorityFilter);
        }
        const resultSet = await this.rdbStore.query(predicates);
        const todos = this.parseTodoResultSet(resultSet);
        resultSet.close();
        todos.sort((a, b) => b.createTime - a.createTime);
        return todos;
    }
    /**
     * Loads all to-do items from the database, separated by completion status.
     * @returns {Promise<{todoList: ToDo[], achieveList: ToDo[]}>} Separated to-do lists.
     */
    async loadAllTodos(): Promise<TodoLists> {
        if (this.rdbStore === null) {
            return { todoList: [], achieveList: [] };
        }
        const todoPredicates = new relationalStore.RdbPredicates('todo');
        todoPredicates.equalTo('isCompleted', 0);
        const todoResult = await this.rdbStore.query(todoPredicates);
        const todoList = this.parseTodoResultSet(todoResult);
        todoResult.close();
        todoList.sort((a, b) => b.createTime - a.createTime);
        const achievePredicates = new relationalStore.RdbPredicates('todo');
        achievePredicates.equalTo('isCompleted', 1);
        const achieveResult = await this.rdbStore.query(achievePredicates);
        const achieveList = this.parseTodoResultSet(achieveResult);
        achieveResult.close();
        achieveList.sort((a, b) => b.updateTime - a.updateTime);
        return { todoList, achieveList };
    }
    /**
     * Parses a ResultSet into an array of ToDo objects.
     * @param {relationalStore.ResultSet} resultSet - The result set to parse.
     * @returns {ToDo[]} Array of ToDo objects.
     */
    private parseTodoResultSet(resultSet: relationalStore.ResultSet): ToDo[] {
        const todos: ToDo[] = [];
        while (resultSet.goToNextRow()) {
            const todo = new ToDo('');
            todo.key = resultSet.getString(resultSet.getColumnIndex('id'));
            todo.name = resultSet.getString(resultSet.getColumnIndex('name'));
            todo.isCompleted = resultSet.getLong(resultSet.getColumnIndex('isCompleted')) === 1;
            todo.priority = resultSet.getLong(resultSet.getColumnIndex('priority'));
            todo.dueDate = resultSet.getLong(resultSet.getColumnIndex('dueDate'));
            todo.category = resultSet.getString(resultSet.getColumnIndex('category'));
            todo.notes = resultSet.getString(resultSet.getColumnIndex('notes'));
            todo.createTime = resultSet.getLong(resultSet.getColumnIndex('createTime'));
            todo.updateTime = resultSet.getLong(resultSet.getColumnIndex('updateTime'));
            todos.push(todo);
        }
        return todos;
    }
    /**
     * Gets all categories from the database.
     * @returns {Promise<Category[]>} Array of categories.
     */
    async getAllCategories(): Promise<Category[]> {
        if (this.rdbStore === null) {
            return [];
        }
        const predicates = new relationalStore.RdbPredicates('category');
        const resultSet = await this.rdbStore.query(predicates);
        const categories: Category[] = [];
        while (resultSet.goToNextRow()) {
            const category = new Category('', '');
            category.id = resultSet.getString(resultSet.getColumnIndex('id'));
            category.name = resultSet.getString(resultSet.getColumnIndex('name'));
            category.color = resultSet.getString(resultSet.getColumnIndex('color'));
            categories.push(category);
        }
        resultSet.close();
        return categories;
    }
    /**
     * Gets a category by its name.
     * @param {string} name - The category name.
     * @returns {Promise<Category | null>} The category or null if not found.
     */
    async getCategoryByName(name: string): Promise<Category | null> {
        if (this.rdbStore === null) {
            return null;
        }
        const predicates = new relationalStore.RdbPredicates('category');
        predicates.equalTo('name', name);
        const resultSet = await this.rdbStore.query(predicates);
        let category: Category | null = null;
        if (resultSet.goToNextRow()) {
            category = new Category('', '');
            category.id = resultSet.getString(resultSet.getColumnIndex('id'));
            category.name = resultSet.getString(resultSet.getColumnIndex('name'));
            category.color = resultSet.getString(resultSet.getColumnIndex('color'));
        }
        resultSet.close();
        return category;
    }
    /**
     * Inserts a new category.
     * @param {Category} category - The category to insert.
     */
    async insertCategory(category: Category): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        const value: relationalStore.ValuesBucket = {
            'id': category.id,
            'name': category.name,
            'color': category.color
        };
        await this.rdbStore.insert('category', value);
    }
    /**
     * Updates an existing category.
     * @param {Category} category - The category with updated values.
     */
    async updateCategory(category: Category): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        const value: relationalStore.ValuesBucket = {
            'name': category.name,
            'color': category.color
        };
        const predicates = new relationalStore.RdbPredicates('category');
        predicates.equalTo('id', category.id);
        await this.rdbStore.update(value, predicates);
    }
    /**
     * Deletes a category by ID. Todos referencing it will have their category cleared.
     * @param {string} id - The category ID.
     */
    async deleteCategory(id: string): Promise<void> {
        if (this.rdbStore === null) {
            return;
        }
        // Update todos referencing this category to have no category
        const updateValue: relationalStore.ValuesBucket = {
            'category': ''
        };
        const todoPredicates = new relationalStore.RdbPredicates('todo');
        todoPredicates.equalTo('category', id);
        await this.rdbStore.update(updateValue, todoPredicates);
        // Delete the category
        const catPredicates = new relationalStore.RdbPredicates('category');
        catPredicates.equalTo('id', id);
        await this.rdbStore.delete(catPredicates);
    }
    /**
     * Closes the database connection.
     */
    async closeDatabase(): Promise<void> {
        if (this.rdbStore !== null) {
            await this.rdbStore.close();
            this.rdbStore = null;
        }
    }
}
