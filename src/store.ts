// 存储基础style
/**
 * {
 *  styleList: {styleName: '毫秒 处理数', color/bark:[number, number, number] },
 *  durationObj:{
 *      positive, negative: {startDuration, endDuration},
 *      direction: bool
 *  },
 *  instance: ...,
 *  endValue
 * }
 * all:
 * 0-1000': 
*/
import easing from './easing'
import colorString from 'color-string'
import {switchAnimationInstance, styleNamespace, configNamespace} from '../@types/index'
import {storeNamespace} from '../@types/store'

// 传递得value对象
type paramsValueObj = {
    startValue: string, endValue: string
}
type colorValueObj = {
    startValue: number[],
    endValue: number[]
}

class Store {
    globalStore: switchAnimationInstance | null
    store: {
        [type: string]: storeNamespace.typeStore
    }
    colorNameArray: Array<styleNamespace.color | 'border-color'>
    constructor(){
        // 全局的
        this.globalStore = null
        this.store = {}
        this.colorNameArray = ['color', 'background-color', 'border-color']
    }
    createType = (type: string)=>{
        if(!this.store[type]) {
            this.store[type] = {
                styleList: {},
                instance: null,
                durationObj: null,
                easingFn: null
            }
       }
    }
    // 全局的store，第一次初始化调用
    initGlobalStore = (instance: switchAnimationInstance)=>{
        this.globalStore = instance
    }
    // 添加storeStyle
    addStoreStyle = (type: string, name: styleNamespace.styleName, valueObj: paramsValueObj, unit: string, duration: number) => {
       this.createType(type)
       if(this.colorNameArray.includes(name as styleNamespace.color)) {// 判断是color么，是的话处理为需要的格式
           this.generateColorStyle(type, name as styleNamespace.color, valueObj, unit, duration)
       } else {
           this.generateBaseStyle(type, name, valueObj, unit, duration)
       }
    }
    // 添加当前实例
    addStoreInstance = (type: string, instance: switchAnimationInstance)=> {
       this.createType(type)
       this.store[type]['instance'] = instance
    }
    // 添加实例对应的 正反方向 --- 开始、结束值 用于做是否 运行动画判断
    addStoreDirection = (type: string, startDuration: number, endDuration: number)=>{
        this.createType(type)
        const allInstance = this.globalStore
        if(!allInstance) return;
        const allDuration = (allInstance as any).duration
        // 正向 800 - 1000
        // 反向，设置和之前相同的动画逻辑时间。0-200
        this.store[type]['durationObj'] = {
            positive: {startDuration, endDuration},
            negative: {
                startDuration: allDuration - endDuration,
                endDuration: allDuration - startDuration
            },
            direction: null,
            isStart: false
        }
    }
    // 添加贝塞尔函数
    addStoreEasing = (type: string, easingVal: configNamespace.easingVal) => {
        this.store[type]['easingFn'] = easing.createEasing(easingVal)
    }
    // 生成基础style每毫秒值
    generateBaseStyle(type: string, name: styleNamespace.styleName, valueObj: paramsValueObj, unit:string, duration: number){
        const [startValue, endValue] = Object.values(valueObj).map(v=>Number(v))
        const millisecond = (endValue - startValue) / duration
        const distance = endValue > startValue ? endValue - startValue : startValue - endValue
        const minValDistanceZero = endValue > startValue ? startValue : endValue
        this.store[type]['styleList'][name] = {
            startValue, endValue, millisecond, unit, distance, minValDistanceZero
        }
    }
    // 处理颜色 -> rgba()
    handelColorParams(valueObj: paramsValueObj){
        return Object.keys(valueObj).reduce<colorValueObj>((prev, key)=>{
            prev[key as keyof colorValueObj] = colorString.get(valueObj[key as keyof typeof valueObj])!.value
            return prev
        }, {startValue: [], endValue: []})
    }
    // 生成color每毫秒值
    generateColorStyle(type: string, name: styleNamespace.color, valueObj: paramsValueObj, unit: string, duration: number){
        const {startValue, endValue} = this.handelColorParams(valueObj)
        // sta: [0,0,0,0] end: [255,255,255,255]
        const [r1, g1, b1, a1] = startValue
        const [r2, g2, b2, a2] = endValue
        // 进行计算 每毫秒移动的值
        const millisecond = [r2-r1, g2-g1, b2-b1, a2-a1].map(val=>val/duration)
        // const distance = startValue.map((startColor, index)=>{
        //     const endColor = endValue[index]
        //     return endColor > startColor ? endColor - startColor : startColor - endColor
        // })
        const {distance, minValDistanceZero} = startValue.reduce<{distance: number[],minValDistanceZero: number[]}>((prev, startColor, index)=>{
            const endColor = endValue[index]
            prev['distance'].push(
                endColor > startColor ? endColor - startColor : startColor - endColor
            )
            prev['minValDistanceZero'].push(
                endColor > startColor ? startColor : endColor
            )
            return prev
        }, {
            distance: [],
            minValDistanceZero: []
        })
        if(startValue.length === 4 && endValue.length === 4 && millisecond.length === 4) {
            if(!this.store[type]) return;
            this.store[type]['styleList'][name] = {
                startValue: startValue as storeNamespace.colorValue,
                endValue: endValue as storeNamespace.colorValue,
                millisecond: millisecond as storeNamespace.colorValue,
                distance: distance as storeNamespace.colorValue,
                minValDistanceZero: minValDistanceZero as storeNamespace.colorValue,
                unit
            }
        }
    }
}

export default new Store()