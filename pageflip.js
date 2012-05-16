

(function() {
	
	// Dimensions du livre
	var BOOK_WIDTH = 830;
	var BOOK_HEIGHT = 260;
	
	// Dimensions d'une page
	var PAGE_WIDTH = 400;
	var PAGE_HEIGHT = 250;
	
	// Espace vertical entre le bord supérieur du livre et les feuilles
	var PAGE_Y = ( BOOK_HEIGHT - PAGE_HEIGHT ) / 2;
	
	// Page actuellement affichée
	var currentPage = 0;
	
	// Coordonnées de la souris
	var mouse = { x: 0, y: 0 };
	
	// Gestion des effets en cours
	var flips = [];
	
	var book = document.getElementById( "book" );
	var pages = book.getElementsByTagName( "section" );
	
	// Organisation de la profondeur des pages et création du tableau de gestion des effets
	for( var i = 0, len = pages.length; i < len; i++ ) {
		pages[i].style.zIndex = len - i;
		
		flips.push( {
			// Element du DOM concerné par l'effet
			page: pages[i]
		} );
	}
	
	document.addEventListener( "click", mouseClickHandler, false );
	
	function mouseClickHandler( event ) {
		mouse.x = event.clientX - book.offsetLeft;
		mouse.y = event.clientY - book.offsetTop;

		// Make sure the mouse pointer is inside of the book
		if (0 < mouse.x && mouse.x < BOOK_WIDTH && 0 < mouse.y && mouse.y < BOOK_HEIGHT) {
			if (mouse.x < PAGE_WIDTH && currentPage > 0) {
				currentPage--;
				flips[currentPage].page.style.width = PAGE_WIDTH + "px";
			}
			else if (mouse.x >= PAGE_WIDTH && currentPage < flips.length - 1) {
				flips[currentPage].page.style.width = "0";
				currentPage++;
			}
		}
	}	
})();


