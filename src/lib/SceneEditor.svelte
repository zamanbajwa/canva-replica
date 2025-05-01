<script lang="ts">
    import { onMount } from 'svelte';
    import Konva from 'konva';
    import type { Scene, TextElement, ImageElement, TextAlignment, TextVerticalAlignment } from './types';

    let container: HTMLDivElement;
    let stage: Konva.Stage;
    let layer: Konva.Layer;
    let transformer: Konva.Transformer;
    let showJson = false;
    let scene: Scene = {
        width: 800,
        height: 600,
        elements: []
    };

    let selectedElement: TextElement | ImageElement | null = null;
    let editingText = false;
    let textInput: HTMLTextAreaElement;
    let dropX = 0;
    let dropY = 0;

    const fontFamilies = [
        'Arial',
        'Arial Black',
        'Comic Sans MS',
        'Courier New',
        'Georgia',
        'Impact',
        'Times New Roman',
        'Trebuchet MS',
        'Verdana',
        'Helvetica',
        'Tahoma',
        'Calibri',
        'Garamond',
        'Palatino',
        'Century Gothic',
        'Lucida Sans Unicode',
        'Book Antiqua',
        'Franklin Gothic Medium'
    ];

    function resizeTextToFit(textNode: Konva.Text, group: Konva.Group) {
        const padding = 10; // Add some padding
        const maxWidth = group.width() - padding * 2;
        const maxHeight = group.height() - padding * 2;
        
        // Start with the current font size
        let fontSize = textNode.fontSize();
        
        // Create a temporary text node to measure text size
        const tempText = new Konva.Text({
            text: textNode.text(),
            fontFamily: textNode.fontFamily(),
            fontSize: fontSize,
            padding: 0
        });
        
        // Decrease font size until text fits
        while ((tempText.width() > maxWidth || tempText.height() > maxHeight) && fontSize > 1) {
            fontSize -= 1;
            tempText.fontSize(fontSize);
        }
        
        // Apply the calculated font size
        textNode.fontSize(fontSize);
        
        // Center the text in the group
        textNode.x((group.width() - textNode.width()) / 2);
        textNode.y((group.height() - textNode.height()) / 2);
    }

    onMount(() => {
        stage = new Konva.Stage({
            container: container,
            width: scene.width,
            height: scene.height
        });

        // Add drag and drop event listeners
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragenter', handleDragEnter);

        layer = new Konva.Layer();
        stage.add(layer);

        transformer = new Konva.Transformer({
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
            rotationSnapTolerance: 5
        });
        layer.add(transformer);

        // Add background image if exists
        if (scene.backgroundImage) {
            const imageObj = new window.Image();
            imageObj.onload = () => {
                const bgImage = new Konva.Image({
                    image: imageObj,
                    width: scene.width,
                    height: scene.height
                });
                layer.add(bgImage);
                bgImage.moveToBottom();
                layer.draw();
            };
            imageObj.src = scene.backgroundImage;
        }

        // Add existing elements
        scene.elements.forEach(element => {
            addElementToLayer(element);
        });

        stage.on('click tap', (e) => {
            if (e.target === stage) {
                selectedElement = null;
                transformer.nodes([]);
                return;
            }
            const clickedGroup = e.target.getParent();
            if (clickedGroup) {
                const element = scene.elements.find(el => el.id === clickedGroup.id());
                if (element) {
                    selectedElement = element;
                    transformer.nodes([clickedGroup]);
                }
            }
        });

        stage.on('dblclick dbltap', (e) => {
            const clickedGroup = e.target.getParent();
            if (clickedGroup) {
                const element = scene.elements.find(el => el.id === clickedGroup.id());
                if (element?.type === 'text') {
                    startTextEdit(clickedGroup as Konva.Group);
                }
            }
        });
    });

    function startTextEdit(group: Konva.Group) {
        editingText = true;
        const textNode = group.findOne('Text') as Konva.Text;
        const textPosition = group.absolutePosition();
        const textWidth = textNode.width();
        const textHeight = textNode.height();

        // Create and position textarea over the text element
        if (!textInput) {
            textInput = document.createElement('textarea');
            document.body.appendChild(textInput);
        }

        textInput.value = textNode.text();
        textInput.style.position = 'absolute';
        textInput.style.top = textPosition.y + 'px';
        textInput.style.left = textPosition.x + 'px';
        textInput.style.width = textWidth + 'px';
        textInput.style.height = textHeight + 'px';
        textInput.style.fontSize = textNode.fontSize() + 'px';
        textInput.style.border = 'none';
        textInput.style.padding = '0px';
        textInput.style.margin = '0px';
        textInput.style.overflow = 'hidden';
        textInput.style.background = 'none';
        textInput.style.outline = 'none';
        textInput.style.resize = 'none';
        textInput.style.lineHeight = textNode.lineHeight() + '';
        textInput.style.fontFamily = textNode.fontFamily();
        textInput.style.transformOrigin = 'left top';
        textInput.style.textAlign = textNode.align();
        textInput.style.color = '#000000';
        
        textInput.focus();

        textInput.addEventListener('blur', () => {
            endTextEdit(group);
        });
    }

    function endTextEdit(group: Konva.Group) {
        editingText = false;
        const textNode = group.findOne('Text') as Konva.Text;
        const element = scene.elements.find(el => el.id === group.id()) as TextElement;
        if (element && textInput) {
            element.text = textInput.value;
            textNode.text(textInput.value);
            textNode.verticalAlign(element.textAlignmentVertical);
            layer.draw();
        }
    }

    function addElementToLayer(element: TextElement | ImageElement) {
        let konvaElement: Konva.Group;

        if (element.type === 'text') {
            const text = new Konva.Text({
                text: element.text,
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                fill: element.fill,
                width: element.width,
                height: element.height,
                align: element.textAlignment,
                verticalAlign: element.textAlignmentVertical,
                fontStyle: `${element.italic ? 'italic' : ''} ${element.bold ? 'bold' : ''}`.trim() || 'normal',
                textDecoration: element.underline ? 'underline' : '',
                strokeWidth: element.borderSize,
                stroke: element.borderColor,
                shadowColor: element.shadowColor,
                shadowBlur: element.shadowRadius,
                shadowOffset: {
                    x: element.shadowX,
                    y: element.shadowY
                },
                lineHeight: 1 + element.lineSpacing,
                padding: 0,
                x: 0,
                y: 0
            });

            konvaElement = new Konva.Group({
                id: element.id,
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                rotation: element.rotation,
                opacity: element.opacity,
                draggable: true
            });

            konvaElement.add(text);
        } else {
            const imageObj = new window.Image();
            imageObj.onload = () => {
                const image = new Konva.Image({
                    image: imageObj,
                    width: element.width,
                    height: element.height
                });

                konvaElement = new Konva.Group({
                    id: element.id,
                    x: element.x,
                    y: element.y,
                    width: element.width,
                    height: element.height,
                    rotation: element.rotation,
                    opacity: element.opacity,
                    draggable: true
                });

                konvaElement.add(image);
                layer.add(konvaElement);
                layer.draw();
            };
            imageObj.src = element.src;
            return;
        }

        konvaElement.on('dragmove', () => {
            const element = scene.elements.find(el => el.id === konvaElement.id());
            if (element) {
                element.x = konvaElement.x();
                element.y = konvaElement.y();
            }
        });

        konvaElement.on('transformend', () => {
            const element = scene.elements.find(el => el.id === konvaElement.id());
            if (element) {
                element.x = konvaElement.x();
                element.y = konvaElement.y();
                element.width = konvaElement.width() * konvaElement.scaleX();
                element.height = konvaElement.height() * konvaElement.scaleY();
                element.rotation = konvaElement.rotation();
            }
        });

        layer.add(konvaElement);
        layer.draw();
    }

    function moveElementToFront() {
        if (selectedElement) {
            const element = layer.findOne('#' + selectedElement.id);
            if (element) {
                element.moveToTop();
                layer.draw();
            }
        }
    }

    function moveElementToBack() {
        if (selectedElement) {
            const element = layer.findOne('#' + selectedElement.id);
            if (element) {
                element.moveToBottom();
                layer.draw();
            }
        }
    }

    function moveElementForward() {
        if (selectedElement) {
            const element = layer.findOne('#' + selectedElement.id);
            if (element) {
                element.moveUp();
                layer.draw();
            }
        }
    }

    function moveElementBackward() {
        if (selectedElement) {
            const element = layer.findOne('#' + selectedElement.id);
            if (element) {
                element.moveDown();
                layer.draw();
            }
        }
    }

    function addText() {
        const newText: TextElement = {
            id: `text-${Date.now()}`,
            type: 'text',
            text: 'New Text',
            x: 100,
            y: 100,
            width: 200,
            height: 50,
            rotation: 0,
            opacity: 1,
            fontSize: 20,
            fontFamily: 'Arial',
            fill: '#000000',
            textAlignment: 'left',
            textAlignmentVertical: 'top',
            bold: false,
            italic: false,
            underline: false,
            borderSize: 0,
            borderColor: '#000000',
            shadowRadius: 0,
            shadowX: 0,
            shadowY: 0,
            shadowColor: '#000000',
            lines: 1,
            lineSpacing: 0
        };
        scene.elements = [...scene.elements, newText];
        addElementToLayer(newText);
    }

    function addImage(src: string, x: number, y: number) {
        const newImage: ImageElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            src,
            x,
            y,
            width: 200,
            height: 200,
            rotation: 0,
            opacity: 1
        };
        scene.elements = [...scene.elements, newImage];
        addElementToLayer(newImage);
    }

    function handleFileUpload(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    // Get the stage position
                    const stageRect = container.getBoundingClientRect();
                    // Add image at the center of the stage
                    const x = stageRect.width / 2 - 100; // Center horizontally (half width)
                    const y = stageRect.height / 2 - 100; // Center vertically (half height)
                    addImage(e.target.result as string, x, y);
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        addImage(e.target.result as string, dropX, dropY);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        const stageRect = container.getBoundingClientRect();
        dropX = e.clientX - stageRect.left - 100; // Center the image on drop point
        dropY = e.clientY - stageRect.top - 100; // Center the image on drop point
    }

    function handleDragEnter(e: DragEvent) {
        e.preventDefault();
    }

    function exportScene() {
        return JSON.stringify(scene, null, 2);
    }

    function deleteSelectedElement() {
        if (selectedElement) {
            // Remove from scene
            scene.elements = scene.elements.filter(el => el.id !== selectedElement.id);
            
            // Remove from layer
            const element = layer.findOne('#' + selectedElement.id);
            if (element) {
                element.destroy();
                layer.draw();
            }
            
            // Clear selection
            selectedElement = null;
            transformer.nodes([]);
        }
    }

    function toggleJsonView() {
        showJson = !showJson;
    }

    function getPrettyJson() {
        // Create a clean copy of the scene without the actual image data
        const cleanScene = {
            ...scene,
            elements: scene.elements.map(element => {
                if (element.type === 'image') {
                    return {
                        ...element,
                        src: element.src.substring(0, 50) + '...' // Truncate base64 data
                    };
                }
                return element;
            })
        };
        return JSON.stringify(cleanScene, null, 2);
    }

    function copyJson() {
        navigator.clipboard.writeText(getPrettyJson());
    }

    $: if (selectedElement) {
        const element = layer.findOne('#' + selectedElement.id);
        if (element) {
            // Update position from input changes
            element.x(selectedElement.x);
            element.y(selectedElement.y);

            if (selectedElement.type === 'text') {
                const group = element as Konva.Group;
                const text = group.children[0] as Konva.Text;
                text.text(selectedElement.text);
                text.fontSize(selectedElement.fontSize);
                text.fontFamily(selectedElement.fontFamily);
                text.fill(selectedElement.fill);
                text.align(selectedElement.textAlignment);
                text.verticalAlign(selectedElement.textAlignmentVertical);
                text.fontStyle(`${selectedElement.italic ? 'italic' : ''} ${selectedElement.bold ? 'bold' : ''}`.trim() || 'normal');
                text.textDecoration(selectedElement.underline ? 'underline' : '');
                text.strokeWidth(selectedElement.borderSize);
                text.stroke(selectedElement.borderColor);
                text.shadowColor(selectedElement.shadowColor);
                text.shadowBlur(selectedElement.shadowRadius);
                text.shadowOffset({
                    x: selectedElement.shadowX,
                    y: selectedElement.shadowY
                });
                text.lineHeight(1 + selectedElement.lineSpacing);
            } else if (selectedElement.type === 'image') {
                const group = element as Konva.Group;
                const image = group.children[0] as Konva.Image;
                image.width(selectedElement.width);
                image.height(selectedElement.height);
                image.opacity(selectedElement.opacity);
                group.rotation(selectedElement.rotation);
            }
            
            layer.draw();
        }
    }
