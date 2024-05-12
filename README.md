# DNR Noticer
A Chrome extension to manage a local list of guests who are not allowed to rent rooms.


## Installing

### Install from CRX File

To manually install the Chrome extension using the `.crx` file, follow these steps:

1. **Download the CRX File**
   - Download the `.crx` file from the releases page.

2. **Open Extensions Page**
   - In Chrome, click on the menu (three vertical dots in the top-right corner).
   - Go to `More Tools > Extensions`
        _or_
   - Navigate to `chrome://extensions`
   
3. **Enable Developer Mode**
   - Toggle "Developer mode" on (top-right corner of the Extensions page).

4. **Install the Extension**
   - Drag and drop the `.crx` file onto the Extensions page.
   - Confirm the installation when prompted.

5. **Complete Installation**
   - After installation, the extension should appear in your list of extensions.
   - You should see the extension icon when clicking the puzzle icon _(top-right of Chrome)_.
   - In the context menu you can pin the extensionn button to the browser if you want.
   
   <br />




## Usage

After installing the extension, manage the DNR list by clicking the extension icon button.

The current DNR list will be displayed in a table.

Submited entries will be automatically detected. When a match is found, the matching text is highlighted in red to draw attention to unwelcome guests.

Set the URL match to limit the pages the extension runs on; the extension will only scan pages that contain the query in their URL.

To test during development, I submitted the name `Example Domain` to the DNR list, then navigated to [example.com](http://www.example.com).

The "Import File" and "Export File" fields are not yet implemented.


