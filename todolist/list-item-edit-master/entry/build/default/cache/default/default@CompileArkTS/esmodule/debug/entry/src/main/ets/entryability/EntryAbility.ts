import AbilityConstant from "@ohos:app.ability.AbilityConstant";
import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import hilog from "@ohos:hilog";
import type window from "@ohos:window";
/**
 * Interface for save state object.
 */
interface SaveState {
    filterCategory: string;
    searchText: string;
    lastSyncTime: number;
}
/**
 * Global continuation state holder for communication between Ability and pages.
 */
export class ContinuationState {
    static filterCategory: string = '';
    static searchText: string = '';
    static lastSyncTime: number = 0;
}
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        hilog.info(0x0000, 'EntryAbility', '%{public}s', 'Ability onCreate');
    }
    onDestroy(): void {
        hilog.info(0x0000, 'EntryAbility', '%{public}s', 'Ability onDestroy');
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        hilog.info(0x0000, 'EntryAbility', '%{public}s', 'Ability onWindowStageCreate');
        windowStage.loadContent('pages/Index', (err) => {
            if (err && err.code) {
                hilog.error(0x0000, 'EntryAbility', 'Failed to load content: %{public}s', JSON.stringify(err) ?? '');
                return;
            }
            hilog.info(0x0000, 'EntryAbility', 'Succeeded in loading the content.');
        });
    }
    onWindowStageDestroy(): void {
        hilog.info(0x0000, 'EntryAbility', '%{public}s', 'Ability onWindowStageDestroy');
    }
    onForeground(): void {
        hilog.info(0x0000, 'EntryAbility', '%{public}s', 'Ability onForeground');
    }
    onBackground(): void {
        hilog.info(0x0000, 'EntryAbility', '%{public}s', 'Ability onBackground');
    }
    /**
     * Called on the source device to check if continuation can proceed.
     */
    onStartContinuation(): boolean {
        hilog.info(0x0000, 'EntryAbility', '%{public}s', 'onStartContinuation');
        return true;
    }
    /**
     * Called on the source device to save state before continuation.
     * @param {Want} want - The Want object to store state into.
     */
    onSaveData(want: Want): void {
        hilog.info(0x0000, 'EntryAbility', '%{public}s', 'onSaveData');
        const state: SaveState = {
            filterCategory: ContinuationState.filterCategory,
            searchText: ContinuationState.searchText,
            lastSyncTime: Date.now()
        };
        want.parameters = {
            continuedState: JSON.stringify(state)
        };
        hilog.info(0x0000, 'EntryAbility', 'onSaveData: %{public}s', JSON.stringify(state));
    }
    /**
     * Called on the target device to restore state after continuation.
     * @param wantParam - The parameters containing the saved state.
     * @returns {AbilityConstant.OnContinueResult} Result of continuation.
     */
    onContinue(wantParam: Record<string, Object>): AbilityConstant.OnContinueResult {
        hilog.info(0x0000, 'EntryAbility', 'onContinue');
        const stateValue = wantParam['continuedState'];
        if (stateValue !== undefined && stateValue !== null) {
            const stateStr = String(stateValue);
            if (stateStr.length > 0) {
                try {
                    const state: SaveState = JSON.parse(stateStr) as SaveState;
                    ContinuationState.filterCategory = state.filterCategory !== undefined ? state.filterCategory : '';
                    ContinuationState.searchText = state.searchText !== undefined ? state.searchText : '';
                    ContinuationState.lastSyncTime = state.lastSyncTime !== undefined ? state.lastSyncTime : Date.now();
                    return AbilityConstant.OnContinueResult.AGREE;
                }
                catch (error) {
                    hilog.error(0x0000, 'EntryAbility', 'onContinue parse error');
                    return AbilityConstant.OnContinueResult.REJECT;
                }
            }
        }
        return AbilityConstant.OnContinueResult.REJECT;
    }
    /**
     * Called when a new Want is received while the ability is already running.
     * @param {Want} want - The new Want.
     */
    onNewWant(want: Want): void {
        hilog.info(0x0000, 'EntryAbility', 'onNewWant');
        const params = want.parameters;
        if (params !== undefined && params !== null) {
            const stateValue = params['continuedState'];
            if (stateValue !== undefined && stateValue !== null) {
                const stateStr = String(stateValue);
                if (stateStr.length > 0) {
                    try {
                        const state: SaveState = JSON.parse(stateStr) as SaveState;
                        ContinuationState.filterCategory = state.filterCategory !== undefined ? state.filterCategory : '';
                        ContinuationState.searchText = state.searchText !== undefined ? state.searchText : '';
                        ContinuationState.lastSyncTime = state.lastSyncTime !== undefined ? state.lastSyncTime : Date.now();
                    }
                    catch (error) {
                        hilog.error(0x0000, 'EntryAbility', 'onNewWant parse error');
                    }
                }
            }
        }
    }
}
