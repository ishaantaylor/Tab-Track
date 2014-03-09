// bg.js
/* open database when started */
var x = TAFFY();
var raw_data = {};
var nested_data = {};
/**
 * Database entry format:
 * {
 *      "rnum":     "record number",
 *      "tab":      tab object,
 *      "tabid":    session unique tab id
 *      "fromid":   id of opener tab
 *      "url":      url of tab
 *      "title":    tab page title
 *      "marked":   boolean
 *      "children": array of children for d3 specs
 * }
 * 
 */
//  remember to be able to clear database..

/** Insert all raw tab info to database **/
var y = 0;
console.log("started");


/** Handle Tab Creation
  *
  * Inserts into database 
  **/
chrome.tabs.onCreated.addListener( function(tab) {
  // while (tab.status == "loading") {}   // make sure tab is loaded
  var obj = {
    "num":y,
    "tab":tab,
    "tabid":tab.id,
    "fromid":tab.openerTabId,
    "url":tab.url, 
    "title":tab.title,
    "removed":false,
    "marked":false,
    "children": {}
  };
  x.insert(obj);
  // console.log(y + " : " + tab + " : " + tab.id + " : " + tab.openerTabId + " : " + tab.url + " : " + tab.title);
//  console.log(x().stringify());
  y++;
});


/** Handle Tab Updates 
  * 
  * Update tab object in database
  **/
chrome.tabs.onUpdated.addListener( function(tab) {
  var tab_record = x({"tabid":tab.id});       // tab to be updated
  tab_record.update({"tab":tab, "url":tab.url, "title":tab.title});
  // console.log(tab.id, tab.url);
});
 

/** Handle Tab Closing 
  *
  * Marks node in tree as dead
  **/
chrome.tabs.onRemoved.addListener( function( tab /*, {"windowID":tab.windowID, "isWindowClosing":false} */) {
  x({"tabid":tab.id}).update({"removed":true});
});
/**/



/** Handle Commands **/
chrome.commands.onCommand.addListener(function(command) {
  console.log('onCommand event received for message: ', command);
  var raw_data = {};
  if (command == "show-tree") {
    raw_data = $.parseJSON(x().stringify());              
    console.log(raw_data);
    var nested = nestReal(raw_data);
    console.log(nested);
    popup = window.open("../browser_action.html");
  } else if (command == "clear-database") {
    console.log("clearing...");
    x().remove(true);
    raw_data = {};
    nested_data = {};
    console.log("successfully cleared");
  } 
});


function hash(obj) {  

}


/** Create nested d3 data from raw data
  *
  * @param  raw   string
  * @return json  useful data
  **
function nestData() {
  var raw_json_obj = JSON.parse(x().stringify());
  console.log(x().stringify());
  var orphan = [];

  
  var adj_index = [];     // array of "linkedlists" adjacency list for tree
  var ain = [];           // 
  var temp_adj_list = []; //          "linkedlist"  adjacency list per element of adj_index
  var outer = 0;
  var inner = 0;

  /*  how to create trees
      we know that if a tab's fromid doesnt match any tabs id, its a root
        so compile list of parents with children 
        parent without children is leaf..array with only one element is a leaf

        sort these in order of db tab insertion order
        place each a[0] value in its own index in a new array. can there be multiples of these? no
        start from beginning and crawl
          base case: if i reach an element by itself
          ie) [
                [1,2,4]
                [2,3,4,5]
                [3]
                [4,5]
                [5]
              ]
              invalid because each child must have exactly one parent.
              fixed:
              [
                [1,2,4]
                [2,3,5]
                [3]
                [4]
                [5]
              ]
  */



