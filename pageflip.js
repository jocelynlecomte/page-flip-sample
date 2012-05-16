(function() {
	
	// Dimensions du livre
	var BOOK_WIDTH = 830;
	var BOOK_HEIGHT = 260;
	
	// Dimensions d'une page
	var PAGE_WIDTH = 400;
	var PAGE_HEIGHT = 250;
	
	// Espace vertical sentre le bord supérieur du livre et les pages
	var PAGE_Y = ( BOOK_HEIGHT - PAGE_HEIGHT ) / 2;
	
	// La taille du canevas est égale à celle du livre + cet espace
	var CANVAS_PADDING = 60;

	// Page actuellement affichée
	var currentPage = 0;
	
	// Coordonnées de la souris
	var mouse = { x: 0, y: 0 };
	
	// Gestion des effets en cours
	var flips = [];
	
	var book = document.getElementById( "book" );
	var pages = book.getElementsByTagName( "section" );
	var canvas = document.getElementById( "pageflip-canvas" );
	var context = canvas.getContext( "2d" );

	console.log("tot");

	// Organisation de la profondeur des pages et création du tableau de gestion des effets
	for ( var i = 0, len = pages.length; i < len; i++ ) {
		pages[i].style.zIndex = len - i;
		
		flips.push( {
			// Element du DOM concerné par l'effet
			page: pages[i],
			// Progression actuelle de l'animation de cette page
			progress: 1,
			// Cible que progress devra atteindre
			target: 1,
			// La page est-elle en train de tourner ?
			flipping: false
		} );
	}
	
	// Redimensionner et déplacer le canevas pour qu'il entoure le livre
	canvas.width = BOOK_WIDTH + ( CANVAS_PADDING * 2 );
	canvas.height = BOOK_HEIGHT + ( CANVAS_PADDING * 2 );
	canvas.style.top = -CANVAS_PADDING + "px";
	canvas.style.left = -CANVAS_PADDING + "px";

	var FPS = 60;
	// Afficher l'effet FPS fois par seconde
	setInterval( render, 1000 / FPS );

	document.addEventListener( "click", mouseClickHandler, false );
	
	function mouseClickHandler( event ) {
		mouse.x = event.clientX - book.offsetLeft;
		mouse.y = event.clientY - book.offsetTop;

		console.log(currentPage);
		// On s'assure que le pointeur de la souris est à l'intérieur du livre
		if (0 < mouse.x && mouse.x < BOOK_WIDTH && 0 < mouse.y && mouse.y < BOOK_HEIGHT) {
			if (mouse.x < PAGE_WIDTH && currentPage > 0) {
				// Page précédente
				//flips[currentPage].page.style.width = PAGE_WIDTH + "px";
				flips[currentPage - 1].target = 1;
				flips[currentPage - 1].flipping = true;
				currentPage--;
			}
			else if (mouse.x >= PAGE_WIDTH && currentPage < flips.length - 1) {
				// Page suivante
				flips[currentPage].target = -1;
				flips[currentPage].flipping = true;
				//flips[currentPage].page.style.width = "0";
				currentPage++;
			}
		}
	}

	function render() {
		// Effacer le canevas
		context.clearRect( 0, 0, canvas.width, canvas.height );
		
		// Parcours du tableau de gestion des effets
		for( var i = 0, len = flips.length; i < len; i++ ) {
			var flip = flips[i];
			if (flip.flipping) {
				// On progresse vers la cible 
				flip.progress += ( flip.target - flip.progress ) * 0.1;
				// On dessine la page
				drawFlip( flip );
				// On vérifie si la cible est atteinte
				if (Math.abs(flip.target - flip.progress) < 0.003) {
					flip.flipping = false;
					flip.progress = flip.target;
				}
			}			
		}
	}

	function drawFlip(flip) {
		var strength = 1 - Math.abs( flip.progress );
		var foldWidth = ( PAGE_WIDTH * 0.5 ) * ( 1 - flip.progress );
		var foldX = PAGE_WIDTH * flip.progress + foldWidth;
		var verticalOutdent = 20 * strength;
		var paperShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( 1 - flip.progress, 0.5 ), 0 );
		var rightShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
		var leftShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
		
		
		// Donner à la largeur de la section correspondante la valeur
		flip.page.style.width = Math.max(foldX, 0) + "px";
		
		context.save();
		context.translate( CANVAS_PADDING + ( BOOK_WIDTH / 2 ), PAGE_Y + CANVAS_PADDING );
		drawFoldedPaper(foldX, foldWidth, verticalOutdent, paperShadowWidth);
        drawSharpShadow(foldX, foldWidth, verticalOutdent, strength);
        drawDroppedShadow(foldX, foldWidth, strength);
		
		context.restore();
	}

	function drawFoldedPaper(foldX, foldWidth, verticalOutdent, paperShadowWidth) {
	    context.beginPath();
	    context.moveTo(foldX, 0);
	    context.lineTo(foldX, PAGE_HEIGHT);
	    context.quadraticCurveTo(foldX, PAGE_HEIGHT + (verticalOutdent * 2), foldX - foldWidth, PAGE_HEIGHT + verticalOutdent);
	    context.lineTo(foldX - foldWidth, -verticalOutdent);
	    context.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);

        // Dégradé appliqué au pli de la feuille
        var foldGradient = context.createLinearGradient(foldX - paperShadowWidth, 0, foldX, 0);
        foldGradient.addColorStop(0.35, '#fafafa');
        foldGradient.addColorStop(0.73, '#eeeeee');
        foldGradient.addColorStop(0.9, '#fafafa');
        foldGradient.addColorStop(1.0, '#e2e2e2');
        context.fillStyle = foldGradient;
        context.fill();

	    context.strokeStyle = 'rgba(0,0,0,0.06)';
	    context.lineWidth = 0.5;
	    context.stroke();
	}

	function drawSharpShadow(foldX, foldWidth, verticalOutdent, strength) {
	    context.strokeStyle = 'rgba(0,0,0,'+(0.05 * strength)+')';
	    context.lineWidth = 30 * strength;
	    context.beginPath();
	    context.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
	    context.lineTo(foldX - foldWidth, PAGE_HEIGHT + (verticalOutdent * 0.5));
	    context.stroke();
	}

	function drawDroppedShadow(foldX, foldWidth, strength) {
		// Right side drop shadow
	    var rightShadowWidth = (PAGE_WIDTH * 0.5) * Math.max(Math.min(strength, 0.5), 0);
	    var rightShadowGradient = context.createLinearGradient(foldX, 0, foldX + rightShadowWidth, 0);
	    rightShadowGradient.addColorStop(0, 'rgba(0,0,0,'+(strength*0.2)+')');
	    rightShadowGradient.addColorStop(0.8, 'rgba(0,0,0,0.0)');
	      
	    context.fillStyle = rightShadowGradient;
	    context.beginPath();
	    context.moveTo(foldX, 0);
	    context.lineTo(foldX + rightShadowWidth, 0);
	    context.lineTo(foldX + rightShadowWidth, PAGE_HEIGHT);
	    context.lineTo(foldX, PAGE_HEIGHT);
	    context.fill();


	    // Left side drop shadow
	    var leftShadowWidth = (PAGE_WIDTH * 0.5) * Math.max(Math.min(strength, 0.5), 0);
	    var leftShadowGradient = context.createLinearGradient(foldX - foldWidth - leftShadowWidth, 0, foldX - foldWidth, 0);
	    leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.0)');
	    leftShadowGradient.addColorStop(1, 'rgba(0,0,0,'+(strength*0.15)+')');
	        
	    context.fillStyle = leftShadowGradient;
	    context.beginPath();
	    context.moveTo(foldX - foldWidth - leftShadowWidth, 0);
	    context.lineTo(foldX - foldWidth, 0);
	    context.lineTo(foldX - foldWidth, PAGE_HEIGHT);
	    context.lineTo(foldX - foldWidth - leftShadowWidth, PAGE_HEIGHT);
	    context.fill();
	}
})();


