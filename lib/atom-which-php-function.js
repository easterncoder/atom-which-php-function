'use babel';

export default {

  statusBar : '',
  statusBarEditor : null,

  /**
   * Plugin activation handler
   */
  activate() {
    // create our status bar element
    this.statusBar = document.createElement('atom-which-php-function');
    this.statusBar.classList.add('inline-block');
    this.statusBar.addEventListener('click', this.statusBarClicked);

    // monitor pane changes
    atom.workspace.onDidChangeActivePaneItem(() =>{
      this.resetStatus();
      if(editor = atom.workspace.getActiveTextEditor()) {
        this.updateCurrentFunction(editor, editor.getCursorBufferPosition().row);
      }
    });
    
    // monitor cursor changes
    atom.workspace.observeTextEditors(editor => {
      editor.onDidChangeCursorPosition(e => {
        this.updateCurrentFunction(editor, e.newBufferPosition.row);
      })
    });
  },
  
  /**
   * Updates the status bar with the current class::function
   * @param  object  editor     Atom TextEditor
   * @param  integer currentRow
   */
  updateCurrentFunction(editor, currentRow) {
    var filename = editor.getTitle().split('.');
    if (filename.length < 2 || filename.pop() != 'php') {
      return;
    }
    var exclusionList = ['for', 'while', 'if', 'else', 'switch', 'else', '}'];
    var i;
    var done = false;
    var currentFunctionLine = null;
    var currentFunction = '';
    var currentClass = '';
    
    var symbol = [];
    for (i = currentRow; i >= 0; --i) {
      if (symbol = editor.lineTextForBufferRow(i).match(/function([\s]+[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*|)[\s]*\(/)) {
        currentFunction = symbol[1];
        currentFunctionLine = i;
        break;
      }
    }
    
    var symbol = [];
    i++;
    if (i < 1) {
      i = currentRow;
    }
    for (i = i; i >= 0; --i) {
      if (symbol = editor.lineTextForBufferRow(i).match(/class[\s]+([a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*)/)) {
        currentClass = symbol[1];
        break;
      }
    }

    this.resetStatus();
    
    var output = [currentClass.trim(), currentFunction.trim()].join(' ').trim().replace(' ', '::');
    if(output) {
      this.statusBar.style.display = '';
      this.statusBar.setAttribute('data-line', currentFunctionLine);
      this.statusBar.textContent = output;
      this.statusBarEditor = editor;
    }
  },
  
  /**
   * Reset the status bar status and the statusBarEditor
   */
  resetStatus() {
    this.statusBar.style.display = 'none';
    this.statusBar.textContent = '';
    this.statusBarEditor = null;
  },

  /**
   * Adds our title to the status bar
   * @param  object statusBar Atom status-bar API
   */
  consumeStatusBar(statusBar) {
    statusBar.addLeftTile({
      priority: 1,
      item: this.statusBar
    });
  },
  
  /**
   * Status Bar Click Handler
   * Scrolls to the line where the function is defined
   * @param  object e Event
   */
  statusBarClicked(e) {
    var row = parseInt(this.statusBar.getAttribute('data-line'));
    if(!row) return;
    if(this.statusBarEditor) {
      var position = [row, 0];
      this.statusBarEditor.setCursorBufferPosition(position);
      this.statusBarEditor.unfoldBufferRow(row);
      this.statusBarEditor.scrollToBufferPosition(position);
    }
  }

};