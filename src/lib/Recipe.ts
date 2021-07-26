import { CraftTypeId, CraftType, ICraftData, getType as getCustomType } from ".";
import { trimPrefix, addPrefix } from "../utils";

interface RecipeItem {
    tag?: string
    item?: string
}
interface RecipeResult {
    item: string
    count?: number
}
type Ingredient = RecipeItem | RecipeItem[]
/** 通用配方 */
interface IBaseRecipeProps {
    /** 配方类型 */
    type: string;
    /** 分组 */
    group?: string;
}
/** 锻造台 */
interface ISmithing extends IBaseRecipeProps {
    /** 原料 */
    base: Ingredient;
    /** 附加 */
    addition: Ingredient;
    /** 输出 */
    result: RecipeResult;
}
/** 高炉、营火、熔炉、烟熏炉配方 */
interface IBlasting extends IBaseRecipeProps {
    /** 原料 */
    ingredient: Ingredient;
    /** 输出 */
    result: string;
    /** 经验值 */
    experience: number;
    /** 烧制时间 */
    cookingtime?: number;
}
/** 切石机 */
interface IStoneCutting extends IBaseRecipeProps {
    /** 原料 */
    ingredient: Ingredient;
    /** 输出 */
    result: string;
    /** 输出物品的数量 */
    count: number;
}
/** 有序合成 */
interface ICraftingShaped extends IBaseRecipeProps {
    /** 匹配模式 */
    pattern: string[];
    /** 匹配键 */
    key: Record<string, Ingredient>;
    /** 输出 */
    result: RecipeResult;
}
/** 无序工作台 */
interface ICraftingShapeless extends IBaseRecipeProps {
    /** 原料 */
    ingredients: Ingredient;
    /** 输出 */
    result: RecipeResult;
}

export interface CustomRecipeItem {
    item: string[]
}

interface RecipeProps {
    type: CraftTypeId;
    ingredients?: CustomRecipeItem[];
    result: RecipeResult;
    group?: string;
    experience?: number;
    cookingtime?: number;
}

function getCustomRecipeItem(id: string | string[]): CustomRecipeItem {
    const ids = Array.isArray(id) ? id : [id]
    return { item: ids.map(trimPrefix) }
}

function getIdFromIngredient(ingredient: Ingredient) {
    const list = Array.isArray(ingredient) ? ingredient : [ingredient]
    return list.map(it => addPrefix(trimPrefix(it.item)))
}

function format(ingredient: Ingredient) {
    return getCustomRecipeItem(getIdFromIngredient(ingredient))
}

export default class Recipe {
    private static Keys = ['#', '$', '*', '%', '&', '|', '!', '+', '-']
    
    private static convertByPattern(data: any): CustomRecipeItem[] {
        return (data.pattern as string[]).join('').split('').reduce((acc: CustomRecipeItem[], v: string) => {
            if (v === ' ') {
                acc.push(undefined)
                return acc
            }
             // TODO 解析tag
             acc.push(format(data.key[v]))
            return acc
        }, [])
    }
    
    private static getDefaultValue (): RecipeProps {
        return {
            type: 'crafting_shaped',
            ingredients: [],
            result: undefined,
            group: '',
        }
    }
    
    public static getKeyPattern(ingredients: CustomRecipeItem[]) {
        const mark: Record<string, number> = {}
        const key: Record<string, Ingredient> = {}
        let index = 0
        const pattern: string[] = []
        let tmp = ''
        Array.from({ length: 9 }, () => '').forEach((_: string, i: number) => {
            const it = ingredients[i]
            if (it) {
                const kkey = it.item.join('-')
                const mIndex = mark[kkey]
                let k: string = ''
                if (mIndex === undefined) {
                    mark[kkey] = index
                    k = Recipe.Keys[index++]
                    key[k] = it.item.length > 1
                        ? it.item.map(v => ({ item: addPrefix(v) }))
                        : { item: addPrefix(it.item[0]) }
                } else {
                    k = Recipe.Keys[mIndex]
                }
                tmp += k
            } else {
                tmp += ' '
            }
            if (i % 3 === 2) {
                pattern.push(tmp)
                tmp = ''
            }
        })
        while (pattern.length) {
            const text = pattern[pattern.length - 1]
            if (! text.trim()) {
                pattern.pop()
                continue
            }
            break
        }
        return { key, pattern }
    }

    #data: RecipeProps = Recipe.getDefaultValue()
    
    public get data(): ICraftData {
        const { ingredients, result, ...rest } = this.#data
        return {
            ...rest,
            input: ingredients.map(it => {
                return it ? { id: it.item } : undefined
            }),
            output: (
                result
                    ? { id: result.item ? [result.item] : [], count: result.count }
                    : {}
            ),
        }
    }

    public reset() { this.#data = Recipe.getDefaultValue() }
    
    public import(data: any) {
        this.reset()
        const { group, experience, cookingtime } = data
        const type = trimPrefix(data.type) as CraftTypeId
        let ingredients: CustomRecipeItem[]
        if (type === 'crafting_shaped') {
            ingredients = Recipe.convertByPattern(data)
        } else if (type === 'crafting_shapeless') {
            ingredients = data.ingredients.map(it => format(it))
        } else if (type === 'smithing') {
            ingredients = [
                getCustomRecipeItem(data.base.item),
                getCustomRecipeItem(data.addition.item),
            ]
        } else {
            ingredients = [format(data.ingredient)]
        }
        let item: string
        let count: number
        if (typeof data.result === 'string') {
            item = trimPrefix(data.result)
            count = data.count || 1
        } else {
            item = trimPrefix(data.result.item)
            count = data.result.count
        }
        this.setProps({
            type,
            group,
            experience,
            cookingtime,
            ingredients,
            result: { item, count },
        })
    }
    
    public getProps(propsName: keyof RecipeProps) { return this.#data[propsName] }
    
    public setProps(props: Partial<RecipeProps>) {
        Object.keys(props).forEach(key => {
            this.#data[key] = props[key]
        })
    }
    
    public toJson() {
        const { ingredients, result, cookingtime, experience, group } = this.#data
        const t = getCustomType(this.#data.type)
        const type = addPrefix(this.#data.type)
        if (t === CraftType.CraftShaped) {
            const { pattern, key } = Recipe.getKeyPattern(ingredients)
            const data: ICraftingShaped = {
                type,
                key,
                pattern,
                result,
            }
            if (group) {
                return { ...data, group }
            }
            return data
        }
        if (t === CraftType.CraftShapeless) {
            const data: ICraftingShapeless = {
                type,
                result,
                ingredients: ingredients.map(it => it.item.map(i => ({ item: i }))) as Ingredient,
            }
            if (group) {
                return { ...data, group }
            }
            return data 
        }
        if (t === CraftType.StoneCutting) {
            const data: IStoneCutting = {
                type,
                count: result.count,
                result: result.item,
                ingredient: ingredients.map(it => ({ item: it.item[0] })),
            }
            if (group) {
                return { ...data, group }
            }
            return data
        }
        if (t === CraftType.Smithing) {
            const [base, addition] = ingredients.map(it => ({ item: it.item[0] }))
            const data: ISmithing = {
                type,
                base,
                addition,
                result: {
                    item: result?.item,
                    count: result?.count
                },
            }
            if (group) {
                return { ...data, group }
            }
            return data
        }
        const data: IBlasting = {
            type,
            cookingtime,
            experience,
            result: result?.item,
            ingredient: ingredients.map(it => ({ item: it.item[0] })),
        }
        if (group) {
            return { ...data, group }
        }
        return data
    }
}
