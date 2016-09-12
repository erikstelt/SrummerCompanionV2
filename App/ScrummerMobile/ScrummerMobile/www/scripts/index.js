(function () {
    "use strict";

    API.token = window.localStorage.getItem('token');

    // Refresh all views each 5 minutes
    window.setInterval(function () {
        Object.keys(Template.data).forEach(function (id) {
            Template.render(id);
        });
    }, 5 * 60 * 1000);

    // Override this slider's dragMove to prevent events from 'escaping' to the parent slider
    // Also disable overscroll
    Flickity.prototype.dragMove = function( event, pointer, moveVector ) {
        //preventDefaultEvent( event );

        this.previousDragX = this.dragX;
        // reverse if right-to-left
        var direction = this.options.rightToLeft ? -1 : 1;
        var dragX = this.dragStartPosition + moveVector.x * direction;

        if ( !this.options.wrapAround && this.cells.length ) {
            // slow drag
            var originBound = Math.max( -this.cells[0].target, this.dragStartPosition );
            dragX = dragX > originBound ? originBound : dragX;
            var endBound = Math.min( -this.getLastCell().target, this.dragStartPosition );
            dragX = dragX < endBound ? endBound : dragX;
        }

        this.dragX = dragX;

        this.dragMoveTime = new Date();

        if (this.selectedIndex === 0 && moveVector.x < 0) {
            event.stopImmediatePropagation();
        }
        else if (this.selectedIndex === this.cells.length - 1 && moveVector.x > 0) {
            event.stopImmediatePropagation();
        }
        else if (this.selectedIndex !== 0 && this.selectedIndex !== this.cells.length - 1) {
            event.stopImmediatePropagation();
        }
        else {
            this.dispatchEvent( 'dragMove', event, [ pointer, moveVector ] );
        }
    };

    /**
     * Override Flickity's version to distinguish between horizontal and vertical (scroll)
     *
     * @param moveVector
     * @return {boolean}
     */
    Flickity.prototype.hasDragStarted = function (moveVector) {
        return Math.abs(moveVector.x) > 5 && Math.abs(moveVector.y) < 5;
    }
} )();

/**
 * Helper function to make event delegation easy
 *
 * @param {Node|NodeList} element Container element to add delegation
 * @param {string} filter Selector to filter by
 * @param {function} handler Handler of the event
 * @param {string} [event] Name of the event. Defaults to click
 */
function delegate(element, filter, handler, event) {
    event = event || 'click';

    // NodeList is the same as calling delegate for each element in the list
    if (element instanceof NodeList) {
        Array.prototype.forEach.call(element, function (el) {
            delegate(el, filter, handler, event);
        });
    }

    element.addEventListener(event, function (e) {
        var target;

        for (var i = 0; i < e.path.length; i++) {
            var el = e.path[i];

            if (el.matches(filter)) {
                target = el;

                break;
            }

            if (el === element) break;
        }

        if (!target) return;

        handler.call(target, e);
    });
}