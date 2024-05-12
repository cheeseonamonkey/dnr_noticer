class MyStorage { constructor() { this.storage = chrome.storage.sync } async set(r, t) { return new Promise((e, s) => { this.storage.set({ [r]: t }, () => { chrome.runtime.lastError ? s(chrome.runtime.lastError) : e() }) }) } async get(r) { return new Promise((t, e) => { this.storage.get([r], s => { chrome.runtime.lastError ? e(chrome.runtime.lastError) : t(s[r]) }) }) } async remove(r) { return new Promise((t, e) => { this.storage.remove([r], () => { chrome.runtime.lastError ? e(chrome.runtime.lastError) : t() }) }) } async clear() { return new Promise((r, t) => { this.storage.clear(() => { chrome.runtime.lastError ? t(chrome.runtime.lastError) : r() }) }) } async getAll() { return new Promise((r, t) => { this.storage.get(null, e => { chrome.runtime.lastError ? t(chrome.runtime.lastError) : (console.log(e), r(e)) }) }) } }


class GuestEntry { constructor(name, dateAdded, comment) { this.name = name; this.dateAdded = dateAdded; this.comment = comment; } toXml() { return `<GuestEntry><name>${this.name}</name><dateAdded>${this.dateAdded}</dateAdded><comment>${this.comment}</comment></GuestEntry>`; } static fromXml(xml) { const parser = new DOMParser(); const xmlDoc = parser.parseFromString(xml, "text/xml"); const name = xmlDoc.querySelector("name").textContent; const dateAdded = xmlDoc.querySelector("dateAdded").textContent; const comment = xmlDoc.querySelector("comment").textContent; return new GuestEntry(name, dateAdded, comment); } }




class GuestList {
   constructor() { this.entries = []; }
   addEntry(entry) { this.entries.push(entry); }
   removeEntry(entry) {
      const index = this.entries.findIndex(it => it.name === entry.name && it.dateAdded === entry.dateAdded);
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
         var entries = guestListElement.querySelectorAll("GuestEntry")
         for (const entryElement of entries) {
            const entry = GuestEntry.fromXml(entryElement.outerHTML);
            guestList.addEntry(entry);
         }
      }
      return guestList;
   }
}



function renderGuestList(guestList) {
   const table = document.getElementById('tableList');
   table.innerHTML = ''; // Clear the table

   // Create table header
   const tableHeader = document.createElement('tr');
   ['Name', 'Date Added', 'Comment'].forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      tableHeader.appendChild(th);
   });
   table.appendChild(tableHeader);

   // Create table rows for each guest entry
   if (guestList.entries.length > 0)
      guestList.entries.forEach(entry => {
         const tableRow = document.createElement('tr');
         [entry.name, entry.dateAdded, entry.comment].forEach(cellText => {
            const td = document.createElement('td');
            td.textContent = cellText;
            tableRow.appendChild(td);



         });

         let deleteTd = document.createElement('td');
         deleteTd.textContent = 'x'
         deleteTd.style.width = '2em'
         deleteTd.style.cursor = "pointer"
         deleteTd.addEventListener('click', async evn => {
            const myStorage = new MyStorage()
            const guestList = GuestList.fromXml(await myStorage.get('guestList'))
            guestList.removeEntry(entry)
            renderGuestList(guestList)
            await myStorage.set('guestList', guestList.toXml())

         });
         tableRow.appendChild(deleteTd)


         table.appendChild(tableRow);
      });
}

// Function to add a new guest entry
async function addGuestEntry(guestList, name, dateAdded, comment) {
   const entry = new GuestEntry(name, dateAdded, comment);
   guestList.addEntry(entry);
   const myStorage = new MyStorage()
   renderGuestList(guestList); // Re-render the table
   await myStorage.set('guestList', guestList.toXml())
}




document.getElementById('addEntryForm').addEventListener('submit', async (event) => {

   event.preventDefault();
   const myStorage = new MyStorage();
   const guestList = GuestList.fromXml(await myStorage.get('guestList'))
   const name = document.getElementById('nameInput').value;
   const dateAdded = new Date().toDateString()
   const comment = document.getElementById('commentInput').value;

   addGuestEntry(guestList, name, dateAdded, comment);

   // Clear the form inputs
   document.getElementById('nameInput').value = '';
   document.getElementById('commentInput').value = '';
});



document.querySelector('#settingsForm').addEventListener('submit', async event => {

   event.preventDefault();

   const myStorage = new MyStorage();

   await myStorage.set('urlMatch', document.querySelector("#urlMatch").value ?? '.');
   console.log('saved: ', await myStorage.get('settings'))

   document.querySelector('#urlMatch').outerHTML += "\n<br/>Saved.<br/>\n"


})


document.addEventListener('DOMContentLoaded', async () => {

   const myStorage = new MyStorage()

   const guestListXml = await myStorage.get('guestList')
   if (guestListXml)
      var guestList = GuestList.fromXml(guestListXml)
   else {
      var guestList = new GuestList();
      await myStorage.set('guestList', guestList.toXml())
      console.log('created new guestlist')
   }


   console.log(guestList)

   renderGuestList(guestList)

   document.body.style = ''


   let urlMatchValue = await myStorage.get('urlMatch') ?? '.';


   document.querySelector('#urlMatch').value = urlMatchValue




});