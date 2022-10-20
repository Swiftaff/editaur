# Editaur

A simple javascript text editor, without using textarea or any dependencies - embedded in a tauri window to eventually allow file editing

## Things editaur does:

-   [x] clicking or arrowing to a row highlights it
-   [x] clicking somewhere puts the cursor between two characters
-   [x] clicking left of a row puts cursor before first character
-   [x] cursor blink animation restarts after each action
-   [x] clicking right of last character on a row, puts cursor after last character
-   [x] click and drag to the right and release on a single line, selects some characters
-   [x] click and drag to the left and release on a single line, selects some characters
-   [x] click and drag to the right and down and release on multiple lines, selects to the end of first line, all of intermediate lines, and to the end selection of last line
-   [x] click and drag to the left and up and release on multiple lines, selects from the end selection to the end of first line, all of intermediate lines, and to the start selection of last line
-   [x] holding shift after a selection allows the end point of the selection to be changed forwards or backwards, releasing finishes the selection
-   [x] clicking and dragging a selection to the top, right or bottom of the scrolling window, will scroll it - albeit too fast
-   [x] double-clicking a word (between two non-space characters) will select that word
-   [x] triple-clicking anywhere on a line will select the whole line
-   [x] use arrow keys to move up, down, left, right
-   [x] left arrow at start of a row, moves cursor to end of previous row
-   [x] right arrow at end of a row, moves cursor to start of next row
-   [x] using up and down arrow keys will remember the current column starting point across lines of differing lengths
-   [x] using left and right arrow or other cursor moving functions (e.g. paste) will reset this column starting point for future up down moves
-   [x] copy selected text, including mulitline to the clipboard
-   [x] paste clipboard, including multiline, starting at the current cursor (not yet replacing selection)
-   [x] tabbing while a multiline select is active, will insert [4] spaces at the start of all selected rows - and shift the selection to match original

## Things editaur needs to do to get to "table-stakes" for a basic text editor:

-   [ ] shift-tabbing while a single or multiline select is active, will outdent the line by removing up to 4 spaces from the start of the line(s)
-   [ ] Undo once
-   [ ] Multiple Undo
-   [ ] double & triple clicking while holding shift will extend selection
-   [ ] using tab or paste into a selection will replace it
-   [ ] cut text
-   [ ] navigate folders and files
-   [ ] open or save text files
-   [ ] tabs for multiple files
-   [ ] line numbers

## Things editaur would like to do when it grows up:

-   [ ] save favourite project locations
-   [ ] code colouring
-   [ ] Multiple Undo with tree-based history?
