//  ========================================================================
/*
NAME:   TP.sherpa.quickbar.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
*/
//  ========================================================================

/**
 * @type {TP.sherpa.quickbar}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:quickbar');

TP.sherpa.quickbar.shouldRegisterInstances(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Type.defineMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('cmdNode'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return TP.DESCEND;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  should IO be concealed? this is used to simulate "password" mode
TP.sherpa.quickbar.Inst.defineAttribute('conceal', false);

//  Is the command line currently concealed from view?
TP.sherpa.quickbar.Inst.defineAttribute('concealedInput');

//  Is the command line current in search mode?
TP.sherpa.quickbar.Inst.defineAttribute('searchMode');

//  An Array of searchers
TP.sherpa.quickbar.Inst.defineAttribute('searchers');

TP.sherpa.quickbar.Inst.defineAttribute(
        'textInput',
        {'value': TP.cpc('xctrls|codeeditor', true)});

TP.sherpa.quickbar.Inst.defineAttribute(
        'resultsList',
        {'value': TP.cpc('.results_list', true)});

TP.sherpa.quickbar.Inst.defineAttribute(
        'resultDetail',
        {'value': TP.cpc('.result_detail', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    var textInput,
        textInputStartupComplete;

    //  Create a set of searchers
    this.set('searchers',
                TP.ac(
                    TP.core.CustomTypeSearcher.construct(),
                    TP.core.MethodSearcher.construct(),
                    TP.core.CSSPropertySearcher.construct()
                    ));

    textInput = this.get('textInput');

    //  Make sure to observe a setup on the text input here, because it won't be
    //  fully formed when this line is executed.
    textInputStartupComplete = function(aSignal) {
        textInputStartupComplete.ignore(
                aSignal.getOrigin(), aSignal.getSignalName());

        this.set('searchMode', false);
   
        textInput.setEditorEventHandler('viewportChange',
                function () {
                    this.adjustTextInputSize();
                }.bind(this));

        TP.byOID('Sherpa').setupConsoleService();

    }.bind(this);

    textInputStartupComplete.observe(textInput, 'TP.sig.DOMReady');

    this.observe(this.get('resultsList'), 'TP.sig.DOMClick');

    (function () {

        this.set('searchMode', false);
        this.toggle('hidden');

        }).bind(this).observe(
            TP.core.Keyboard, 'TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up');

    (function () {

        var inSearchMode,
            isHidden;

        inSearchMode = this.get('searchMode');
        isHidden = this.get('hidden');

        //  Not hiding & but not in search mode
        if (!isHidden && !inSearchMode) {
            this.set('searchMode', true);
            return this;
        }

        //  Not hiding & already in search mode
        if (!isHidden && inSearchMode) {
            this.set('searchMode', false);
            return this;
        }

        this.set('searchMode', true);
        this.toggle('hidden');

        }).bind(this).observe(
            TP.core.Keyboard,
            'TP.sig.DOM_QuestionMark_Up__TP.sig.DOM_QuestionMark_Up');


    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('handleTP_sig_DOMClick',
function(aSignal) {

    var currentResultItem;

    if (TP.isValid(currentResultItem = this.get('currentResultItem'))) {
        currentResultItem.toggle('selected');
    }

    currentResultItem = TP.wrap(aSignal.getTarget());

    if (currentResultItem.getLocalName().toLowerCase() === 'li') {
        this.set('currentResultItem', currentResultItem);
    }
    
    this.updateResultDetail();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('drawSearchResults',
function(inputText) {

    /**
     * @name drawSearchResults
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var resultsList,
        result;

    this.set('currentResultItem', null);

    if (TP.isEmpty(inputText)) {
        this.removeAttribute('showresults');
        this.updateResultDetail();

        return this;
    }

    resultsList = this.get('resultsList');

    result = '';

    this.get('searchers').perform(
            function(aSearcher) {
                var searchResults;

                searchResults = aSearcher.search(inputText);

                result += '<section>';
                result += '<h1>' + aSearcher.getTitle() + '</h1>';

                result += '</section>';

                searchResults = searchResults.slice(0, 15);

                if (TP.isEmpty(searchResults)) {
                    return;
                }

                result += '<ul>' +
                            searchResults.as('html:li', TP.hc('repeat', true)) +
                            '</ul>';
            });

    if (TP.isEmpty(result)) {
        this.removeAttribute('showresults');
        return this;
    } else {
        this.setAttribute('showresults', true);
    }

    TP.xmlElementSetContent(resultsList.getNativeNode(),
                            TP.frag(result),
                            null,
                            true);

    this.updateResultDetail();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setSearchMode',
function(aMode) {

    /**
     * @name setSearchMode
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    if (TP.isTrue(aMode)) {
        //  Turn off line numbers
        this.get('textInput').setShowLineNumbers(false);
        //  Set theme to search theme
        this.get('textInput').setEditorTheme('tibet_search');
    } else {
        //  Set theme to code theme
        this.get('textInput').setEditorTheme('tibet_code');
        //  Turn on line numbers
        this.get('textInput').setShowLineNumbers(true);

        //  Hide the search results panel
        this.removeAttribute('showresults');

        this.get('resultDetail').empty();
    }

    this.clearInput();

    this.$set('searchMode', aMode);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('selectSearchResult',
function(aCell) {

    /**
     * @name selectSearchResult
     * @abstract
     * @param
     * @returns {TP.sherpa.hud} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setHidden',
function(beHidden) {

    /**
     * @name setHidden
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var textInput;

    if (this.get('hidden') === beHidden) {
        return this;
    }

    if (TP.isTrue(beHidden)) {
        //  Clear the value
        this.clearInput();

        //  deactivate the input cell
        this.deactivateInputEditor();
    } else {
        textInput = this.get('textInput');
        textInput.focus();

        //  activate the input cell
        this.activateInputEditor();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  Search mode stuff
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('toggleSearchMode',
function() {

    /**
     * @name toggleSearchMode
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    if (TP.isTrue(this.get('searchMode'))) {
        this.set('searchMode', false);
    } else {
        this.set('searchMode', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('updateResultDetail',
function() {

    /**
     * @name updateResultDetail
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var detailTile,
        currentResultItem;

    if (TP.notValid(detailTile = TP.byOID('detailTile'))) {
        detailTile = TP.byOID('Sherpa').makeTile('detailTile');
    }

    if (this.hasAttribute('showresults')) {
        detailTile.set('hidden', false);

        detailTile.setPagePositionAndSize(
                        this.get('resultDetail').getPageRect());

        detailTile.setProcessedContent('<h2>Hi there</h2>');

    } else {
        detailTile.set('hidden', true);
    }
    /*
    if (TP.isValid(currentResultItem = this.get('currentResultItem'))) {
        detailTile.setProcessedContent('<h2>Stuff</h2>');
    } else {
        detailTile.empty();
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('scrollToEnd',
function() {

    /**
     * @name scrollToEnd
     * @synopsis Adjust the height of the input cell based on its contents.
     */

    var body = this.get('textInput').getNativeContentDocument().body;
    body.scrollTop = body.scrollHeight;

    return;
});

