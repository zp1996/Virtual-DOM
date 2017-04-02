import MergeSort from './MergeSort';
import vdom from '../../lib/index';

const { Element, diff, patch } = vdom;

const data = [
	{ uid: 1, username: 'xiaoming', age: 20, height: 178 },
	{ uid: 2, username: 'xiaohong', age: 48, height: 165 },
	{ uid: 3, username: 'xiaohua', age: 18, height: 170 },
	{ uid: 4, username: 'xiaogang', age: 59, height: 160 },
	{ uid: 5, username: 'kobe', age: 38, height: 196 }
];
const $ = id => document.getElementById(id);

(function () {
	// return the element according to id
	var sorts = document.getElementsByClassName("sort"),
		cacheElement = $("active");
	// the traditional way to render the tbody
	function tradBurnTbody () {
		var tradition = $("tradition-way"), html = "";
		for (var i = 0, item; item = data[i++];) {
			html += "<tr><td>" + item.uid + "</td><td>" +
							item.	username + "</td><td>" + item.age +
							"</td><td>" + item.height + "</td></tr>";
		}
		tradition.innerHTML = html;
	}
	for (var i = 0, len = sorts.length; i < len; i++) {
		(function (i) {
			sorts[i].addEventListener("click", function () {
				// change data sort way
				var key = this.getAttribute("sort-key");
				MergeSort(data, key);
				// render tbody
				tradBurnTbody();
				// handle thead
				if (cacheElement && cacheElement != this) {
					cacheElement.removeAttribute("id");
				}
				this.setAttribute("id", "active");
				cacheElement = this;
			}, false);
		})(i);
	};
	tradBurnTbody();
})();

(function () {
	var modern = $("modern-way"),
		keys = Object.keys(data[0]),
		active = 0,
		ths = formTh(),
		trs = formTd();
	// form the thead
	function formTh () {
		return keys.map((val, i) => {
			if (val === "username")
				return new Element("th", [val]);
			var props = {class: "sort-modern", "sort-key": val};
			i === active ? props["id"] = "active" : 1;
			return new Element("th", props, [val]);
		});
	}
	// form the tbody
	function formTd () {
		return data.map(val => {
			return new Element("tr", {key: val.uid}, [
				new Element("td", [val.uid]),
				new Element("td", [val.username]),
				new Element("td", [val.age]),
				new Element("td", [val.height]),
			]);
		});
	}
	var table = new Element("table", [
			new Element("thead", [ new Element("tr", ths) ]),
			new Element("tbody", trs)
		]),
		tableDom = table.render();
	modern.appendChild(tableDom);
	// bind event
	var bindEvent = function () {
		var sort = document.getElementsByClassName("sort-modern");
		for (var i = 0, len = sort.length; i < len; i++) {
			(function (i) {
				sort[i].addEventListener("click", function () {
					active = i < 1 ? i : i + 1;
					// update thead
					ths = formTh();
					// sort data
					MergeSort(data, this.getAttribute("sort-key"));
					// update tbody
					trs = formTd();
					// form the new tree
					var newTable = new Element("table", [
						new Element("thead", [ new Element("tr", ths) ]),
						new Element("tbody", trs)
					]);
					// get patches
					var patches = diff(table, newTable);
					// revise dom
					patch(tableDom, patches);
					// update the js dom tree
					table = newTable;
				}, false);
			})(i);
		}
	};
	bindEvent();
})();
