const TLN = {
	eventList: {},
	updateLineNumber: function (ta: HTMLTextAreaElement, el: HTMLDivElement) {
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
	appendLineNumbers: function (id: string) {
		// Get reference to desired <textarea>
		const ta = document.getElementById(id) as HTMLTextAreaElement;
		// If getting reference to element fails, warn and leave
		if (ta === null) {
			throw new Error(`No element with id='${id} found'`);
		}
		// Exit if textarea element already has TLN active
		if (ta.className.indexOf('tln-active') != -1) {
			return;
		}
		// Otherwise, we're safe to add the class name and clear inline styles
		ta.classList.add('tln-active');

		// Create line numbers wrapper, insert it before <textarea>
		const el = document.createElement('div') as HTMLDivElement;
		el.className = 'tln-wrapper';
		ta.parentNode.insertBefore(el, ta);
		// Call update to actually insert line numbers to the wrapper
		TLN.updateLineNumber(ta, el);
		// Initialize event listeners list for this element ID, so we can remove
		// them later if needed
		TLN.eventList[id] = [];

		// Constant list of input event names so we can iterate
		const changeEvents = [ 'propertychange', 'input', 'keydown', 'keyup' ];
		// Default handler for input events
		const onTextareaChange = function (ta, el) {
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
		for (let i = 0; i < changeEvents.length; i++) {
			ta.addEventListener(changeEvents[i], onTextareaChange);
			TLN.eventList[id].push({
				event: changeEvents[i],
				handler: onTextareaChange
			});
		}

		// Constant list of scroll event names so we can iterate
		const scrollEvents = ['change', 'mousewheel', 'scroll'];
		// Default handler for scroll events (pretty self explanatory)
		const onScroll = function (ta, el) {
			return function () { el.scrollTop = ta.scrollTop; }
		}(ta, el);
		// Just like before, iterate and add listeners to <textarea> and to list
		/// TODO: Also just like before: performance?
		for (let i = scrollEvents.length - 1; i >= 0; i--) {
			ta.addEventListener(scrollEvents[i], onScroll);
			TLN.eventList[id].push({
				event: scrollEvents[i],
				handler: onScroll
			});
		}
	}
}

export { TLN };