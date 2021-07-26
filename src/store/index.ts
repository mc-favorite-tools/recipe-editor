import { createContext, useReducer } from "react";

interface IStore {
    versionList: string[]
    version: string
    loading: boolean
    lang: Record<string, string>
}

type IAction =
| { type: 'UpdateVersion', payload: string }
| { type: 'UpdateLoading', payload: boolean }
| { type: 'UpdateLang', payload: Record<string, string> }

const defaultStore: IStore = {
    versionList: ['1.13', '1.14', '1.15', '1.16', '1.17', '1.18', '1.19'],
    version: '1.19',
    loading: false,
    lang: {},
}

export const AppContenxt = createContext<[IStore, React.Dispatch<IAction>]>([null, null])

function reducer(state: IStore, action: IAction) {
    switch (action.type) {
        case 'UpdateVersion':
            return {
                ...state,
                version: action.payload,
            }
        case 'UpdateLoading':
            return {
                ...state,
                loading: action.payload,
            }
        case 'UpdateLang':
            return {
                ...state,
                lang: action.payload,
            }
        default:
            return state;
    }
}

export function useAppReducer() {
    return useReducer(reducer, defaultStore)
}