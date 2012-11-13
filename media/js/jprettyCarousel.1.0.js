(function($){
	var scroll = false;
	Navigation.prototype = new Animation();
	var nav = new Navigation();
	var nav_events = nav.events;

	$.fn.jprettyCarousel = function(options) {

		var slideDefaults = {
			visibleItens: 5,
			callback: function(){},
			percentRate: 0.2,
			next: "",
			prev: ""
		};
		settings = $.extend(slideDefaults,options);
		var slide_index = 0;

		if(settings.percentRate > 1) {
				alert("O parâmetro 'percentRate' deve ser menor que 1");
				return false;
		}
		$(this).each(function(index, element) {
			
			slide_index = 0;

			curIndex = slide_index;
            var stage = $(this);
            var itens = $(this).children();
            item = {
            	qnt: $(this).children().length,
            	w: itens.outerWidth(true),
            	h: itens.height(),
            	visibles: settings.visibleItens
            }
			var pageQtd = Math.ceil(item.qnt/item.visibles);
			var wrapWidth = Math.round(item.w * item.visibles);
					
			stage.css({
				position: "absolute", 
				width: (item.w*item.qnt) ,
				left: -slide_index*item.w
			}); 
			
			//cria um container para a galeria
			if(!stage.parent().hasClass('slideWrap')) {
				stage.wrap("<div class='slideWrap' style='position:relative;'></div>");
				var slideWrap = stage.parent();
				var pag_container = slideWrap.parent();
			}
			
			//adiciona o estilo do container
			slideWrap.css({
				"overflow":"hidden",
				"min-height":item.h,
				width: wrapWidth
			});
			
			//adiciona a mevegacao na galeria
			if(item.qnt > item.visibles) {
				if(slideWrap.find('.slideNavigation').length < 1) {
					slideWrap.append("<div class='slideNavigation slidePrev' data-nav='prev'></div><div class='slideNavigation slideNext' data-nav='next'></div>");
				}
			}
			else {
				slideWrap.find(".slideNavigation").remove();
			}
			
			//adiciona o estilo a navegacao
			$(".slideNavigation").css({
				"position":"absolute",
				"min-height":item.h,
				"min-width":40,
				"cursor":"pointer",
				zIndex: 80
			});

			//correct absolute opacity bug
			if($.browser.msie) {
				$(".slideNavigation").css({ "background-color":"#fff",opacity:0 });
			}
			
			$(".slideNext").css("right",0);
			$(".slidePrev").css("left",0);
			
			
			//PAGINACAO
			if(pageQtd > 1) {
				nav.pagination(pageQtd, pag_container);

				pag_container.find(".slide-pagination li").on("click",function(){
					pag_container.find(".slide-pagination li").removeClass("active");
					$(this).addClass("active");
					
					curIndex = $(this).data("slideindex")*item.visibles;	
					Animation.updateSlide(stage,curIndex,item.w,1);
					slide_index = curIndex;
					
				});
			}
			else {
				nav.pagination(0, pag_container);
			}
			
			slideWrap.find(".slideNavigation").on("mouseenter mouseleave click",function(e){
				var nav_data = $(this).data("nav");

				if(e.type === "mouseenter") {
					if(scroll) return false;
					switch(nav_data){
						case "next":
							nav_events.overNext();
						break;
						case "prev":
							nav_events.overPrev();
						break;
					}
				}

				if(e.type === "mouseleave") {
					nav_events.mouseOut();
				}

				if(e.type === "click") {
					switch(nav_data){
						case "next":
							nav_events.clickNext();
						break;

						case "prev":
							nav_events.clickPrev();
						break;
					}
				}
			}); //FIM DOS EVENTOS
			

			if(settings.next != "") {
				$(settings.next).off("mouseenter mouseleave click");
				$(settings.next).on("mouseenter mouseleave click",function(e){

					switch(e.type) {
						case "mouseenter":
							nav_events.overNext()
						break;

						case "mouseleave":
							nav_events.mouseOut()
						break;

						case "click":
							e.preventDefault();
							nav_events.clickNext();
						break;
					}
					
				});					
										
			}

			if(settings.prev != "") {
				$(settings.prev).off("mouseenter mouseleave click");
				$(settings.prev).on("mouseenter mouseleave click",function(e){
					switch(e.type) {
						case "mouseenter":
							if(curIndex-item.visibles>=0) {
								var move = -(curIndex*item.w)+(item.w*settings.percentRate);
								Animation.slide(stage,move,0.5);
							}
						break;

						case "mouseleave":
							if(!scroll) {
								Animation.updateSlide(stage, curIndex, item.w,0.3);
							}
						break;

						case "click":
							e.preventDefault();
							if(curIndex-item.visibles< 0) {
								curIndex = 0;
							}
							else {
								curIndex-=item.visibles;
							}
							scroll = true;
							Animation.updateSlide(stage,curIndex, item.w,0.7);
							Navigation.cur_page(pageQtd,curIndex,item.visibles,pag_container);
							slide_index = curIndex;
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
function Animation() {
	this.slide = function(selector,move,time){
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
	this.updateSlide = function(selector, index, width,time) {
		var time = time || 2;
		this.slide(selector, -(index*width), time);
	}
}
 
function Navigation(){
	var that = this;

	this.events = {
		overNext : function(){
			if(scroll) return false;
			if(curIndex+item.visibles+1 <= item.qnt) {
				var move = -(curIndex*item.w)-(item.w*settings.percentRate);//(item.w/2);
				that.slide(stage,move,0.5);
			}
		},
		overPrev : function() {
			if(curIndex-item.visibles>=0) {
				var move = -(curIndex*item.w)+(item.w*settings.percentRate);
				that.slide(stage,move,0.5);
			}
		},
		mouseOut : function(){
			if(!scroll) {
				that.updateSlide(stage, curIndex, item.w,0.3);
			}
		},
		clickFunctions : function(){
			that.updateSlide(stage,curIndex, item.w,0.7);
			that.cur_page(pageQtd,curIndex,item.visibles,pag_container);
			slide_index = curIndex;
		},
		clickNext : function(){
			if(curIndex+item.visibles+1 >= item.qnt) {
				curIndex = item.qnt-item.visibles;
			}
			else {
				curIndex+=item.visibles;
			}
			scroll = true;
			that.clickFunctions();
		},
		clickPrev : function() {
			if(curIndex-item.visibles< 0) {
				curIndex = 0;
			}
			else {
				curIndex-=item.visibles;
			}
			scroll = true;
			that.clickFunctions();
		}
	}

	this.pagination= function(pageQtd,selector){
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

	this.cur_page= function(pageQtd,slideIndex,visibleItens,selector){
		if(pageQtd>0) {
			$(selector).find(".slide-pagination li").removeClass("active");
			$(selector).find(".slide-pagination li").eq(slideIndex/visibleItens).addClass("active");
		}
	}
}

})(jQuery);