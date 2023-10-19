/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic, Strikethrough } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { FontColor } from '@ckeditor/ckeditor5-font';
import { Heading } from '@ckeditor/ckeditor5-heading';
import {
	AutoImage,
	Image,
	ImageCaption,
	ImageInsert,
	ImageResize,
	ImageToolbar,
	ImageUpload
} from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { AutoLink, Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Markdown } from '@ckeditor/ckeditor5-markdown-gfm';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';

// You can read more about extending the build with additional plugins in the "Installing plugins" guide.
// See https://ckeditor.com/docs/ckeditor5/latest/installation/plugins/installing-plugins.html for details.

class Editor extends ClassicEditor {
	public static override builtinPlugins = [
		MentionCustomization,
		AutoImage,
		AutoLink,
		Autoformat,
		BlockQuote,
		Bold,
		Essentials,
		FontColor,
		Heading,
		Image,
		ImageCaption,
		ImageInsert,
		ImageResize,
		ImageToolbar,
		ImageUpload,
		Indent,
		Italic,
		Strikethrough,
		Link,
		List,
		Markdown,
		MediaEmbed,
		Mention,
		Paragraph,
		Table,
		TableToolbar,
		TextTransformation
	];

	public static override defaultConfig = {
		toolbar: {
			items: [
				'|',
				'blockQuote',
				'bold',
				'link',
				'imageUpload',
				'heading',
				'indent',
				'outdent',
				'italic',
				'strikethrough',
				'numberedList',
				'bulletedList',
				'mediaEmbed',
				'insertTable',
				'fontColor',
				'imageInsert',
				'undo',
				'redo'
			]
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [
						{id: '@Alex', userId: '1', name: ' Alex | 博樂' },
						{id: '@David', userId: '2', name: ' David | 博樂' },
						{id: '@Clare', userId: '3', name: ' Clare | 博樂' },
						{id: '@Tomas', userId: '4', name: ' Tomas | 博樂' },
					  ],
					minimumCharacters: 0,
					itemRenderer: customItemRenderer
				}
			]
		},
		language: 'en',
		image: {
			toolbar: [
				'imageTextAlternative',
				'toggleImageCaption'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	};
} 

