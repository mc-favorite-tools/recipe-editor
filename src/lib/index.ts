// The GPL License, Copyright (c) 2021, hans0000
import { trimPrefix } from "../utils"

export enum CraftType {
    CraftShaped,        // 有序工作台
    CraftShapeless,     // 无序工作台
    StoneCutting,       // 切石机
    Smithing,           // 锻造台
    SmithingTransform,  // 锻造台 1.20+
    Other,              // 其他，高炉、营火、熔炉、烟熏炉
}
export type CraftTypeId = keyof typeof CraftMap
export const CraftMap = {
    crafting_shaped: { name: '有序合成', type: CraftType.CraftShaped, icon: 'crafting_table', disabled: [] },
    crafting_shapeless: { name: '无序合成', type: CraftType.CraftShapeless, icon: 'crafting_table', disabled: [] },
    smelting: { name: '熔炉', type: CraftType.Other, icon: 'furnace', disabled: [] },
    stonecutting: { name: '切石机', type: CraftType.StoneCutting, icon: 'stonecutter', disabled: ['1.13'] },
    smithing: { name: '锻造台', type: CraftType.Smithing, icon: 'smithing_table', disabled: ['1.13', '1.20'] },
    blasting: { name: '高炉', type: CraftType.Other, icon: 'blast_furnace', disabled: ['1.13'] },
    campfire_cooking: { name: '营火', type: CraftType.Other, icon: 'campfire', disabled: ['1.13'] },
    smoking: { name: '烟熏炉', type: CraftType.Other, icon: 'smoker', disabled: ['1.13'] },
    smithing_transform: { name: '锻造台', type: CraftType.SmithingTransform, icon: 'smithing_table', disabled: ['1.13', '1.14', '1.15', '1.16', '1.17', '1.18', '1.19'] },
}

const ERROR_NAME = 'error'

export interface ITileData { 
    id?: string[]
    count?: number
}

export interface ICraftData {
    type: CraftTypeId;
    group?: string;
    cookingtime?: number;
    experience?: number;
    input: ITileData[];
    output: ITileData;
}

export function getType(type: CraftTypeId) {
    if (type === 'crafting_shapeless') return CraftType.CraftShapeless
    if (type === 'crafting_shaped') return CraftType.CraftShaped
    if (type === 'stonecutting') return CraftType.StoneCutting
    if (type === 'smithing') return CraftType.Smithing
    if (type === 'smithing_transform') return CraftType.SmithingTransform
    return CraftType.Other 
}

function getOutput(result: any, count: number): ITileData {
    if (!result) return { id: [], count: 1 }
    if (typeof result === 'string') {
        return {
            id: [trimPrefix(result)],
            count: count ? count : 1
        }
    }
    return {
        id: [trimPrefix(result.item)],
        count: +result.count || 1
    }
}

function getCraftShaped(data: any): ITileData[] {
    if (!Array.isArray(data.pattern)) return [];
    return (data.pattern as any[]).reduce((s: any, v: string) => {
        if (!data.key) return [{}, {}, {}]
        const items = Array.from({ length: 3 }).map<ITileData>((_, i) => {
            const ch = v[i]
            if (ch?.trim()) {
                const item = data.key[ch]
                if (item.tag) {
                    // TODO 解析tag
                    return { id: [ERROR_NAME], count: 1 }
                }
                if (Array.isArray(item)) {
                    return { id: item.map(v => trimPrefix(v.item)), count: 1 }
                }
                return { id: [trimPrefix(item.item)], count: 1 }
            }
            return {}
        })
        return s.concat(items)
    }, [])
}

function getCraftShapeless(data: any): ITileData[] {
    if (!Array.isArray(data.ingredients)) return [];
    return data.ingredients.map((v: any) => {
        return { id: v.tag ? [ERROR_NAME] : [trimPrefix(v.item)], count: 1 }
    })
}

function getSmithing(data: any): ITileData[] {
    const base = data.base.tag ? { id: [ERROR_NAME ], count: 1 } : { id: [trimPrefix(data.base.item)], count: 1 }
    const addition = data.addition.tag ? { id: [ERROR_NAME ], count: 1 } : { id: [trimPrefix(data.addition.item)], count: 1 }
    return [base, addition]
}

function getOthers(data: any): ITileData[] {
    if (Array.isArray(data.ingredient)) {
        return data.ingredient.map((v: any) => ({ id: [trimPrefix(v)], count: 1 }))
    }
    return [{ id: [trimPrefix(data.ingredient.item)], count: 1 }]
}

export function transform(data: any) {
    const type = trimPrefix(data.type) as CraftTypeId
    let input: ITileData[] = []
    if (type === 'crafting_shaped') {
        input = getCraftShaped(data)
    } else if (type === 'crafting_shapeless') {
        input = getCraftShapeless(data)
    } else if (type === 'smithing') {
        input = getSmithing(data)
    } else {
        input = getOthers(data)
    }
    const output = getOutput(data.result, data.count)
    return {
        type,
        input,
        output,
    }
}