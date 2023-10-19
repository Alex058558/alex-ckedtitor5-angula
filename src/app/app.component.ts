import { Component, OnInit } from '@angular/core';
import * as Editor from 'ckeditor5-custom-build/build/ckeditor';
import Adapter from 'ckeditor5-custom-build/src/adapter/ckeditoradapter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-ckeditor';
  public htmlData:string = "<p>Hello, world!</p>"
  public Editor: any = Editor;
  markdownText = '';

  private items = [
    {id: '@Alex', userId: '1', name: '博樂 | Alex' },
    {id: '@David', userId: '2', name: '博樂 | David' },
    {id: '@Clare', userId: '3', name: '博樂 | Clare' },
    {id: '@Tomas', userId: '4', name: '博樂 | Tomas' },
  ]

  public config = {
    toolbar: [ 'heading', '|',
      'bold', 'italic', 'strikethrough','underline','subscript','superscript','|',
      'link','|',
      'outdent','indent','|',
      'bulletedList','numberedList','|',
      'code','codeBlock','|',
      'insertTable','|',
      'imageUpload','blockQuote','|',
      'undo','redo','|',
      'youtube',
      'mediaEmbed'
    ],
    // mention: {
    //   feeds: [
    //       {
    //           marker: '@',
    //           feed: this.items,
    //           minimumCharacters: 0,
    //       }
    //   ]
    // },
  }

  ngOnInit(): void {
    
  }


  onReady(editor: any){
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader: any ) => {
      return new Adapter(loader, editor.config);
    };
    this.markdownText = editor.getData();

    // Add backspace listener here
    // editor.editing.view.document.on('keydown', (evt: any, data: any) => {
    //   if (data.keyCode === 8) {  // 8 is the keycode for backspace
    //       const selection = editor.model.document.selection;
    //       console.log('selection',selection)
    //       if (selection.isCollapsed) {
    //           const position = selection.getFirstPosition();
    //           const mentionNode = position.nodeBefore;
    //           // console.log('mentionNode:',mentionNode);
    //           if (mentionNode && mentionNode.hasAttribute('mention')) {
    //               console.log('mentionNode',mentionNode)
    //               editor.model.change((writer:any) => {
    //                   writer.remove(mentionNode);
    //               });
    //               data.preventDefault();
    //               evt.stop();
    //           }
    //       }
    //   }
    // });
  }


  onChange(event: any) {
    const editorInstance = event.editor;
    const markdownData = editorInstance.getData();
    this.markdownText = markdownData;

    // mentions custom control
    const range = editorInstance.model.createRangeIn(editorInstance.model.document.getRoot());

    const mentions = [];

    //iterate through the whole tree in that range (TreeWalker) 效能問題??
    for (const treeWalker of range.getWalker({ignoreElementEnd: true})) {

      if (treeWalker.type === 'text') {
        //the item property represents TextProxy which is not instance of node
        const node = treeWalker.item.textNode;

        if (node.hasAttribute('mention')) {
          const mention = node.getAttribute('mention');
          if (mention) {
            mentions.push(mention)
          }
        }
        console.log('mentions',mentions);
      }
    }
  }
}