function MentionCustomization(editor: any) {

	editor.conversion.for('upcast').elementToAttribute({
		view: {
			name: 'a',
			key: 'data-mention',
			classes: 'mention',
			attributes: {
				'data-user-id': true
			}
		},
		model: {
			key: 'mention',
			value: (viewItem: any) => {
				const mentionAttribute = editor.plugins.get('Mention').toMentionAttribute(viewItem, {
					userId: viewItem.getAttribute('data-user-id')
				});

				return mentionAttribute;
			}
		},
		converterPriority: 'high'
	});

	editor.conversion.for('downcast').attributeToElement({
		model: 'mention',
		view: (modelAttributeValue: { id: any; userId: any; uid: any; }, { writer }: any) => {
			if (!modelAttributeValue) {
				return;
			}

			return writer.createAttributeElement('a', {
				class: 'mention',
				'data-mention': modelAttributeValue.id,
				'data-user-id': modelAttributeValue.userId
			}, {
				priority: 20,
				id: modelAttributeValue.uid
			});
		},
		converterPriority: 'high'
	});

	//mention5
	editor.editing.view.document.on('keydown', (evt: { stop: () => void; }, data: { keyCode: number; preventDefault: () => void; }) => {
		const selection = editor.model.document.selection;
		const position = selection.getFirstPosition();
		const mentionNode = position.nodeBefore;
		const nextNode = position.nodeAfter;
	
		const backspaceKey = data.keyCode === 8; // 8 is backspace
		const deleteKey = data.keyCode === 46 ;  // 46 is delete
		const leftArrowKey = data.keyCode === 37; // 37 is left arrow
		const rightArrowKey = data.keyCode === 39; // 39 is right arrow
	
		if (mentionNode && mentionNode.hasAttribute('mention') && backspaceKey) {
			editor.model.change((writer:any) => {
				writer.remove(mentionNode);
			});
			data.preventDefault();
			evt.stop();
		} else if (nextNode && nextNode.hasAttribute('mention') && deleteKey) {
			editor.model.change((writer:any) => {
				writer.remove(nextNode);
			});
			data.preventDefault();
			evt.stop();
		} else if ((mentionNode && mentionNode.hasAttribute('mention')) || (nextNode && nextNode.hasAttribute('mention'))) {
			if (leftArrowKey || rightArrowKey) {
				editor.model.change((writer:any) => {
					const newPosition = rightArrowKey ? 
						(nextNode ? writer.createPositionAt(nextNode, 'after') : null) : 
						(mentionNode ? writer.createPositionAt(mentionNode, 'before') : null);
					if (newPosition) {
						writer.setSelection(newPosition);
					}
				});
			} 
			// else if (mentionNode && (position.offset !== 0 && position.offset !== mentionNode.text.length)) {
			// 	// 光标不在提及的开始或结束时，阻止其他键的默认操作
			// 	data.preventDefault();
			// 	evt.stop();
			// } else if (nextNode && (position.offset !== 0 && position.offset !== nextNode.text.length)) {
			// 	// 光标不在提及的开始或结束时，阻止其他键的默认操作
			// 	data.preventDefault();
			// 	evt.stop();
			// }
		}
	});
	

	//mention4 
	// editor.editing.view.document.on('keydown', (evt: { stop: () => void; }, data: { keyCode: number; preventDefault: () => void; }) => {
	// 	const selection = editor.model.document.selection;
	// 	const position = selection.getFirstPosition();
	// 	const mentionNode = position.nodeBefore;
	// 	const nextNode = position.nodeAfter;
	
	// 	const backspaceKey = data.keyCode === 8; // 8 is backspace
	// 	const deleteKey = data.keyCode === 46 ;  // 46 is delete
	// 	const leftArrowKey = data.keyCode === 37; // 37 is left arrow
	// 	const rightArrowKey = data.keyCode === 39; // 39 is right arrow
	
	// 	if (mentionNode && mentionNode.hasAttribute('mention') && backspaceKey) {
	// 		editor.model.change((writer:any) => {
	// 			writer.remove(mentionNode);
	// 		});
	// 		data.preventDefault();
	// 		evt.stop();
	// 	} else if (nextNode && nextNode.hasAttribute('mention') && deleteKey) {
	// 		editor.model.change((writer:any) => {
	// 			writer.remove(nextNode);
	// 		});
	// 		data.preventDefault();
	// 		evt.stop();
	// 	} else if ((mentionNode && mentionNode.hasAttribute('mention')) || (nextNode && nextNode.hasAttribute('mention'))) {
	// 		if (leftArrowKey || rightArrowKey) {
	// 			editor.model.change((writer:any) => {
	// 				const newPosition = rightArrowKey ? 
	// 					(nextNode ? writer.createPositionAt(nextNode, 'after') : null) : 
	// 					(mentionNode ? writer.createPositionAt(mentionNode, 'before') : null);
	// 				if (newPosition) {
	// 					writer.setSelection(newPosition);
	// 				}
	// 			});
	// 		} else if (mentionNode && position.offset !== 0 && position.offset !== mentionNode.text.length) {
	// 			// 光标不在提及的开始或结束时，阻止其他键的默认操作
	// 			data.preventDefault();
	// 			evt.stop();
	// 		} else if (nextNode && position.offset !== 0 && position.offset !== nextNode.text.length) {
	// 			// 光标不在提及的开始或结束时，阻止其他键的默认操作
	// 			data.preventDefault();
	// 			evt.stop();
	// 		}
	// 	}
	// });
	

	//mention2
	// editor.editing.view.document.on('keydown', (evt: { stop: () => void; }, data: { keyCode: number; preventDefault: () => void; }) => {
	// 	const selection = editor.model.document.selection;
	// 	const position = selection.getFirstPosition();
	// 	const mentionNode = position.nodeBefore;
	// 	const nextNode = position.nodeAfter;
	
	// 	const backspaceKey = data.keyCode === 8; // 8 is backspace
	// 	const deleteKey = data.keyCode === 46 ;  // 46 is delete
	// 	const leftArrowKey = data.keyCode === 37; // 37 is left arrow
	// 	const rightArrowKey = data.keyCode === 39; // 39 is right arrow
	
	// 	if (mentionNode && mentionNode.hasAttribute('mention') && backspaceKey) {
	// 		editor.model.change((writer:any) => {
	// 			writer.remove(mentionNode);
	// 		});
	// 		data.preventDefault();
	// 		evt.stop();
	// 	} else if (nextNode && nextNode.hasAttribute('mention') && deleteKey) {
	// 		editor.model.change((writer:any) => {
	// 			writer.remove(nextNode);
	// 		});
	// 		data.preventDefault();
	// 		evt.stop();
	// 	} else if ((mentionNode && mentionNode.hasAttribute('mention')) || (nextNode && nextNode.hasAttribute('mention'))) {
	// 		if (leftArrowKey || rightArrowKey) {
	// 			editor.model.change((writer:any) => {
	// 				const newPosition = rightArrowKey ? 
	// 					(nextNode ? writer.createPositionAt(nextNode, 'after') : null) : 
	// 					(mentionNode ? writer.createPositionAt(mentionNode, 'before') : null);
	// 				if (newPosition) {
	// 					writer.setSelection(newPosition);
	// 				}
	// 			});
	// 		} else {
	// 			data.preventDefault();
	// 			evt.stop();
	// 		}
	// 	}
	// });
	
	
	//mention mousedown
	// editor.editing.view.document.on('mousedown', (evt: any, data: any) => {
	// 	const domEventData = data.domEvent;
	// 	const domTarget = domEventData.target;
	// 	const viewDocument = editor.editing.view.document;
	// 	const domConverter = editor.editing.view.domConverter;
	// 	const viewTarget = domConverter.mapDomToView(domTarget);
		
	// 	if (viewTarget && viewTarget.hasAttribute('mention')) {
	// 		domEventData.preventDefault();
	// 		evt.stop();
			
	// 		editor.model.change((writer: any) => {
	// 			const modelTarget = domConverter.viewToModelPosition(viewDocument.createPositionAt(viewTarget, 0));
	// 			const mentionNode = modelTarget.nodeBefore || modelTarget.nodeAfter;
	// 			if (mentionNode) {
	// 				const newPosition = writer.createPositionAt(mentionNode, 'before');  // or 'after' to move cursor to the end
	// 				writer.setSelection(newPosition);
	// 			}
	// 		});
	// 	}
	// });
	

	
	// editor.editing.view.document.on('mousedown', (evt: any, data: any) => {
	// 	const range = editor.model.createRangeIn(editor.model.document.getRoot());

	// 	//iterate through the whole tree in that range (TreeWalker)
	// 	for (const treeWalker of range.getWalker({ignoreElementEnd: true})) {
	
	// 	  if (treeWalker.type === 'text') {
	// 		//the item property represents TextProxy which is not instance of node
	// 		const node = treeWalker.item.textNode;		
	// 		if (node.hasAttribute('mention')) {
	// 			//請在這幫我添加 當滑鼠點擊的是 mention 的一部分 則避免他的光標選取
	// 		}
	// 	  }
	// 	}
	// });
	
	
}

function customItemRenderer( item: any) {
    const itemElement = document.createElement( 'span' );

    itemElement.classList.add( 'custom-item' );
    itemElement.id = `mention-list-item-id-${ item.userId }`;
    itemElement.textContent = `${ item.name } `;

    // const usernameElement = document.createElement( 'span' );

    // usernameElement.classList.add( 'custom-item-username' );
    // usernameElement.textContent = item.id;

    // itemElement.appendChild( usernameElement );

    return itemElement;
}

export default Editor;