</script>

<div class="editor-container">
    <div class="toolbar">
        <div class="toolbar-buttons">
            <button on:click={addText}>Add Text</button>
            <input type="file" accept="image/*" on:change={handleFileUpload} />
            <button on:click={toggleJsonView}>{showJson ? 'Hide JSON' : 'View JSON'}</button>
        </div>

        {#if showJson}
            <div class="json-section">
                <div class="json-controls">
                    <button on:click={copyJson}>Copy JSON</button>
                    <button on:click={toggleJsonView}>Close</button>
                </div>
                <pre>{getPrettyJson()}</pre>
            </div>
        {/if}
    </div>

    <div class="stage-container">
        <div bind:this={container}></div>
    </div>

    {#if selectedElement}
        <div class="properties-panel">
            <h3>Properties</h3>
            <div>
                <button class="delete-button" on:click={deleteSelectedElement}>Delete Element</button>
                <div class="z-index-controls">
                    <button on:click={moveElementToFront}>Bring to Front</button>
                    <button on:click={moveElementToBack}>Send to Back</button>
                    <button on:click={moveElementForward}>Bring Forward</button>
                    <button on:click={moveElementBackward}>Send Backward</button>
                </div>
                <label>X: <input type="number" bind:value={selectedElement.x} /></label>
                <label>Y: <input type="number" bind:value={selectedElement.y} /></label>
                <label>Width: <input type="number" bind:value={selectedElement.width} /></label>
                <label>Height: <input type="number" bind:value={selectedElement.height} /></label>
                <label>Rotation: <input type="number" bind:value={selectedElement.rotation} /></label>
                <label>Opacity: <input type="number" min="0" max="1" step="0.1" bind:value={selectedElement.opacity} /></label>
                
                {#if selectedElement.type === 'text'}
                    <label>Text: <textarea bind:value={selectedElement.text}></textarea></label>
                    <label>Font Size: <input type="number" bind:value={selectedElement.fontSize} /></label>
                    
                    <label>Font Family:
                        <select bind:value={selectedElement.fontFamily}>
                            {#each fontFamilies as font}
                                <option value={font}>{font}</option>
                            {/each}
                        </select>
                    </label>
                    
                    <label>Color: <input type="color" bind:value={selectedElement.fill} /></label>
                    
                    <label>Text Alignment:
                        <select bind:value={selectedElement.textAlignment}>
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justified">Justified</option>
                        </select>
                    </label>
                    
                    <label>Vertical Alignment:
                        <select bind:value={selectedElement.textAlignmentVertical}>
                            <option value="top">Top</option>
                            <option value="center">Center</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </label>
                    
                    <label>
                        <input type="checkbox" bind:checked={selectedElement.bold} />
                        Bold
                    </label>
                    
                    <label>
                        <input type="checkbox" bind:checked={selectedElement.italic} />
                        Italic
                    </label>
                    
                    <label>
                        <input type="checkbox" bind:checked={selectedElement.underline} />
                        Underline
                    </label>
                    
                    <label>Border Size: <input type="number" min="0" bind:value={selectedElement.borderSize} /></label>
                    <label>Border Color: <input type="color" bind:value={selectedElement.borderColor} /></label>
                    
                    <label>Shadow Radius: <input type="number" min="0" bind:value={selectedElement.shadowRadius} /></label>
                    <label>Shadow X: <input type="number" bind:value={selectedElement.shadowX} /></label>
                    <label>Shadow Y: <input type="number" bind:value={selectedElement.shadowY} /></label>
                    <label>Shadow Color: <input type="color" bind:value={selectedElement.shadowColor} /></label>
                    
                    <label>Line Spacing: <input type="number" min="0" step="0.1" bind:value={selectedElement.lineSpacing} /></label>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .editor-container {
        display: flex;
        height: 100vh;
        overflow: hidden;
    }

    .toolbar {
        padding: 10px;
        background: #f0f0f0;
        border-right: 1px solid #ccc;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 300px;
        min-width: 300px;
        overflow-y: auto;
    }

    .toolbar-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .stage-container {
        flex: 1;
        padding: 20px;
        background: #fff;
        overflow: auto;
        position: relative;
    }

    .properties-panel {
        width: 300px;
        padding: 10px;
        background: #f0f0f0;
        border-left: 1px solid #ccc;
        overflow-y: auto;
    }

    .delete-button {
        width: 100%;
        padding: 8px;
        margin-bottom: 15px;
        background-color: #ff4444;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }

    .delete-button:hover {
        background-color: #cc0000;
    }

    .properties-panel label {
        display: block;
        margin: 5px 0;
    }

    .properties-panel input[type="text"],
    .properties-panel input[type="number"],
    .properties-panel input[type="color"],
    .properties-panel select,
    .properties-panel textarea {
        width: 100%;
        margin-top: 2px;
        padding: 4px;
    }

    .properties-panel textarea {
        min-height: 60px;
        resize: vertical;
    }

    .properties-panel input[type="checkbox"] {
        margin-right: 5px;
    }

    .properties-panel select {
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .z-index-controls {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
        margin-bottom: 15px;
    }

    .z-index-controls button {
        padding: 5px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .z-index-controls button:hover {
        background-color: #45a049;
    }

    .json-section {
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 10px;
        margin-top: 10px;
        flex-shrink: 0;
    }

    .json-controls {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }

    .json-controls button {
        padding: 5px 10px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .json-controls button:hover {
        background-color: #45a049;
    }

    .json-section pre {
        margin: 0;
        padding: 10px;
        background: #f8f8f8;
        border-radius: 4px;
        font-family: monospace;
        font-size: 14px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 400px;
        overflow-y: auto;
    }
</style> 