(function($){
	var scroll = false;
	$.fn.jprettyCarousel = function(options) {
		var slideDefaults = {
			visibleItens: 5,
			callback: function(){},
			percentRate: 0.2,
			next: "",
			prev: ""
		};
		var ie8 = ($.browser.msie && $.browser.version == "8.0");
		var ie7 = ($.browser.msie && $.browser.version == "7.0");

		var settings = $.extend(slideDefaults,options);
		if(settings.percentRate > 1) {
				alert("O parâmetro 'percentRate' deve ser menor que 1");
				return false;
		}
		$(this).each(function(index, element) {
			
			setSlideIndex(0);

			var curIndex = getSlideIndex();
            var $stage = $(this);
			var $itens = $(this).children();
			var $itensQtd = $itens.length; 
			var $itemWidth = $itens.outerWidth(true);
			var $itemHeight = $itens.height();
			var visibleItens = settings.visibleItens;
			var pageQtd = Math.ceil($itensQtd/visibleItens);
			var wrapWidth = parseInt($itemWidth * visibleItens);
					
			$stage.css({
				position: "absolute", 
				width: ($itemWidth*$itensQtd) ,
				left: -getSlideIndex()*$itemWidth
			}); 
			
			//cria um container para a galeria
			if(!$stage.parent().hasClass('slideWrap')) {
				$stage.wrap("<div class='slideWrap' style='position:relative;'></div>");
			}
			
			var slideWrap = $stage.parent();
			
			//adiciona o estilo do container
			slideWrap.css({
				"overflow":"hidden",
				"min-height":$itemHeight,
				width: wrapWidth
			});
			var teste =":)";
			
			//adiciona a mevegacao na galeria
			if($itensQtd > settings.visibleItens) {
				if(slideWrap.has('.slideNavigation').length < 1) {
					slideWrap.append("<div class='slideNavigation slidePrev'></div><div class='slideNavigation slideNext'></div>");
				}
			}
			else {
				slideWrap.find(".slideNavigation").remove();
			}
			
			//adiciona o estilo a navegacao
			$(".slideNavigation").css({
				"position":"absolute",
				"min-height":$itemHeight,
				"min-width":40,
				"cursor":"pointer",
				zIndex: 80
			});

			if($.browser.msie) {
				$(".slideNavigation").css({ "background-color":"#fff",opacity:0 });
			}
			
			$(".slideNext").css("right",0);
			$(".slidePrev").css("left",0);
			
			
			//PAGINACAO
			if(pageQtd > 1) {
				slidePagination(pageQtd, slideWrap.parent());
				slideWrap.parent().find(".slide-pagination li").on("click",function(){
					slideWrap.parent().find(".slide-pagination li").removeClass("active");
					$(this).addClass("active");
					
					curIndex = $(this).data("slideindex")*visibleItens;	
					updateslideAnim($stage,curIndex,$itemWidth,1);
					setSlideIndex(curIndex);
					
				});
			}
			else {
				slidePagination(0, slideWrap.parent());
			}
			
			slideWrap.find(".slideNavigation").on("mouseenter mouseleave click",function(e){
				if(e.type === "mouseenter") {
					if(scroll) return false;
					if($(this).hasClass("slideNext")){						
						if(curIndex+visibleItens+1 <= $itensQtd) {
							var move = -(curIndex*$itemWidth)-($itemWidth*settings.percentRate);//($itemWidth/2);
							slideAnimation($stage,move,0.5);
						}						
					}
					else if($(this).hasClass("slidePrev")) {
						if(curIndex-visibleItens>=0) {
							var move = -(curIndex*$itemWidth)+($itemWidth*settings.percentRate);
							slideAnimation($stage,move,0.5);
						}
					}
				}
				if(e.type === "mouseleave") {
					if(!scroll) {
						updateslideAnim($stage, curIndex, $itemWidth,0.3);
					}
				}
				if(e.type === "click") {
					if($(this).hasClass("slideNext")){					
						if(curIndex+visibleItens+1 >= $itensQtd) {
							curIndex = $itensQtd-visibleItens;
						}
						else {
							curIndex+=visibleItens;
						}
						scroll = true;
					}
					else if($(this).hasClass("slidePrev")) {
						if(curIndex-visibleItens< 0) {
							curIndex = 0;
						}
						else {
							curIndex-=visibleItens;
						}
						scroll = true;
					}
					
					updateslideAnim($stage,curIndex, $itemWidth,0.7);
					setCurPag(pageQtd,curIndex,visibleItens,slideWrap.parent());
					setSlideIndex(curIndex);
				}
			}); //FIM DOS EVENTOS
			

			if(settings.next != "") {
				$(settings.next).off("mouseenter mouseleave click");
				$(settings.next).on("mouseenter mouseleave click",function(e){

					switch(e.type) {
						case "mouseenter":
							if(scroll) return false;
							if(curIndex+visibleItens+1 <= $itensQtd) {
								var move = -(curIndex*$itemWidth)-($itemWidth*settings.percentRate);
								slideAnimation($stage,move,0.5);
							}
						break;

						case "mouseleave":
							if(!scroll) {
								updateslideAnim($stage, curIndex, $itemWidth,0.3);
							}
						break;

						case "click":
							e.preventDefault();
							if(curIndex+visibleItens+1 >= $itensQtd) {
								curIndex = $itensQtd-visibleItens;
							}
							else {
								curIndex+=visibleItens;
							}
							scroll = true;
							updateslideAnim($stage,curIndex, $itemWidth,0.7);
							setCurPag(pageQtd,curIndex,visibleItens,slideWrap.parent());
							setSlideIndex(curIndex);
						break;
					}
					
				});					
										
			}

			if(settings.prev != "") {
				$(settings.prev).off("mouseenter mouseleave click");
				$(settings.prev).on("mouseenter mouseleave click",function(e){
					switch(e.type) {
						case "mouseenter":
							if(curIndex-visibleItens>=0) {
								var move = -(curIndex*$itemWidth)+($itemWidth*settings.percentRate);
								slideAnimation($stage,move,0.5);
							}
						break;

						case "mouseleave":
							if(!scroll) {
								updateslideAnim($stage, curIndex, $itemWidth,0.3);
							}
						break;

						case "click":
							e.preventDefault();
							if(curIndex-visibleItens< 0) {
								curIndex = 0;
							}
							else {
								curIndex-=visibleItens;
							}
							scroll = true;
							updateslideAnim($stage,curIndex, $itemWidth,0.7);
							setCurPag(pageQtd,curIndex,visibleItens,slideWrap.parent());
							setSlideIndex(curIndex);
						break;
					}
					
				});					
										
			}
			//CLICK CALLBACK
			if(typeof(settings.callback) == "function") { 
				settings.callback.apply($(this));
			}
			else { 
				settings.callback = function(){
					
				};
			}
		});
	};

	//FUNCOES
	function slideAnimation(selector,move,time){
		selector.stop().animate({
			left: move
		},{
			duration: time*1000,
			//easing: "easeInOutCubic",
			complete: function(){
				scroll = false;
			}
		});
	}
	
	function updateslideAnim(selector, index, width,time) {
		var time = time || 2;
		slideAnimation(selector, -(index*width), time);
	}
	
	function cssParseInt(val) {
		var val = val.split("px")[0];
		return Number(val);
	}
	
	function slidePagination(pageQtd,selector){
		if(pageQtd > 0) {
			var li_itens ="";

			for(var i=0; i<pageQtd; i++) {
				var activeClass = (i==0) ? "active" : "";
				li_itens+= "<li class='page_"+i+" "+activeClass+"' data-slideindex='"+i+"'><a href='javascript:'>&bull;</a></li>";
			}

			if(selector.find('.slide-pagination').length < 1) {
				$(selector).append("<ul class='slide-pagination'>"+li_itens+"</ul>");
			}
			else {
				$(selector).find('.slide-pagination').html(li_itens);
			}
		}
		else {
			$(selector).find('.slide-pagination').html("");
		}
	}
	
	function setCurPag(pageQtd,slideIndex,visibleItens,selector) {
		if(pageQtd>0) {
			$(selector).find(".slide-pagination li").removeClass("active");
			$(selector).find(".slide-pagination li").eq(slideIndex/visibleItens).addClass("active");
		}
		
	}
	
	function setSlideIndex(index) {
		this.slideIndex = index;
	}
	
	function getSlideIndex() {
		return this.slideIndex;
	}
})(jQuery);