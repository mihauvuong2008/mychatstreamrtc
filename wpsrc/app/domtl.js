
export const domtool = {

  creatediv: function (classname, id) {
    const ele = document.createElement("div");
    ele.classList.add(classname);
    if(typeof id === "undefined") return ele;
    ele.id = id;
    return ele;
  },

  createinput: function (type, classname, id) {
    const ele = document.createElement("input");
    ele.type = type
    ele.classList.add(classname);
    if(typeof id === "undefined") return ele;
    ele.id = id;
    return ele;
  },

  createlabel: function (classname, id) {
    const ele = document.createElement("label");
    ele.classList.add(classname);
    if(typeof id === "undefined") return ele;
    ele.id = id;
    return ele;
  },

  createimg: function (classname, id) {
    const ele = document.createElement("img");
    ele.classList.add(classname);
    if(typeof id === "undefined") return ele;
    ele.id = id;
    return ele;
  },

  createa: function (classname, id) {
    const ele = document.createElement("a");
    ele.classList.add(classname);
    if(typeof id === "undefined") return ele;
    ele.id = id;
    return ele;
  },

  createiframe: function (classname, id) {
    const ele = document.createElement("iframe");
    ele.classList.add(classname);
    if(typeof id === "undefined") return ele;
    ele.id = id;
    return ele;
  },

  createvideo: function (classname, id) {
    const ele = document.createElement("video");
    ele.classList.add(classname);
    if(typeof id === "undefined") return ele;
    ele.id = id;
    return ele;
  },
  
}
