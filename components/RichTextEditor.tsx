import React, { useRef, useEffect, useState } from 'react';
import {
    Bold, Italic, Link, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Heading1, Heading2, Heading3, Eraser, Columns, Image as ImageIcon,
    AlignHorizontalDistributeStart, AlignHorizontalDistributeEnd
} from 'lucide-react';
import '../src/styles/rich-text-editor.css';

const FONT_OPTIONS = [
    { label: 'Predeterminada', value: 'inherit' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: "'Times New Roman', serif" },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: "'Helvetica Neue', sans-serif" },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Courier New', value: "'Courier New', monospace" },
    { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
];

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onImageUpload?: (file: File) => Promise<string>;
    placeholder?: string;
    minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    onImageUpload,
    placeholder = 'Escribe aquí...',
    minHeight = '200px'
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isUpdatingRef = useRef(false);
    const [pendingAlignment, setPendingAlignment] = useState<'center' | 'left' | 'right'>('center');
    const [activeFont, setActiveFont] = useState('inherit');
    const [baseFont, setBaseFont] = useState('inherit');

    // Utility to get current selection's font
    const updateActiveStyles = () => {
        const font = document.queryCommandValue('fontName');

        let currentFont = font;
        // fallback to base font if no specific font is set on selection
        if (!font || font === 'inherit' || font === 'Default' || font === 'default') {
            currentFont = baseFont;
        }

        if (!currentFont || currentFont === 'inherit') {
            setActiveFont('inherit');
            return;
        }

        const cleanFont = currentFont.replace(/['"]/g, '').toLowerCase();

        const match = FONT_OPTIONS.find(opt => {
            if (opt.value === 'inherit') return false;
            const optVal = opt.value.replace(/['"]/g, '').toLowerCase();
            const optLabel = opt.label.toLowerCase();
            return optVal.includes(cleanFont) || cleanFont.includes(optLabel);
        });

        setActiveFont(match ? match.value : 'inherit');
    };

    const hydrateHTML = (html: string) => {
        if (!html) return { html: '', baseFont: 'inherit' };

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const wrapper = doc.querySelector('.maestro-font-wrapper') as HTMLElement;
        let extractedBaseFont = 'inherit';
        let innerHtml = html;

        if (wrapper) {
            extractedBaseFont = wrapper.style.fontFamily || 'inherit';
            innerHtml = wrapper.innerHTML;
            doc.body.innerHTML = innerHtml;
        }

        // Add removal functionality to blocks
        const containers = doc.querySelectorAll('.layout-columns, .content-img-container');
        containers.forEach(container => {
            if (!container.querySelector('.remove-btn')) {
                const btn = doc.createElement('button');
                btn.type = 'button';
                btn.className = 'remove-btn';
                btn.setAttribute('contenteditable', 'false');
                btn.title = 'Eliminar sección';
                btn.textContent = 'Eliminar';
                container.prepend(btn);

                if (container.getAttribute('contenteditable') !== 'false') {
                    container.setAttribute('contenteditable', 'false');
                }
            }
        });

        return {
            html: doc.body.innerHTML,
            baseFont: extractedBaseFont
        };
    };

    useEffect(() => {
        if (editorRef.current && !isUpdatingRef.current) {
            const { html: hydrated, baseFont: newBaseFont } = hydrateHTML(value || '');
            const currentHTML = editorRef.current.innerHTML;

            if (currentHTML !== hydrated) {
                editorRef.current.innerHTML = hydrated;
            }
            if (newBaseFont !== baseFont) {
                setBaseFont(newBaseFont);
            }
        }
    }, [value]);

    useEffect(() => {
        try {
            document.execCommand('styleWithCSS', false, 'true');
        } catch (e) {
            console.warn('Could not set styleWithCSS', e);
        }
    }, []);

    const handleInput = (specificBaseFont?: string) => {
        if (editorRef.current) {
            isUpdatingRef.current = true;
            const content = editorRef.current.innerHTML;
            const currentBase = specificBaseFont || baseFont;

            // Persist content wrapped in the global font choice
            const wrapped = `<div class="maestro-font-wrapper" style="font-family: ${currentBase};">${content}</div>`;
            onChange(wrapped);

            // Allow parent to process and send back the value before enabling reconciliation again
            setTimeout(() => { isUpdatingRef.current = false; }, 50);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('remove-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const container = target.closest('.layout-columns, .content-img-container');
            if (container) {
                container.remove();
                handleInput();
                setTimeout(() => editorRef.current?.focus(), 0);
            }
        } else {
            // Update UI styles after the cursor actually moves
            setTimeout(updateActiveStyles, 0);
        }
    };

    const handleKeyUp = () => {
        updateActiveStyles();
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        editorRef.current?.focus();
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand(command, false, value);
        handleInput();
        updateActiveStyles();
    };

    const insertLink = () => {
        const url = prompt('Ingresa la URL:');
        if (url) execCommand('createLink', url);
    };

    const formatHeading = (level: number) => {
        execCommand('formatBlock', `h${level}`);
    };

    const changeFontFamily = (font: string) => {
        editorRef.current?.focus();
        const selection = window.getSelection();

        // If selection is collapsed or invalid, change the global base font
        if (!selection || selection.isCollapsed || selection.toString().length === 0) {
            setBaseFont(font);
            // We pass the font directly to avoid state closure race conditions
            handleInput(font);
        } else {
            if (font === 'inherit') {
                // When resetting to default, we remove the font-family style
                // This is more reliable than execCommand('fontName', 'inherit') which is inconsistent
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.style.fontFamily = ''; // Clear explicit font
                range.surroundContents(span);

                // Optional: Flatten nested spans if they exist to keep HTML clean
                // But browsers usually handle font resetting better via CSS removal
                execCommand('fontName', 'inherit');
            } else {
                execCommand('fontName', font);
            }
        }
    };

    const insertColumns = () => {
        const columnsHtml = `
            <div class="layout-columns" contenteditable="false" style="position: relative;">
                <button type="button" class="remove-btn" contenteditable="false" title="Eliminar sección">Eliminar</button>
                <div class="layout-column" contenteditable="true"><p>Columna 1...</p></div>
                <div class="layout-column" contenteditable="true"><p>Columna 2...</p></div>
            </div>
            <p><br></p>
        `;
        execCommand('insertHTML', columnsHtml);
    };

    const triggerImageUpload = (alignment: 'center' | 'left' | 'right') => {
        setPendingAlignment(alignment);
        fileInputRef.current?.click();
    };

    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImageUpload) {
            try {
                const url = await onImageUpload(file);
                let containerClass = 'content-img-container';
                if (pendingAlignment === 'left') containerClass += ' float-left';
                if (pendingAlignment === 'right') containerClass += ' float-right';

                const imageHtml = `
                    <div class="${containerClass}" contenteditable="false" style="position: relative;">
                        <button type="button" class="remove-btn" contenteditable="false" title="Eliminar sección">Eliminar</button>
                        <img src="${url}" class="content-img" alt="Blog Image" />
                        <div class="img-caption" contenteditable="true">Pie de foto...</div>
                    </div>
                `;
                execCommand('insertHTML', imageHtml);
            } catch (error) {
                console.error('Error uploading image to editor:', error);
                alert('No se pudo subir la imagen.');
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="rich-text-editor">
            <input type="file" ref={fileInputRef} onChange={handleImageFileChange} className="hidden" accept="image/*" />

            <div className="toolbar">
                <button type="button" onClick={() => execCommand('bold')} title="Negrita" className="toolbar-btn"><Bold size={16} /></button>
                <button type="button" onClick={() => execCommand('italic')} title="Cursiva" className="toolbar-btn"><Italic size={16} /></button>
                <button type="button" onClick={() => execCommand('underline')} title="Subrayado" className="toolbar-btn"><span className="underline">U</span></button>

                <div className="toolbar-divider" />

                <button type="button" onClick={() => formatHeading(1)} title="Encabezado 1" className="toolbar-btn"><Heading1 size={16} /></button>
                <button type="button" onClick={() => formatHeading(2)} title="Encabezado 2" className="toolbar-btn"><Heading2 size={16} /></button>
                <button type="button" onClick={() => formatHeading(3)} title="Encabezado 3" className="toolbar-btn"><Heading3 size={16} /></button>

                <div className="toolbar-divider" />

                <button type="button" onClick={insertColumns} title="Insertar Columnas" className="toolbar-btn text-maestro-gold border-maestro-gold/30">
                    <Columns size={16} />
                </button>

                <div className="flex bg-white/5 rounded-sm p-0.5 border border-white/10">
                    <button type="button" onClick={() => triggerImageUpload('left')} title="Imagen con texto a la derecha" className="toolbar-btn !border-none">
                        <AlignHorizontalDistributeStart size={16} className="text-maestro-gold" />
                    </button>
                    <button type="button" onClick={() => triggerImageUpload('center')} title="Imagen centrada" className="toolbar-btn !border-none">
                        <ImageIcon size={16} className="text-maestro-gold" />
                    </button>
                    <button type="button" onClick={() => triggerImageUpload('right')} title="Imagen con texto a la izquierda" className="toolbar-btn !border-none">
                        <AlignHorizontalDistributeEnd size={16} className="text-maestro-gold" />
                    </button>
                </div>

                <div className="toolbar-divider" />

                <select
                    onChange={(e) => changeFontFamily(e.target.value)}
                    className="toolbar-select"
                    title="Tipo de letra"
                    value={activeFont}
                    onFocus={updateActiveStyles}
                >
                    {FONT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <div className="toolbar-divider" />

                <button type="button" onClick={() => execCommand('justifyLeft')} title="Alinear izquierda" className="toolbar-btn"><AlignLeft size={16} /></button>
                <button type="button" onClick={() => execCommand('justifyCenter')} title="Centrar" className="toolbar-btn"><AlignCenter size={16} /></button>
                <button type="button" onClick={() => execCommand('justifyRight')} title="Alinear derecha" className="toolbar-btn"><AlignRight size={16} /></button>
                <button type="button" onClick={() => execCommand('justifyFull')} title="Justificar" className="toolbar-btn"><AlignJustify size={16} /></button>

                <div className="toolbar-divider" />

                <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Lista con viñetas" className="toolbar-btn"><List size={16} /></button>
                <button type="button" onClick={() => execCommand('insertOrderedList')} title="Lista numerada" className="toolbar-btn"><ListOrdered size={16} /></button>

                <div className="toolbar-divider" />

                <button type="button" onClick={insertLink} title="Insertar enlace" className="toolbar-btn"><Link size={16} /></button>
                <button type="button" onClick={() => execCommand('removeFormat')} title="Limpiar formato" className="toolbar-btn"><Eraser size={16} /></button>
            </div>

            <div
                ref={editorRef}
                contentEditable
                onInput={() => handleInput()}
                onMouseDown={handleMouseDown}
                onKeyUp={handleKeyUp}
                onBlur={updateActiveStyles}
                className="editor-content blog-content"
                style={{ minHeight, fontFamily: baseFont }}
                data-placeholder={placeholder}
            />
        </div>
    );
};
