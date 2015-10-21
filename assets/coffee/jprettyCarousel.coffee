(($, window, document) ->



    Plugin = (element, options) ->
        @stage = @element = element
        @stage =
            el: $(@stage)
            width: $(@stage).outerWidth(true)
            left: @getCssInt $(@stage).css "left"

        @slide_wrap =
            el:  @stage.el.parent()
            width: @stage.el.parent().outerWidth(true)

        @options    = $.extend({}, defaults, options)
        @_defaults  = defaults
        @_name      = pluginName
        @init()

    pluginName = "jprettyCarousel"
    css_class_prefix = "jpretty"

    current_index = 0
    slide_index = 0
    page_qnt = 0
    pag_container = "";

    defaults =
        visible_items: 5
        callback: ->
        percent_rate: 0.2
        next: ""
        prev: ""

    Plugin:: =
        init: ->
            if @options.percent_rate > 1
                console.error "'percent_rate' have to be less than 1";
                return false;

            @galleryLayout ''
            pag_container = pag_container || @slide_wrap.el;

            _this = @
            $this = @stage.el
            items = $this.children()
            slide_index = 0;
            current_index = slide_index;

            images_width_sum = @itemsWidthSum(items)

            @item =
                qnt: @getItemsQnt(items)
                w: items.outerWidth true
                h: items.outerHeight true
                visibles: @options.visible_items || @visibleItemsLimit(@stage.el, items)

            page_qnt = Math.ceil(@getItemsQnt(items)/@item.visibles);
            wrap_width = Math.round(@item.w * @item.visibles);

            @setStagewidth(@item.w*@item.qnt)

            @stage.el.css {
                position: "absolute"
                width: (@itemBiggest(items)*@item.qnt)
                left: -slide_index*@itemBiggest(items)
            }

            #Pagination
            if page_qnt > 1

                @pagination page_qnt, pag_container

                pag_container.find(@setClass 'pagination').children().on "click", ->
                    pag_container.find(@setClass 'pagination').children().removeClass("active");
                    $(this).addClass("active");

                    current_index = $(this).data("slideindex")*@item.visibles;
                    @updateSlide stage, current_index, @item.w, 1
                    slide_index = current_index;

            else
                @pagination 0, pag_container

            #Events
            $([@options.next, @options.prev].join(',')).on "mouseenter mouseleave click", (e)->
                nav_data = $(this).data "jprettynav"

                if e.type == "mouseenter"
                    if scroll
                        return false

                    if nav_data == "next"
                        _this.overNext()
                    else if nav_data == "prev"
                         _this.overPrev()

                else if e.type == "mouseleave"
                    _this.mouseOut()

                else if e.type == "click"
                    if nav_data == "next"
                        _this.clickNext()
                    else if nav_data == "prev"
                        _this.clickPrev()

            return

        itemsWidthSum: (children) ->
            sum = 0
            children.find('img').each((idx,el)->

              sum += $(el).outerWidth true

            )
            sum

        itemBiggest: (children) ->
            max = []
            children.find('img').each((idx,el)->

              max.push $(el).outerWidth true

            )
            Math.max.apply '', max

        visibleItemsLimit: (wrap, items) ->
            sum = @itemsWidthSum(items);
            Math.ceil wrap.outerWidth(true)/ sum

        getItemsQnt: (children) ->
            children.length

        galleryLayout: ->
            #Gallery Container
            if !@stage.el.parent().hasClass(css_class_prefix+'-wrap')
                @stage.el.wrap "<div class="+css_class_prefix+"-wrap style='position:relative;'></div>"
                @slide_wrap.el = pag_container = @stage.el.parent();
            true

        setClass: (css_class) ->
            ['.',css_class_prefix,'-',css_class].join('')

        overNext: ->
            if scroll
                return false
            if current_index+@item.visibles+1 <= @item.qnt
                move = -(current_index*@item.w)-(@item.w*settings.percentRate)
                @moveSlide stage,move

        overPrev: ->
            if current_index-@item.visibles>=0
                move = -(current_index*@item.w)+(@item.w*settings.percentRate)
                @slide(stage,move,0.5);

        mouseOut: ->
            if !scroll
              @updateSlide stage, current_index, @item.w, 0.3
            return

        clickNext: ->

            to_move_next = ( Math.abs( @stage.left ) + @slide_wrap.width ) - @stage.width
            to_move_next = if  Math.abs(to_move_next) >= @slide_wrap.width then -@slide_wrap.width + @stage.left else @stage.left+to_move_next
            @setStageLeft(to_move_next)
            @setCurrentPage to_move_next, @slide_wrap.width
            @moveSlide to_move_next, current_index
            return

        clickPrev: ->
            if current_index == 1 or @stage.left == 0
                return false

            to_move = if @stage.left % @slide_wrap.width != 0 then @stage.left + Math.abs(@stage.left % @slide_wrap.width) else @stage.left + @slide_wrap.width
            to_move = if Math.abs(to_move) >= @slide_wrap.width and @stage.left % @slide_wrap.width == 0 then @stage.left + @slide_wrap.width else to_move

            @setStageLeft(to_move)
            @setCurrentPage to_move, @slide_wrap.width
            @moveSlide to_move, current_index
            return

        pagination: (pageQtd,selector) ->

            if pageQtd > 0
                li_itens = ""

                i = 0
                while i < pageQtd
                  active_class = if i == 0 then 'active' else ''
                  li_itens += '<span class="'+css_class_prefix+'-pagination-item '+ css_class_prefix+'-page-'+i+' '+active_class + '" data-slideindex=\'' + i + '\'><a href=\'javascript:\'><i>&bull;</i></a></span>'
                  i++

                $(selector).find('.'+css_class_prefix+'-navigation').html li_itens

            else
                $(selector).find('.'+css_class_prefix+'-navigation').html ""

        cur_page: (pageQtd,slideIndex,visibleItens,selector) ->
            if pageQtd > 0
                $(selector).find('.slide-pagination li').removeClass 'active'
                $(selector).find('.slide-pagination li').eq(slideIndex / visibleItens).addClass 'active'

        moveSlide: (to_move, cur_page, onComplete) ->

            onComplete = onComplete || ->

            @stage.el.css({
                "left": to_move
            }).data("current_page", cur_page);
            return

        setCurrentPage: (cur_left, wrapsize)->
            current_page = Math.ceil( Math.abs(cur_left) /wrapsize)+1;

        getCarouselLeft: () ->
            @getCssInt @stage.el.css "left"

        getCssInt: (str) ->
            Number(str.replace(/[a-z-A-Z]+$|\%$/g,""))

        setStagewidth: (w)->
            @stage.width = w

        setStageLeft: (l) ->
            @stage.left = l

    $.fn[pluginName] = (options) ->
        @each ->
            $.data @, "plugin_" + pluginName, new Plugin(@, options)  unless $.data(@, "plugin_" + pluginName)

    # Prevents CoffeeScript to return a value from plugin wrapper.
    return
) jQuery, window, document