(function ($) {
    $.prettybox = function (el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        base.elId = base.$el.attr('id');

        // Add a reverse reference to the DOM object
        base.$el.data("prettybox", base);


        // private function
        function render() {
            var optionList = [];
            $.each(base.el.options, function (key, value) {
                optionList.push({
                    index: key,
                    selected: value.selected,
                    text: value.text,
                    value: value.value
                });
            });

            base.generated = $.tmpl(
                base.options.prettyBoxTemplateName,
                $.extend(
                    { parent_id: base.elId,
                        options: optionList
                    },
                    base.options
                )
             ).insertAfter(base.$el);
        };

        function initShowDropdownButton() {
            base.selectButton.button({
                text: true,
                icons: {
                    secondary: "ui-icon-triangle-1-s"
                }
            })
			.click(function () {
			    base.dropdown.toggle();
			    return false;
			});
        }

        function setItemsHover() {
            base.generated.find('.prettybox-item').hover(
                function () {
                    $(this).addClass('ui-state-focus');
                },
                function () {
                    $(this).removeClass('ui-state-focus');
                }
            );
        }

        function getItemIndex(itemId) {
            return itemId.match(/\_(\d+)\_(dropdown_item|selected_item)$/)[1]
        }

        function refreshAllEmptyMessages() {
            refreshEmptyMessage(base.dropdown, base.dropdownEmptyMessage);
            refreshEmptyMessage(base.prettybox, base.prettyboxEmptyMessage);
        }

        function refreshEmptyMessage(area, message) {
            if (area.find('.item-on').length == 0) {
                message.show();
            }
            else {
                message.hide();
            }
        }

        function showItem(item) {
            item.removeClass('item-off').addClass('item-on').show();
        }

        function hideItem(item) {
            item.removeClass('item-on').addClass('item-off').hide();
        }

        function addItem() {
            var selfId = $(this).attr('id');
            var opositeId = selfId.replace(/dropdown_item$/g, 'selected_item');
            var boxItem = $('#' + opositeId);
            showItem(boxItem);
            hideItem($(this));
            base.el.options[getItemIndex(selfId)].selected = true;
            refreshAllEmptyMessages();
        }

        function removeItem() {
            var selfId = $(this).attr('id');
            var opositeId = selfId.replace(/selected_item$/g, 'dropdown_item');
            showItem($('#' + opositeId));
            hideItem($(this));
            base.el.options[getItemIndex(selfId)].selected = false;
            refreshAllEmptyMessages();
        }

        function initCloseDropdownOnOuterClick() {
            //stopPropagation to hide dropdown by click in page other place
            $('html').click(function () {
                base.dropdown.hide();
            });

            base.dropdown.find('.prettybox-item').click(function (event) {
                event.stopPropagation();
            });
            base.selectButton.click(function (event) {
                event.stopPropagation();
            });

            base.selectButton.click(function () {
                $('.prettybox-dropdown').each(function () {
                    if ($(this).attr('id') != base.dropdown.attr('id')) {
                        $(this).hide();
                    }
                });
            });
        }


        base.init = function () {
            base.options = $.extend({}, $.prettybox.defaultOptions, options);
            if (base.options.hideSelect)
                base.$el.hide();
            render();

            base.prettybox = base.$el.parent().find('#' + base.elId + '_prettybox');
            base.prettyboxItemsBox = base.prettybox.find('.items-box');
            base.dropdown = base.$el.parent().find('#' + base.elId + '_prettybox_dropdown');
            base.prettyboxEmptyMessage = base.prettybox.find('#' + base.elId + '_box_empty_message');
            base.dropdownEmptyMessage = base.dropdown.find('#' + base.elId + '_dropdown_empty_message');
            base.selectButton = base.prettybox.find('#' + base.elId + '_select_button');
            base.initBoxWidth = base.prettybox.width();
            initShowDropdownButton();
            if (base.options.closeDropdownOnOuterClick) {
                initCloseDropdownOnOuterClick();
            }
            setItemsHover();
            refreshAllEmptyMessages();
            base.prettybox.find('.prettybox-item').click(removeItem);
            base.dropdown.find('.prettybox-item').click(addItem);
        };

        // Run initializer
        base.init();
    };

    function compileDefaultTemplate() {
        var prettyBoxMarkup =
'<div class="prettybox-wrapper">\
<div id="{{= parent_id}}_prettybox" class="prettybox ui-widget" {{if boxMinWidth}}style="min-width:${boxMinWidth}"{{/if}}>\
    <div class="prettybox-content ui-widget-content ui-corner-all">\
        <h3 class="prettybox-title ui-widget-header ui-corner-all">{{= boxTitle }}</h3>\
        <div class="items-box ui-helper-clearfix" >\
            <div id="{{= parent_id}}_box_empty_message" class="box_empty_message" style="display:none">{{= boxEmptyMessage}}</div>\
            {{each(i,opt) options}}\
                <div id="{{= parent_id}}_${i}_selected_item" class="prettybox-item ui-widget ui-corner-all ui-widget-content ui-helper-clearfix {{if selected}} item-on {{else}} item-off {{/if}}">\
                    <ul class="ui-helper-reset">\
                        <li class="item-name">${ opt.text }</li>\
                        <li class="item-icon">\
                            <span class="ui-icon ui-icon-circle-minus"></span>\
                        </li>\
                    </ul>\
                </div>\
            {{/each}}\
        </div>\
        <div class="prettybox-footer ui-helper-clearfix">\
            <button id="{{= parent_id}}_select_button" class="prettybox-select-button box-button-color">${selectButtonCaption}</button>\
        </div>\
    </div>\
</div>\
<div id="{{= parent_id}}_prettybox_dropdown" class="prettybox-dropdown ui-widget" style="display:none;{{if dropdownWidth}}width:${dropdownWidth}{{/if}}">\
    <div class="prettybox-content ui-widget-content ui-corner-bottom">\
        <div class="items-box ui-helper-clearfix">\
            <div id="{{= parent_id}}_dropdown_empty_message" class="dropdown-empty-message" style="display:none">{{= dropdownEmptyMessage}}</div>\
            {{each(i,opt) options}}\
                <div id="{{= parent_id}}_${ i }_dropdown_item" class="prettybox-item ui-widget ui-corner-all ui-widget-content {{if selected}} item-off {{else}} item-on {{/if}}">\
                    <ul class="ui-helper-reset">\
                        <li class="item-name">${ opt.text }</li>\
                        <li class="item-icon">\
                            <span class="ui-icon ui-icon-circle-plus"></span>\
                        </li>\
                    </ul>\
                </div>\
            {{/each}}\
        </div>\
    </div>\
</div>\
</div>';
        // Compile the markup as a named template
        $.template("prettyBoxTemplate", prettyBoxMarkup.replace(/([>}])\s+([<{])/g, '$1$2'));
    }
    compileDefaultTemplate();

    $.prettybox.defaultOptions = {
        prettyBoxTemplateName: 'prettyBoxTemplate', // jquery.tmpl compiled template name which uses to render box
        hideSelect: true,                           // hide initial select html element
        boxTitle: 'No title',                       // box title
        boxEmptyMessage: 'Nothing selected',        // message for empty box   
        dropdownEmptyMessage: 'Nothing to select',  // message for empty dropdown
        selectButtonCaption: 'Select',              // box select button caption
        closeDropdownOnOuterClick: true,            // close dropdown by clicking out of box (html.click() subscription)
        boxMinWidth: '200px', 
        dropdownWidth: '300px'
     };

    $.fn.prettybox = function (options) {
        return this.each(function () {
            (new $.prettybox(this, options));
        });
    };

})(jQuery);