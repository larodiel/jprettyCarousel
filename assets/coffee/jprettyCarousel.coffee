(($, window, document) ->

    Plugin = (element, options) ->
        @stage = @element = element

        @options    = $.extend({}, defaults, options)
        @_defaults  = defaults
        @_name      = pluginName

        @stage =
            el: $(@stage)
            width: @itemBiggest( $(@stage) ) * $(@stage).children().length
            left: @getCssInt $(@stage).css "left"

        @slide_wrap =
            el:  @stage.el.parent()
            width: @itemBiggest( @stage.el ) * @options.visible_items

        @preloadImages( @stage.el.find('img').toArray() )
            .done =>
                @init()
            return



    pluginName = "jprettyCarousel"
    css_class_prefix = "jpretty"

    slide_index = 0
    pag_container = ""
    scroll = false

    defaults =
        visible_items: 5
        callback: ->
        percent_rate: 0.2
        next: ""
        prev: ""

    Plugin:: =
        init: ->
            if @options.percent_rate > 1 || @options.percent_rate < 0
                console.error "'percent_rate' have to be less than 1 and greater than 0";
                return false;

            @galleryLayout()
            pag_container = pag_container || @slide_wrap.el;

            _this = @
            $this = @stage.el
            items = $this.children()
            loaded_images = 0
            slide_index = 0;
            @current_index = slide_index;

            images_width_sum = @itemsWidthSum(items)

            #Add class
            items.addClass css_class_prefix+"-item"
            @stage.el.addClass css_class_prefix+"-stage"

            @item =
                qnt: @getItemsQnt(items)
                w: items.outerWidth true
                h: items.outerHeight true
                visibles: @options.visible_items || @visibleItemsLimit(@stage.el, items)

            @page_qnt = Math.ceil(@getItemsQnt(items)/@item.visibles);
            wrap_width = Math.round(@item.w * @item.visibles);

            $(@setClass('wrap')).css {
                'max-width': wrap_width
            }

            @stage.el.css {
                width: @itemBiggest(@stage.el) * items.length
            }

            @setStagewidth(@item.w*@item.qnt)

            #Pagination
            if @page_qnt > 1

                @pagination @page_qnt, @slide_wrap.el
                @slide_wrap.el.find(@setClass 'pagination-item').on "click", ->
                    idx = $(this).index()
                    _this.moveSlide true, _this.slide_wrap.width, idx

            else
                @pagination 0, @slide_wrap.el

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
            return

        setClass: (css_class) ->
            ['.',css_class_prefix,'-',css_class].join('')

        overNext: ->
            if scroll
                return false

            if @current_index+@item.visibles+1 < @item.qnt
                move = @stage.left - (@item.w*@options.percent_rate)
                @moveSlide move,@current_index

        overPrev: ->

            if @item.visibles - @current_index > 0 and @current_index > 1
                move = @stage.left + (@item.w*@options.percent_rate)
                @moveSlide move,@current_index

        mouseOut: ->
            if !scroll
                @moveSlide @stage.left,@current_index
            return

        clickNext: ->

            if @current_index == @page_qnt
                return false

            to_move_next = ( Math.abs( @stage.left ) + @slide_wrap.width ) - @stage.width
            to_move_next = if  Math.abs(to_move_next) >= @slide_wrap.width then -@slide_wrap.width + @stage.left else @stage.left+to_move_next
            @setStageLeft(to_move_next)
            @setCurrentIndex to_move_next, @slide_wrap.width
            @moveSlide to_move_next, @current_index
            return

        clickPrev: ->
            if @current_index == 1 or @stage.left == 0
                return false

            to_move = if @stage.left % @slide_wrap.width != 0 then @stage.left + Math.abs(@stage.left % @slide_wrap.width) else @stage.left + @slide_wrap.width
            to_move = if Math.abs(to_move) >= @slide_wrap.width and @stage.left % @slide_wrap.width == 0 then @stage.left + @slide_wrap.width else to_move

            @setStageLeft(to_move)
            @setCurrentIndex to_move, @slide_wrap.width
            @moveSlide to_move, @current_index
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

        moveSlide: (to_move, cur_page) ->

            __arg_size = arguments.length

            if __arg_size > 2
                to_move = -(arguments[1]*arguments[2])

            @stage.el.css({
                "left": to_move
            }).data("current_page", cur_page);

            if typeof arguments[__arg_size-1] == "function"
                arguments[__arg_size-1].call("")

            return



        setCurrentIndex: (cur_left, wrapsize)->
            @current_index = Math.ceil( Math.abs(cur_left) /wrapsize)+1;

        getCarouselLeft: () ->
            @getCssInt @stage.el.css "left"

        getCssInt: (str) ->
            Number(str.replace(/[a-z-A-Z]+$|\%$/g,""))

        setStagewidth: (w)->
            @stage.width = w

        setStageLeft: (l) ->
            @stage.left = l

        preloadImages: (srcs) ->

            jQuery.whenArray = ( array ) ->
                jQuery.when.apply( this, array );

            dfd = $.Deferred()
            promises = []
            img
            l
            p

            if !$.isArray(srcs)
                srcs = [srcs]

            l = srcs.length;

            i = 0

            while i < l

                p = $.Deferred()
                img = $('<img />')
                img.load p.resolve
                img.error p.resolve
                promises.push p
                img.get(0).src = srcs[i].src
                ++i
            $.whenArray(promises).done(dfd.resolve);

            dfd.promise();

    $.fn[pluginName] = (options) ->
        @each ->
            $.data @, pluginName, new Plugin(@, options)  unless $.data(@, "plugin_" + pluginName)

    # Prevents CoffeeScript to return a value from plugin wrapper.
    return
) jQuery, window, document