/** 
  * Called when user triggers keyboard command
  * Takes raw json tab array and puts it in hierarchy
  *
  * Algorithm:
  *   // initialize
  *   Iterate t each tab object until I find a tab "t" that has no parent O(n)
  *     Mark that tab complete, insert into JSON data structure
  *     search for tabs that have the same fromid as "t"'s tabid O(n)
  *     add to parent ()
  // at this point, each tree will have been started. so build bottom up, find childrens' parents instead of parents' children
  *   Iterate through each tab, seeing if tabs have parents in the structure and then adding them..very time expensive tho
  *     (keep array of tabs that have been added to the json ds) if in here- then proceed to find and add
  * 

// gets parent Tab object, returns -1 if there is no tab id
function getParent(tab, raw_json_obj) {
  var from = tab.fromid;
  for (var parent in raw_json_obj) {
    if (parent.id == from)
      return parent;
  }
  return -1;
}
*/


/**
  * Called by nest() method. Controls inserting an element as a child to a parent.
  * 2 cases
  *   parent doesn't exist
  *   parent is nested
  *
  * in json   Current JSON tree
  * in parent Tab object
  * in child  Tab object
  *
  * out json
  *
function addToParent(json, parent, child) {

  var parent_tab = new_json.searchForTabWithID(parent.id);  // implement me

  if (parent_tab != 0)                              // google js und
    parent_tab.children.push(child);
  else
    console.log("Tried to add undefined tab to JSON Tree data structure");

}
*/



function Queue(stuff) {
  var items;

  this.items = stuff;
  
  Queue.prototype.pushh = function(item) {
    if (typeof(items) === 'undefined') {
      items = [];  
    }
    items.push(item);
  }; 
  
  Queue.prototype.popp = function() {
    return items.shift();
  };
  
  Queue.prototype.peek = function() {
    if (items.length > 0)
      return items[0];
    else
      return undefined;
  };

  Queue.prototype.print = function() {
    console.log("printing " +  items.length + "items in queue: \n");
    for (var i in items) {
      console.log(i);
    }
  }
}


function nestReal(raw) {
  var count = 0;
  var q = new Queue();
  var json = [];

  console.log("size of raw array: " + raw.length);
  // initialize queue
  for (var tab in raw) {
    if (tab.fromid === undefined) {       //figure out if we use -1 or underfined
      console.log("initial: " + tab.title);             // print initialized tab titles
      q.pushh(tab);
      count++;                            // increment count to know where i'm at
    } 
  }
  
  console.log
  while (count < raw.length && q.peekk() !== undefined) {               // could also do while queue is not empty maybe
    console.log("count: " + count);
    var parent = q.popp();                            // get first tab in queue
    console.log("parent: " + parent);
    if (parent.fromid === undefined)
      json = addToParent(json, parent, undefined);    //implement cases for both nodes without parent and with 
    var children = x({"fromid": {is:parent.id}});     // get children of parent from db
    for (var child in children) {                     // for each child to the original parent
      console.log("child: " + child);
      q.pushh(child);                                   // add children to queue
      count++;                                          // increment count to know where i'm at
      json = addToParent(json, parent, child);          //merge with other file to implement
    }
  }
  console.log(json.toString());
  return json;
}


// takes in current json, parent tab and child tab - edits the tab object (which automatically edits json)
function addToParent(json, parent, child) {
  if (child === undefined) {
    json.push(parent);
  } else {
    var parent_tab = searchForTabWithID(json, parent.id);  // implement me
    var child_tab  = searchForTabWithID(json, child.id);
    if (parent_tab !== undefined)                           
      parent_tab.children.push(child_tab);
  }
  return json;
}


// returns tab object found to function addToParent()
function searchForTabWithID(obj, id) {
  if (id === undefined)             // if tab id doesnt exist, return undefined
    return undefined;

  if (obj.id == id)                // if tab is the object, return it
    return obj;

  for (var i in obj) {             // for each field in obj
    if (obj.children[i].id == id)  // if the id of the field is the correct id (fix bug)
      return obj;
    if (obj[i].children !== null && typeof(obj[i]) == "object")
      searchForTabWithID(obj[i].children, id);
                                    // recurse
  }
}