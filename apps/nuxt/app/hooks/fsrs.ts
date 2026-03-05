import { Rating } from "ts-fsrs"

export function useGetGradeByWrongTimes() {
    let store = useSettingStore()
    function getGradeByWrongTimes(wrongTimes?: number): Rating {
        if (wrongTimes !== undefined) {
            if (wrongTimes <= store.fsrsEasyLimit ) return Rating.Easy
            else if (wrongTimes <= store.fsrsGoodLimit) return Rating.Good
            else if (wrongTimes <= store.fsrsHardLimit) return Rating.Hard
            else return Rating.Again
        } else {
            return Rating.Easy
        }
    }
    return { getGradeByWrongTimes }
}