//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('adjustTextInputSize',
function() {

    /**
     * @name adjustTextInputSize
     * @synopsis Adjust the height of the input cell based on its contents.
     */

    var textInput,
        newHeight;

    textInput = this.get('textInput');

    newHeight = Math.min(textInput.getEditorHeight(), 500);

    TP.elementSetHeight(this.getNativeNode(), newHeight);
    TP.elementSetHeight(textInput.getNativeNode(), newHeight);

    var body = textInput.getNativeContentDocument().body;
    body.scrollTop = body.scrollHeight;

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('activateInputEditor',
function() {

    /**
     * @name activateInputEditor
     * @returns {TP.sherpa.quickbar} The receiver.
     * @abstract
     * @todo
     */

    var textInput;

    textInput = this.get('textInput');

    textInput.setKeyHandler(TP.core.Keyboard.$$handleKeyEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('deactivateInputEditor',
function() {

    /**
     * @name deactivateInputEditor
     * @returns {TP.sherpa.quickbar} The receiver.
     * @abstract
     * @todo
     */

    var textInput;

    textInput = this.get('textInput');

    textInput.unsetCurrentKeyHandler();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('eventIsInInput',
function(anEvent) {

    /**
     * @name eventInInput
     */

    return TP.eventGetWindow(anEvent).document ===
            this.get('textInput').getNativeContentDocument();
});

//  ------------------------------------------------------------------------
//  Prompt Methods
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setPrompt',
function(aPrompt, aCSSClass) {

    /**
     * @name setPrompt
     * @synopsis Sets the text prompt used for the input cell.
     * @param {String} aPrompt The prompt to define.
     * @param {String} aCSSClass An optional CSS class name to use for display
     *     of the prompt string.
     * @returns {TP.sherpa.cmdline} The receiver.
     * @todo
     */

    //this.appendToEnd(aPrompt);

    //this.get('textInput').selectFromTo(0, 0);
    //this.get('textInput').insertAfterSelection(aPrompt);

    //  TODO: Do something with the class...

    return this;
});

//  ------------------------------------------------------------------------
//  Input Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('clearInput',
function() {

    /**
     * @name clearInput
     * @synopsis Clears the input cell.
     * @returns {TP.sherpa.quickbar} The receiver.
     */

    //TP.info('fix TP.sherpa.quickbar::clearInput', TP.LOG, arguments);

    //  TODO: This is supposed to 'clear the input cell - ha ha'... figure out
    //  how to do this

    //  this.get('textInput').clearValue();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('focusInput',
function(select) {

    /**
     * @name focusInput
     * @synopsis Focuses the input cell so the cursor is visible/blinking.
     * @param {Boolean} select True to select in addition.
     * @returns {TP.sherpa.quickbar} The receiver.
     */

    //  We wrap this in a try...catch that does nothing because, on startup,
    //  it seems like the textfield isn't focusable on IE and this will
    //  throw an exception. It's not a big deal, except that this means that
    //  the text field will not focus on startup.
    try {
        if (select) {
            this.get('textInput').select();
        } else {
            this.get('textInput').focus();
        }
    } catch (e) {
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('insertInputContent',
function(anObject) {

    /**
     * @name insertInputContent
     * @synopsis Inserts to the value of the input cell.
     * @param {Object} anObject The object defining the additional input.
     * @returns {TP.sherpa.quickbar} The receiver.
     */

    TP.info('fix TP.sherpa.quickbar::insertInputContent', TP.LOG, arguments);

    return this;

    var str;

    str = TP.str(anObject);
    this.get('textInput').insertAfterSelection(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @name setCursorToEnd
     * @synopsis Moves the cursor to the end of the current input data.
     * @returns {TP.sherpa.quickbar} The receiver.
     */

    TP.info('fix TP.sherpa.quickbar::setCursorToEnd', TP.LOG, arguments);

    return this;

    this.get('textInput').setCursorToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setInputContent',
function(anObject, shouldAppend) {

    /**
     * @name setInputContent
     * @synopsis Sets the value of the input cell, essentially 'pre-filling' the
     *     input area with content.
     * @description If shouldAppend is true, and the input cell already has
     *     content, a '.;\n' is appended to the front of the content.
     * @param {Object} anObject The object defining the input.
     * @param {Boolean} shouldAppend Whether or not to append the value of
     *     anObject to any existing content.
     * @returns {TP.sherpa.quickbar} The receiver.
     * @todo
     */

    TP.info('fix TP.sherpa.quickbar::setInputContent', TP.LOG, arguments);

    return this;

    var textInput,
        val;

    if (TP.isEmpty(anObject)) {
        this.clearInput();
        return this;
    }

    textInput = this.get('textInput');
    if (TP.isTrue(shouldAppend)) {
        if (TP.notEmpty(val = textInput.get('value'))) {
            val += '.;\n';
        }

        textInput.set('value', val + TP.str(anObject));
    } else {
        textInput.set('value', TP.str(anObject));
    }

    (function() {
        this.focusInput();
        this.setCursorToEnd();
    }.bind(this)).afterUnwind();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('shouldConcealInput',
function(aFlag) {

    /**
     * @name shouldConcealInput
     * @synopsis Returns false for now.
     * @param {Boolean} aFlag The new value to set.
     * @returns {Boolean} 
     */

    return false;
});

//  ------------------------------------------------------------------------
//  Input marking/eval
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineAttribute('currentInputMarker');
TP.sherpa.quickbar.Inst.defineAttribute('readyForEval');

TP.sherpa.quickbar.Inst.defineAttribute('startCursor');

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setupInputMark',
function() {

    if (TP.notValid(this.get('currentInputMarker'))) {
        this.set('currentInputMarker',
            this.markEvalRange(this.computeEvalSelectionRange()));
    
        this.set('readyForEval', false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('teardownInputMark',
function() {

    if (TP.isValid(this.get('currentInputMarker'))) {
        this.get('currentInputMarker').clear();
        this.set('currentInputMarker', null);
    
        this.set('readyForEval', false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('evalEvalInput',
function() {
    var editor,
        range,

        inputText,

        isError,
        result;

    editor = this.get('textInput').$getEditorInstance();

    range = this.get('currentInputMarker').find();
    inputText = editor.getRange(range.from, range.to);

/*
    var ast = esprima.parse(inputText, {range: true, loc: true});
    var scopes = escope.analyze(ast).scopes;
    var returnRef = scopes[0].references.last().identifier.name;
*/

    isError = false;
    try {
        result = eval(inputText);
    } catch (e) {
        result = 'Error: ' + e.message;
        isError = true;
    }

    this.appendToEnd(' \n');
    this.get('textInput').$getEditorInstance().refresh();

    this.createOutputRangeAt(
        {'from': range.to, 'to': {'line': range.to.line, 'ch': range.to.ch + 1}},
        'foofy',
        result,
        isError);

    this.get('currentInputMarker').clear();
    this.set('currentInputMarker', null);

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('getInputValue',
function() {

    /**
     * @name getInputValue
     * @synopsis Returns the value currently considered the 'input value'
     * @returns {String} The user's input.
     */

    var inputText,
    
        editor,
        range;

    inputText = null;

    if (TP.isValid(this.get('currentInputMarker'))) {
        if (TP.isTrue(this.get('readyForEval'))) {
            editor = this.get('textInput').$getEditorInstance();
            range = this.get('currentInputMarker').find();
            inputText = editor.getRange(range.from, range.to);
        } else {
            this.set('readyForEval', true);
        }
    }

    return inputText;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setInputValue',
function(text, append) {

    var editor,

        startCursor,
        endCursor;

    editor = this.get('textInput').$getEditorInstance();

    if (TP.notValid(startCursor = this.get('startCursor'))) {
        startCursor = editor.getCursor();
        this.set('startCursor', startCursor);
    }

    endCursor = editor.getCursor();
    
    editor.setSelection(startCursor, endCursor);
    editor.replaceSelection(text);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('addOutputValue',
function(uniqueID, text) {

    var doc,
        outElem,

        range;

    doc = this.get('textInput').getNativeContentDocument();

    if (!TP.isElement(outElem = doc.getElementById(uniqueID))) {
        range = this.get('currentInputMarker').find();

        this.appendToEnd(' ');
        this.get('textInput').$getEditorInstance().refresh();

        outElem = this.createOutputRangeAt(
            {
                'from': {'line': range.to.line, 'ch': range.to.ch},
                'to': {'line': range.to.line, 'ch': range.to.ch + 1}
            },
            uniqueID,
            false);
    }

    outElem.innerHTML = text;
    this.get('textInput').$getEditorInstance().refresh();

    this.appendToEnd('\n');
    this.get('textInput').$getEditorInstance().refresh();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('appendTo',
function(line, text) {
    this.get('textInput').$getEditorInstance().replaceRange(
        text, this.get('textInput').$getEditorConstructor().Pos(line, 0));
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('appendToEnd',
function(text) {
    var editor,
        lastLineInfo;

    editor = this.get('textInput').$getEditorInstance();
    lastLineInfo = editor.lineInfo(editor.lastLine());

    editor.replaceRange(
        text,
        this.get('textInput').$getEditorConstructor().Pos(
                                                lastLineInfo.line,
                                                lastLineInfo.text.length));
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('createOutputElement',
function(uniqueID) {

    var doc,
        outSpan,
        textSpan;

    doc = this.get('textInput').getNativeContentDocument();

    outSpan = doc.createElement('span');
    outSpan.className = 'output';
    outSpan.id = uniqueID;

    /*
    outSpan.onclick = function (ev) {
                            if (this.hasAttribute('live')) {
                                this.removeAttribute('live');
                            } else {
                                this.setAttribute('live', 'true');
                            }
                            ev.stopPropagation();
                            ev.preventDefault();
                        };
    */

    return outSpan;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('createOutputRangeAt',
function(range, uniqueID, isError) {

    var elem,
        marker;

    elem = this.createOutputElement(uniqueID);

    marker = this.get('textInput').$getEditorInstance().markText(
        range.from,
        range.to,
        {
            'atomic': true,
            'collapsed': true,
            'replacedWith': elem,
            'inclusiveLeft': false,
            'inclusiveRight': false,
            'clearWhenEmpty': false
        }
    );

    return elem;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('computeEvalSelectionRangeAnchor',
function() {
    var editor,
    
        head,
        searchCursor,
        lineInfo,
        retVal,
        marks;

    editor = this.get('textInput').$getEditorInstance();

    //  Find the last '>' (actually the start of a line followed by zero-or-more
    //  whitespace followed by a '>')
    head = editor.getCursor();
    searchCursor = editor.getSearchCursor(/^(\s*>|\n)/, head);

    if (searchCursor.findPrevious()) {
        //  We want the 'to', since that's the end of the '^\s*>' match
        retVal = searchCursor.to();
    } else {
        //  Couldn't find a starting '>', so we just use the beginning of the
        //  editor
        retVal = {line: 0, ch:0};
    }

    //  See if there are any output marks between the anchor and head
    marks = editor.findMarks(retVal, head);
    if (marks.length > 0) {
        retVal = marks[marks.length - 1].find().to;
    }

    //  If the 'ch' is at the end of the line, increment the line and set the
    //  'ch' to 0
    lineInfo = editor.lineInfo(retVal.line);
    if (retVal.ch === lineInfo.text.length) {
        retVal = {line: Math.min(retVal.line + 1, editor.lastLine()),
                    ch: 0};
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('computeEvalSelectionRangeHead',
function() {
    var editor,
    
        anchor,
        searchCursor,
        lineInfo,
        retVal,
        marks;

    editor = this.get('textInput').$getEditorInstance();

    //  Find the last '>' (actually the start of a line followed by zero-or-more
    //  whitespace followed by a '>')
    anchor = editor.getCursor();
    searchCursor = editor.getSearchCursor(/^(\s*<|\n)/, anchor);

    if (searchCursor.findNext()) {
        //  We want the 'from', since that's the start of the '^\s*<' match
        retVal = searchCursor.from();
    } else {
        //  Couldn't find an ending '<', so we just use the end of the editor
        lineInfo = editor.lineInfo(editor.lastLine());
        retVal = {line: lineInfo.line, ch: lineInfo.text.length};
    }

    //  See if there are any output marks between the anchor and head
    marks = editor.findMarks(anchor, retVal);
    if (marks.length > 0) {
        retVal = marks[0].find().from;
    }

    //  If the 'ch' is at the beginning of the line, decrement the line and set
    //  the 'ch' to end of the line
    if (retVal.ch === 0) {
        lineInfo = editor.lineInfo(retVal.line - 1);
        retVal = {line: Math.max(retVal.line - 1, 0),
                    ch: lineInfo.text.length};
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('computeEvalSelectionRange',
function() {
    var editor,
    
        selection,
        range;

    editor = this.get('textInput').$getEditorInstance();

    //  If there are real selections, then just use the first one
    selection = editor.getSelection();
    if (selection.length > 0) {
        return editor.listSelections()[0];
    }

    range = {'anchor': this.computeEvalSelectionRangeAnchor(),
                'head': this.computeEvalSelectionRangeHead()};

    return range;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('markEvalRange',
function(aRange) {

    return this.get('textInput').$getEditorInstance().markText(
        aRange.anchor,
        aRange.head,
        {
            'className': 'bordered-input',
            'startStyle': 'bordered-input-left',
            'endStyle': 'bordered-input-right',
            'atomic': true,
            'inclusiveLeft': false,
            'inclusiveRight': false,
        }
    );
});

//  ========================================================================
//  end
//  ========================================================================
