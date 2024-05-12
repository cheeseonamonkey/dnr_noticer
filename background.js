


async function onPageLoaded() {




   class GuestEntry {
      constructor(name, dateAdded, comment) {
         this.name = name;
         this.dateAdded = dateAdded;
         this.comment = comment;
      }
      toXml() {
         return `<GuestEntry><name>${this.name}</name><dateAdded>${this.dateAdded}</dateAdded><comment>${this.comment}</comment></GuestEntry>`;
      }
      static fromXml(xml) {
         const parser = new DOMParser();
         const xmlDoc = parser.parseFromString(xml, "text/xml");
         const name = xmlDoc.querySelector("name").textContent;
         const dateAdded = xmlDoc.querySelector("dateAdded").textContent;
         const comment = xmlDoc.querySelector("comment").textContent;
         return new GuestEntry(name, dateAdded, comment);
      }
   }



   class MyStorage {
      constructor() { this.storage = chrome.storage.sync; }
      async set(r, t) { return new Promise((e, s) => { this.storage.set({ [r]: t }, () => { chrome.runtime.lastError ? s(chrome.runtime.lastError) : e(); }); }); }
      async get(r) { return new Promise((t, e) => { this.storage.get([r], s => { chrome.runtime.lastError ? e(chrome.runtime.lastError) : t(s[r]); }); }); }
      async remove(r) { return new Promise((t, e) => { this.storage.remove([r], () => { chrome.runtime.lastError ? e(chrome.runtime.lastError) : t(); }); }); }
      async clear() { return new Promise((r, t) => { this.storage.clear(() => { chrome.runtime.lastError ? t(chrome.runtime.lastError) : r(); }); }); }
      async getAll() { return new Promise((r, t) => { this.storage.get(null, e => { chrome.runtime.lastError ? t(chrome.runtime.lastError) : r(e); }); }); }
   }


   class GuestList {
      constructor() { this.entries = []; }
      addEntry(entry) { this.entries.push(entry); }
      removeEntry(entry) {
         const index = this.entries.indexOf(entry);
         if (index !== -1) { this.entries.splice(index, 1); }
      }
      toXml() {
         let xml = "<GuestList>";
         for (const entry of this.entries) { xml += entry.toXml(); }
         xml += "</GuestList>";
         return xml;
      }
      static fromXml(xml) {
         const parser = new DOMParser();
         const xmlDoc = parser.parseFromString(xml, "text/xml");
         const guestListElement = xmlDoc.querySelector("GuestList");

         const guestList = new GuestList();
         if (guestListElement) {
            var entries = guestListElement.querySelectorAll("GuestEntry");

            for (const entryElement of entries) {
               const entry = GuestEntry.fromXml(entryElement.outerHTML);
               guestList.addEntry(entry);
            }
         }
         return guestList;
      }
   }



   try {


      console.log('DNR storage init.');

      const myStorage = new MyStorage();




      function fuzzySearch(query, root = document.body, settings) {
         let queryWords = query.toLowerCase().split(' ');
         const results = [];

         function dfs(node) {



            // Check if the node is a text node
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '' && node.textContent.toString().length < 80) {
               let nodeTextWords = node.textContent.toLowerCase().replace(/[,.'"-]/g, "").split(' ');



               let matchedWord = null;

               queryWords.forEach(word => {
                  // Use a regular expression to match the word as a whole word
                  let regex = new RegExp('\\b' + word + '\\b', 'i');
                  if (regex.test(node.textContent)) {
                     console.log('Match found: ', word);
                     matchedWord = word;
                     results.push(node);
                  }
               });


            } else if (node.nodeType === Node.ELEMENT_NODE) {
               // If the node is an element, recursively search each child node
               for (let i = 0; i < node.childNodes.length; i++) {
                  dfs(node.childNodes[i]);
               }
            }
         }

         // Start the search
         dfs(root);

         return results;
      }

      const guestListXml = await myStorage.get('guestList')
      if (guestListXml) {
         var guestList = GuestList.fromXml(guestListXml)
         console.log('found guest list object: ', guestList)
      }
      else {
         var guestList = new GuestList()
         myStorage.set('guestList', guestList.toXml())
         console.log('saved new guest list object (read back): ', GuestList.fromXml(await myStorage.get('guestList')))
      }


      guestList.entries.forEach(gustEntry => {

         let fuzzyResults = fuzzySearch(gustEntry.name, document.body)

         fuzzyResults.forEach(r => {
            // Highlight the node
            r.parentNode.style.zIndex = "999";
            r.parentNode.style.backgroundColor = "red";
         })



      })





   } catch (error) {
      console.error(error);
   }


}


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {



   class MyStorage {
      constructor() { this.storage = chrome.storage.sync; }
      async set(r, t) { return new Promise((e, s) => { this.storage.set({ [r]: t }, () => { chrome.runtime.lastError ? s(chrome.runtime.lastError) : e(); }); }); }
      async get(r) { return new Promise((t, e) => { this.storage.get([r], s => { chrome.runtime.lastError ? e(chrome.runtime.lastError) : t(s[r]); }); }); }
      async remove(r) { return new Promise((t, e) => { this.storage.remove([r], () => { chrome.runtime.lastError ? e(chrome.runtime.lastError) : t(); }); }); }
      async clear() { return new Promise((r, t) => { this.storage.clear(() => { chrome.runtime.lastError ? t(chrome.runtime.lastError) : r(); }); }); }
      async getAll() { return new Promise((r, t) => { this.storage.get(null, e => { chrome.runtime.lastError ? t(chrome.runtime.lastError) : r(e); }); }); }
   }



   try {

      if (!tab || !tab.url)
         return
      if (tab.url.includes('chrome://'))
         return;

      let urlMatch = await new MyStorage().get('urlMatch') ?? '.'


      if (!tab.url.includes(urlMatch))
         console.log('filtered by url.')
      else
         if (changeInfo.status === 'complete' && tab.active && !location.href.includes('chrome://')) {
            chrome.scripting.executeScript({
               target: { tabId: tabId },
               function: onPageLoaded
            });
         }



   }
   catch (err) {
      console.error(err);
   }

});


