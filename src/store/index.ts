/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import jszip from "jszip";
import { createContext, useReducer } from "react";

interface IStore {
    versionList: string[]
    version: string
    loading: boolean
    lang: Record<string, string>
    tagZip: jszip
    recipeZip: jszip
}

type IAction =
| { type: 'UpdateVersion', payload: string }
| { type: 'UpdateLoading', payload: boolean }
| { type: 'UpdateLang', payload: Record<string, string> }
| { type: 'UpdateTagZip', payload: jszip }
| { type: 'UpdateRecipeZip', payload: jszip }

const defaultStore: IStore = {
    versionList: ['1.13', '1.14', '1.15', '1.16', '1.17', '1.18', '1.19', '1.20'],
    version: '1.20',
    loading: false,
    lang: {},
    tagZip: null,
    recipeZip: null,
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
        case 'UpdateTagZip':
            return {
                ...state,
                tagZip: action.payload,
            }
        case 'UpdateRecipeZip':
            return {
                ...state,
                recipeZip: action.payload,
            }
        default:
            return state;
    }
}

export function useAppReducer() {
    return useReducer(reducer, defaultStore)
}