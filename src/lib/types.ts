export interface RelativePosition {
    id: string;
    relativeType: 'LeftOf' | 'RightOf' | 'FromLeft' | 'FromRight';
    value: number;
}

export interface RelativeSize {
    id: string;
    relativeType: 'Width' | 'Height';
    value: number;
}

export type TextAlignment = 'left' | 'right' | 'center' | 'justified';
export type TextVerticalAlignment = 'top' | 'center' | 'bottom';

export interface BaseElement {
    id: string;
    type: 'text' | 'image';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    relativePositionX?: RelativePosition;
    relativePositionY?: RelativePosition;
    relativeSizeWidth?: RelativeSize;
    relativeSizeHeight?: RelativeSize;
}

export interface TextElement extends BaseElement {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
    fill: string;
    textAlignment: TextAlignment;
    textAlignmentVertical: TextVerticalAlignment;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    borderSize: number;
    borderColor: string;
    shadowRadius: number;
    shadowX: number;
    shadowY: number;
    shadowColor: string;
    lines: number;
    lineSpacing: number;
}

export interface ImageElement extends BaseElement {
    type: 'image';
    src: string;
}

export interface Scene {
    width: number;
    height: number;
    backgroundImage?: string;
    elements: (TextElement | ImageElement)[];
} 