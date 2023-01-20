const TLN = {
	eventList: {},
	updateLineNumber: function (ta, el) {
		// Let's check if there are more or less lines than before
		const lineCount = ta.value.split('\n').length;
		const childCount = el.children.length;
		let difference = lineCount - childCount;
		// If there is any positive difference, we need to add more line numbers
		if (difference > 0) {
			// Create a fragment to work with so we only have to update DOM once
			const frag = document.createDocumentFragment();
			// For each new line we need to add,
			while (difference > 0) {
				// Create a <span>, add TLN class name, append to fragment and
				// update difference
				const lineNumber = document.createElement('span');
				lineNumber.className = 'tln-line';
				frag.appendChild(lineNumber);
				difference--;
			}
			// Append fragment (with <span> children) to our wrapper element
			el.appendChild(frag);
		}
		// If, however, there's negative difference, we need to remove line numbers
		while (difference < 0) {
			// Simple stuff, remove last child and update difference
			el.removeChild(el.lastChild);
			difference++;
		}
	},
	appendLineNumbers: function (id) {
		// Get reference to desired <textarea>
		const ta = document.getElementById(id);
		// If getting reference to element fails, warn and leave
		if (ta === null) {
			console.warn(`Couldn't find textarea of id: "${id}"`);
			return;
		}
		// If <textarea> already has TLN active, warn and leave
		if (ta.className.indexOf('tln-active') != -1) {
			console.warn(`textarea of id: "${id}" is already numbered`)
			return;
		}
		// Otherwise, we're safe to add the class name and clear inline styles
		ta.classList.add('tln-active');
		ta.style = {};

		// Create line numbers wrapper, insert it before <textarea>
		const el = document.createElement('div');
		el.className = 'tln-wrapper';
		ta.parentNode.insertBefore(el, ta);
		// Call update to actually insert line numbers to the wrapper
		TLN.updateLineNumber(ta, el);
		// Initialize event listeners list for this element ID, so we can remove
		// them later if needed
		TLN.eventList[id] = [];

		// Constant list of input event names so we can iterate
		const changeEvts = [
			'propertychange', 'input', 'keydown', 'keyup'
		];
		// Default handler for input events
		const changeHdlr = function (ta, el) {
			return function (e) {
				// If pressed key is Left Arrow (when cursor is on the first character),
				// or if it's Enter/Home, then we set horizontal scroll to 0
				// Check for .keyCode, .which, .code and .key, because the web is a mess
				// [Ref] stackoverflow.com/a/4471635/4824627
				if ((+ta.scrollLeft === 10 && (e.keyCode === 37 || e.which === 37
					|| e.code === 'ArrowLeft' || e.key === 'ArrowLeft'))
					|| e.keyCode === 36 || e.which === 36 || e.code === 'Home' || e.key === 'Home'
					|| e.keyCode === 13 || e.which === 13 || e.code === 'Enter' || e.key === 'Enter'
					|| e.code === 'NumpadEnter')
					ta.scrollLeft = 0;
				// Whether we scrolled or not, let's check for any line count updates
				TLN.updateLineNumber(ta, el);
			}
		}(ta, el);

		// Finally, iterate through those event names, and add listeners to
		// <textarea> and to events list
		/// TODO: Performance gurus: is this suboptimal? Should we only add a few
		/// listeners? I feel the update method is optimal enough for this to not
		/// impact too much things.
		for (let i = changeEvts.length - 1; i >= 0; i--) {
			ta.addEventListener(changeEvts[i], changeHdlr);
			TLN.eventList[id].push({
				evt: changeEvts[i],
				hdlr: changeHdlr
			});
		}

		// Constant list of scroll event names so we can iterate
		const scrollEvts = ['change', 'mousewheel', 'scroll'];
		// Default handler for scroll events (pretty self explanatory)
		const scrollHdlr = function (ta, el) {
			return function () { el.scrollTop = ta.scrollTop; }
		}(ta, el);
		// Just like before, iterate and add listeners to <textarea> and to list
		/// TODO: Also just like before: performance?
		for (let i = scrollEvts.length - 1; i >= 0; i--) {
			ta.addEventListener(scrollEvts[i], scrollHdlr);
			TLN.eventList[id].push({
				evt: scrollEvts[i],
				hdlr: scrollHdlr
			});
		}
	},
	removeLineNumbers: function (id) {
		// Get reference to <textarea>
		const ta = document.getElementById(id);
		// If getting reference to element fails, warn and leave
		if (ta === null) {
			console.warn(`Couldn't find textarea of id: ${id}`);
			return;
		}
		// If <textarea> already doesn't have TLN active, warn and leave
		if (ta.className.indexOf('tln-active') === -1) {
			console.warn(`textarea of id: ${id} isn't numbered`);
			return;
		}
		// Otherwise, remove class name
		ta.classList.remove('tln-active');

		// Remove previous sibling if it's our wrapper (otherwise, I guess 'woops'?)
		const wrapperChck = ta.previousSibling;
		if (wrapperChck.className === 'tln-wrapper')
			wrapperChck.remove();

		// If somehow there's no event listeners list, we can leave
		if (!TLN.eventList[id]) return;
		// Otherwise iterate through listeners list and remove each one
		for (let i = TLN.eventList[id].length - 1; i >= 0; i--) {
			const evt = TLN.eventList[id][i];
			ta.removeEventListener(evt.evt, evt.hdlr);
		}
		// Finally, delete the listeners list for that ID
		delete TLN.eventList[id];
	}
}

export default TLN;