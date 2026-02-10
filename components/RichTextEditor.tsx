import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Link, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Eraser } from 'lucide-react';
import '../src/styles/rich-text-editor.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Escribe aquí...',
    minHeight = '200px'
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isUpdatingRef = useRef(false);

    useEffect(() => {
        if (editorRef.current && !isUpdatingRef.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            isUpdatingRef.current = true;
            onChange(editorRef.current.innerHTML);
            setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const insertLink = () => {
        const url = prompt('Ingresa la URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const formatHeading = (level: number) => {
        execCommand('formatBlock', `h${level}`);
    };

    const changeFontFamily = (font: string) => {
        execCommand('fontName', font);
    };

    return (
        <div className="rich-text-editor">
            {/* Toolbar */}
            <div className="toolbar">
                <button type="button" onClick={() => execCommand('bold')} title="Negrita" className="toolbar-btn">
                    <Bold size={16} />
                </button>
                <button type="button" onClick={() => execCommand('italic')} title="Cursiva" className="toolbar-btn">
                    <Italic size={16} />
                </button>
                <button type="button" onClick={() => execCommand('underline')} title="Subrayado" className="toolbar-btn">
                    <span className="underline">U</span>
                </button>

                <div className="toolbar-divider" />

                <button type="button" onClick={() => formatHeading(1)} title="Encabezado 1" className="toolbar-btn">
                    <Heading1 size={16} />
                </button>
                <button type="button" onClick={() => formatHeading(2)} title="Encabezado 2" className="toolbar-btn">
                    <Heading2 size={16} />
                </button>
                <button type="button" onClick={() => formatHeading(3)} title="Encabezado 3" className="toolbar-btn">
                    <Heading3 size={16} />
                </button>

                <div className="toolbar-divider" />

                {/* Font Family Selector */}
                <select
                    onChange={(e) => changeFontFamily(e.target.value)}
                    className="toolbar-select"
                    title="Tipo de letra"
                    defaultValue=""
                >
                    <option value="" disabled>Fuente</option>
                    <option value="Georgia, serif">Georgia (Serif)</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                </select>

                <div className="toolbar-divider" />

                <button type="button" onClick={() => execCommand('justifyLeft')} title="Alinear izquierda" className="toolbar-btn">
                    <AlignLeft size={16} />
                </button>
                <button type="button" onClick={() => execCommand('justifyCenter')} title="Centrar" className="toolbar-btn">
                    <AlignCenter size={16} />
                </button>
                <button type="button" onClick={() => execCommand('justifyRight')} title="Alinear derecha" className="toolbar-btn">
                    <AlignRight size={16} />
                </button>

                <div className="toolbar-divider" />

                <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Lista con viñetas" className="toolbar-btn">
                    <List size={16} />
                </button>
                <button type="button" onClick={() => execCommand('insertOrderedList')} title="Lista numerada" className="toolbar-btn">
                    <ListOrdered size={16} />
                </button>

                <div className="toolbar-divider" />

                <button type="button" onClick={insertLink} title="Insertar enlace" className="toolbar-btn">
                    <Link size={16} />
                </button>

                <button type="button" onClick={() => execCommand('removeFormat')} title="Limpiar formato" className="toolbar-btn">
                    <Eraser size={16} />
                </button>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="editor-content"
                style={{ minHeight }}
                data-placeholder={placeholder}
            />
        </div>
    );
};
