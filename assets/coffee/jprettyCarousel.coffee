(($, window, document) ->



    Plugin = (element, options) ->
        @stage = @element = element
        @stage = $(@stage)


        @options    = $.extend({}, defaults, options)
        @_defaults  = defaults
        @_name      = pluginName
        @nav        = new Navigation
        @galleryLayout ''
        @init()


    pluginName = "jprettyCarousel"
    css_class_prefix = "jpretty"

    defaults =
        visible_items: 5
        callback: ->
        percent_rate: 0.2
        next: ""
        prev: ""

    Navigation = ->

    Plugin:: =
        init: ->
            if @options.percent_rate > 1
                console.error "'percent_rate' have to be less than 1";
                return false;

            @current_index = 0
            @slide_index = 0
            @page_qnt = 0
            @pag_container = ""

            _this = @
            $this = @stage
            items = $this.children()
            slide_index = 0;
            current_index = slide_index;

            images_width_sum = @itemsWidthSum(items)

            item =
                qnt: @getItemsQnt(items)
                w: items.outerWidth true
                h: items.outerHeight true
                visibles: @visibleItemsLimit(@stage, items) || @options.visible_items


            page_qnt = Math.ceil(@getItemsQnt(items)/item.visibles);
            wrap_width = Math.round(item.w * item.visibles);

            #Pagination
            if page_qnt > 1
                @nav.pagination page_qnt, @pag_container

                @pag_container.find(@setClass 'pagination'+" li").on "click", ->
                    @pag_container.find(@setClass 'pagination'+" li").removeClass("active");
                    $(this).addClass("active");

                    @current_index = $(this).data("slideindex")*item.visibles;
                    @nav.updateSlide stage, @current_index, item.w, 1
                    @slide_index = @current_index;

            else
                @nav.pagination(0, @pag_container);

            #Events
            @stage.on "mouseenter mouseleave click", [@options.next, @options.prev, @setClass 'navigation' ] ,(e)->
                nav_data = $(this).data "nav"
                target = $(e.target)

                switch e.type
                    when "mouseenter"
                        if scroll
                            return false

                        if nav_data == "next"
                            _this.nav.overNext()
                        else if nav_data == "prev"
                             _this.nav.overPrev()

                    when "mouseleave"
                        _this.nav.mouseOut()

                    when "click"
                        if nav_data == "next"
                            _this.nav.clickNext();
                        else if nav_data == "prev"
                            _this.nav.clickPrev();



        itemsWidthSum: (children) ->
            sum = 0
            children.find('img').each((idx,el)->

              sum += $(el).outerWidth true

            )
            sum

        visibleItemsLimit: (wrap, items) ->

            sum = @itemsWidthSum(items);
            Math.ceil wrap.outerWidth(true)/ sum

        getItemsQnt: (children) ->
            children.length

        galleryLayout: ->
            #Gallery Container
            if !@stage.parent().hasClass(css_class_prefix+'-wrap')
                @stage.wrap "<div class="+css_class_prefix+"-wrap style='position:relative;'></div>"
                @slide_wrap = @pag_container = @stage.parent().parent();
            true

        setClass: (css_class) ->
            ['.',css_class_prefix,'-',css_class].join('')

    Navigation:: =

        overNext: ->
            if scroll
                return false
            if curIndex+item.visibles+1 <= item.qnt
                move = -(curIndex*item.w)-(item.w*settings.percentRate)
                @moveSlide stage,move

        overPrev: ->
            if curIndex-item.visibles>=0
                move = -(curIndex*item.w)+(item.w*settings.percentRate)
                @slide(stage,move,0.5);

        mouseOut: ->


        clickFunctions: ->

        clickNext: ->

        clickPrev: ->

        pagination: (pageQtd,selector) ->

        cur_page: (pageQtd,slideIndex,visibleItens,selector) ->

        moveSlide: (move) ->
            selector.css {
                left: move
            }

        updateSlide: (selector, index, width,time)->
            @moveSlide selector, -(index*width)


    $.fn[pluginName] = (options) ->
        @each ->
            $.data @, "plugin_" + pluginName, new Plugin(@, options)  unless $.data(@, "plugin_" + pluginName)

    # Prevents CoffeeScript to return a value from plugin wrapper.
    return
) jQuery, window, document