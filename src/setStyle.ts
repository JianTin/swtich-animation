// 设置 value值
import calculateInstance from './calculate'
import {elementKey, styleName, styleStore} from './base'
import {EasingFunction} from 'bezier-easing'

class SetStyleValue {
    transformKey: Array<string>
    constructor(){
        this.transformKey = [
            'rotate', 'rotateX', 'rotateY', 'rotateZ' ,
            'translateX', 'translateY', 'translateZ', 
            'scaleX', 'scaleY', 'scaleZ', 
            'skewX', 'skewY'
        ]
    }
    set<T extends elementKey>(
        element: HTMLElementTagNameMap[T], styleStore: styleStore, styleName: styleName, runDate: number, direction:boolean, easingFn: EasingFunction
    ){
        const {unit} = styleStore
        const val = calculateInstance.calculateVal(styleStore, styleName, runDate, direction, easingFn)
        // 处理transform
        if(this.transformKey.includes(styleName)){
            this.setTransform(element, styleName, val as number, unit)
        } else { // 处理正常
            this.setBaseStyle(element, styleName, val as number, unit)
        }
    }
    setTransform = (element: HTMLElement, styleName: string, styleVal: number, unit: string)=> {
        let transformVal = element.style['transform']
        const bool = transformVal.includes(styleName)
        // transform 内部存在该值，删除重新处理
        if(bool) {
            // /translateX\([0-9]+%{0,}[p|x]{0,}\)/
            transformVal = transformVal.replace(new RegExp(`${styleName}\\(-*[0-9]*\\.*[0-9]*${unit}\\)`, 'g'), '')
        }
        transformVal += ` ${styleName}(${styleVal}${unit})`
        element.style['transform'] = transformVal
    }
    setBaseStyle = (element: HTMLElement, styleName: string, styleVal: number, unit: string)=> {
        element.style[styleName as any] = styleVal+unit
    }
}

export default new SetStyleValue()