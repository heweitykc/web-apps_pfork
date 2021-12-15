/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
/**
 *  Mixtbar.js
 *
 *  Combined component for toolbar's and header's elements
 *
 *
 *  Created by Maxim.Kadushkin on 4/11/2017.
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    'common/main/lib/component/BaseView'
], function (Backbone) {
    'use strict';

    Common.UI.Mixtbar = Common.UI.BaseView.extend((function () {
        var $boxTabs;
        var $scrollL;
        var optsFold = {timeout: 2000};
        var config = {};
        var btnsMore = [];

        var onScrollTabs = function(opts, e) {
            var sv = $boxTabs.scrollLeft();
            if ( sv || opts == 'right' ) {
                $boxTabs.animate({scrollLeft: opts == 'left' ? sv - 100 : sv + 100}, 200);
            }
        };

        function onTabDblclick(e) {
            var tab = $(e.currentTarget).find('> a[data-tab]').data('tab');
            if ( this.dblclick_el == tab ) {
                this.fireEvent('change:compact', [tab]);
                this.dblclick_el = undefined;
            }
        }

        function onShowFullviewPanel(state) {
            if ( state )
                optsFold.$bar.addClass('cover'); else
                optsFold.$bar.removeClass('cover');
        }

        function onClickDocument(e) {
            if ( this.isFolded ) {
                if ( $(e.target).parents('.toolbar, #file-menu-panel').length ){
                } else {
                    optsFold.$bar && optsFold.$bar.hasClass('expanded') && this.collapse();
                }
            }
        }

        return {
            $tabs: undefined,
            $panels: undefined,
            isFolded: false,

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                var _template_tabs =
                    '<section class="tabs">' +
                        '<a class="scroll left" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="V"></a>' +
                        '<ul>' +
                            '<% for(var i in items) { %>' +
                                '<% if (typeof items[i] == "object") { %>' +
                                '<li class="ribtab' +
                                        '<% if (items[i].haspanel===false) print(" x-lone") %>' +
                                        '<% if (items[i].extcls) print(\' \' + items[i].extcls) %>"' +
                                        '<% if (typeof items[i].layoutname == "string") print(" data-layout-name=" + \' \' +  items[i].layoutname) + \' \' %>>' +
                                    '<a data-tab="<%= items[i].action %>" data-title="<%= items[i].caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof items[i].dataHintTitle !== "undefined") { %> data-hint-title="<%= items[i].dataHintTitle %>" <% } %>><%= items[i].caption %></a>' +
                                '</li>' +
                                '<% } %>' +
                            '<% } %>' +
                        '</ul>' +
                        '<a class="scroll right" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="R"></a>' +
                    '</section>';

                this.$layout = $(options.template({
                    tabsmarkup: _.template(_template_tabs)({items: options.tabs})
                }));

                config.tabs = options.tabs;
                $(document.body).on('click', onClickDocument.bind(this));

                Common.NotificationCenter.on('tab:visible', _.bind(function(action, visible){
                    this.setVisible(action, visible);
                }, this));
            },

            afterRender: function() {
                var me = this;

                $boxTabs = me.$('.tabs > ul');
                me.$tabs = $boxTabs.find('> li');
                me.$boxpanels = me.$('.box-panels');
                me.$panels = me.$boxpanels.find('> .panel');

                optsFold.$bar = me.$('.toolbar');
                var $scrollR = me.$('.tabs .scroll.right');
                $scrollL = me.$('.tabs .scroll.left');

                $scrollL.on('click', onScrollTabs.bind(this, 'left'));
                $scrollR.on('click', onScrollTabs.bind(this, 'right'));

                $boxTabs.on('dblclick', '> .ribtab', onTabDblclick.bind(this));
                $boxTabs.on('click', '> .ribtab', me.onTabClick.bind(this));
            },

            isTabActive: function(tag) {
                var t = this.$tabs.filter('.active').find('> a');
                return t.length && t.data('tab') == tag;
            },

            setFolded: function(value) {
                this.isFolded = value;

                var me = this;
                if ( this.isFolded ) {
                    if (!optsFold.$box) optsFold.$box = me.$el.find('.box-controls');

                    optsFold.$bar.addClass('folded z-clear').toggleClass('expanded', false);
                    optsFold.$bar.find('.tabs .ribtab').removeClass('active');
                    optsFold.$bar.on($.support.transition.end, function (e) {
                        if ( optsFold.$bar.hasClass('folded') && !optsFold.$bar.hasClass('expanded') )
                            optsFold.$bar.toggleClass('z-clear', true);
                    });
                    optsFold.$box.on({
                        mouseleave: function (e) {
                            // optsFold.timer = setTimeout( function(e) {
                            //     clearTimeout(optsFold.timer);
                            //     me.collapse();
                            // }, optsFold.timeout);
                        },
                        mouseenter: function (e) {
                            // clearTimeout(optsFold.timer);
                        }
                    });

                    // $(document.body).on('focus', 'input, textarea', function(e) {
                    // });
                    //
                    // $(document.body).on('blur', 'input, textarea', function(e) {
                    // });
                    //
                    // Common.NotificationCenter.on({
                    //     'modal:show': function(){
                    //     },
                    //     'modal:close': function(dlg) {
                    //     },
                    //     'modal:hide': function(dlg) {
                    //     },
                    //     'dataview:focus': function(e){
                    //     },
                    //     'dataview:blur': function(e){
                    //     },
                    //     'menu:show': function(e){
                    //     },
                    //     'menu:hide': function(e){
                    //     },
                    //     'edit:complete': _.bind(me.onEditComplete, me)
                    // });

                } else {
                    // clearTimeout(optsFold.timer);
                    optsFold.$bar.removeClass('folded z-clear');
                    optsFold.$box.off();

                    var active_panel = optsFold.$box.find('.panel.active');
                    if ( active_panel.length ) {
                        var tab = active_panel.data('tab');
                        me.$tabs.find('> a[data-tab=' + tab + ']').parent().toggleClass('active', true);
                    } else {
                        tab = me.$tabs.siblings(':not(.x-lone):visible').first().find('> a[data-tab]').data('tab');
                        me.setTab(tab);
                    }
                }
            },

            collapse: function() {
                Common.UI.Menu.Manager.hideAll();
                // clearTimeout(optsFold.timer);

                if ( this.isFolded && optsFold.$bar ) {
                    optsFold.$bar.removeClass('expanded');
                    optsFold.$bar.find('.tabs .ribtab').removeClass('active');
                }
            },

            expand: function() {
                // clearTimeout(optsFold.timer);

                optsFold.$bar.removeClass('z-clear');
                optsFold.$bar.addClass('expanded');
                // optsFold.timer = setTimeout(this.collapse, optsFold.timeout);
            },

            onResize: function(e) {
                if ( this.hasTabInvisible() ) {
                    if ( !$boxTabs.parent().hasClass('short') )
                        $boxTabs.parent().addClass('short');
                } else
                if ( $boxTabs.parent().hasClass('short') ) {
                    $boxTabs.parent().removeClass('short');
                }

                this.processPanelVisible();
                // this.resizeToolbar();
            },

            onTabClick: function (e) {
                var me = this;
                var $target = $(e.currentTarget);
                var tab = $target.find('> a[data-tab]').data('tab');
                if ($target.hasClass('x-lone')) {
                    me.isFolded && me.collapse();
                } else {
                    if ( $target.hasClass('active') ) {
                        if (!me._timerSetTab) {
                            me.dblclick_el = tab;
                            if ( me.isFolded ) {
                                me.collapse();
                                setTimeout(function(){
                                    me.dblclick_el = undefined;
                                }, 500);
                            }
                        }
                    } else {
                        me._timerSetTab = true;
                        setTimeout(function(){
                            me._timerSetTab = false;
                        }, 500);
                        me.setTab(tab);
                        me.processPanelVisible(null, true);
                        if ( !me.isFolded ) {
                            if ( me.dblclick_timer ) clearTimeout(me.dblclick_timer);
                            me.dblclick_timer = setTimeout(function () {
                                me.dblclick_el = tab;
                                delete me.dblclick_timer;
                            },500);
                        } else
                            me.dblclick_el = tab;
                    }
                }
            },

            setTab: function (tab) {
                var me = this;
                if ( !tab ) {
                    // onShowFullviewPanel.call(this, false);

                    if ( this.isFolded ) { this.collapse(); }
                    else tab = this.lastPanel;
                }

                if ( tab ) {
                    me.$tabs.removeClass('active');
                    me.$panels.removeClass('active');
                    me.hideMoreBtns();

                    var panel = this.$panels.filter('[data-tab=' + tab + ']');
                    if ( panel.length ) {
                        this.lastPanel = tab;
                        panel.addClass('active');
                        me.setMoreButton(tab, panel);
                    }

                    if ( panel.length ) {
                        if ( me.isFolded ) me.expand();
                    } else {
                        // onShowFullviewPanel.call(this, true);
                        if ( me.isFolded ) me.collapse();
                    }

                    var $tp = this.$tabs.find('> a[data-tab=' + tab + ']').parent();
                    if ( $tp.length ) {
                        $tp.addClass('active');
                    }

                    this.fireEvent('tab:active', [tab]);
                }
            },

            addTab: function (tab, panel, after) {
                function _get_tab_action(index) {
                    if (!config.tabs[index])
                        return _get_tab_action(--index);

                    return config.tabs[index].action;
                }

                var _tabTemplate = _.template('<li class="ribtab" style="display: none;" <% if (typeof layoutname == "string") print(" data-layout-name=" + \' \' +  layoutname) + \' \' %>><a data-tab="<%= action %>" data-title="<%= caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof dataHintTitle !== "undefined") { %> data-hint-title="<%= dataHintTitle %>" <% } %> ><%= caption %></a></li>');

                config.tabs[after + 1] = tab;
                var _after_action = _get_tab_action(after);

                var _elements = this.$tabs || this.$layout.find('.tabs');
                var $target = _elements.find('a[data-tab=' + _after_action + ']');
                if ( $target.length ) {
                    $target.parent().after( _tabTemplate(tab) );

                    if (panel) {
                        _elements = this.$panels || this.$layout.find('.box-panels > .panel');
                        $target = _elements.filter('[data-tab=' + _after_action + ']');

                        if ($target.length) {
                            $target.after(panel);
                        } else {
                            panel.appendTo(this.$layout.find('.box-panels'));
                        }
                    }

                    // synchronize matched elements
                    this.$tabs && (this.$tabs = $boxTabs.find('> li'));
                    this.$panels && (this.$panels = this.$el.find('.box-panels > .panel'));
                }
            },

            isCompact: function () {
                return this.isFolded;
            },

            hasTabInvisible: function() {
                if ($boxTabs.length<1) return false;

                var _left_bound_ = Math.round($boxTabs.offset().left),
                    _right_bound_ = Math.round(_left_bound_ + $boxTabs.width());

                var tab = this.$tabs.filter(':visible:first').get(0);
                if ( !tab ) return false;

                var rect = tab.getBoundingClientRect();

                if ( !(Math.round(rect.left) < _left_bound_) ) {
                    tab = this.$tabs.filter(':visible:last').get(0);
                    rect = tab.getBoundingClientRect();

                    if (!(Math.round(rect.right) > _right_bound_))
                        return false;
                }

                return true;
            },

            /**
             * in case panel partly visible.
             * hide button's caption to decrease panel width
             * ##adopt-panel-width
            **/
            processPanelVisible: function(panel, now) {
                var me = this;
                if ( me._timer_id ) clearTimeout(me._timer_id);

                function _fc() {
                    var $active = panel || me.$panels.filter('.active');
                    if ( $active && $active.length ) {
                        var _maxright = $active.parents('.box-controls').width();
                        var data = $active.data(),
                            _rightedge = data.rightedge,
                            _btns = data.buttons,
                            _flex = data.flex;

                        if ( !_rightedge ) {
                            _rightedge = $active.get(0).getBoundingClientRect().right;
                        }
                        if ( !_btns ) {
                            _btns = [];
                            _.each($active.find('.btn-slot .x-huge'), function(item) {
                                _btns.push($(item).closest('.btn-slot'));
                            });
                            data.buttons = _btns;
                        }
                        if (!_flex) {
                            _flex = [];
                            _.each($active.find('.group.flex'), function(item) {
                                var el = $(item);
                                _flex.push({el: el, width: el.attr('data-group-width') || el.attr('max-width')}); //save flex element and it's initial width
                            });
                            data.flex = _flex;
                        }

                        if ( _rightedge > _maxright) {
                            if (_flex.length>0) {
                                for (var i=0; i<_flex.length; i++) {
                                    var item = _flex[i].el;
                                    if (item.outerWidth() > parseInt(item.css('min-width')))
                                        return;
                                    else
                                        item.css('width', item.css('min-width'));
                                }
                            }
                            for (var i=_btns.length-1; i>=0; i--) {
                                var btn = _btns[i];
                                if ( !btn.hasClass('compactwidth') ) {
                                    btn.addClass('compactwidth');
                                    _rightedge = $active.get(0).getBoundingClientRect().right;
                                    if (_rightedge <= _maxright)
                                        break;
                                }
                            }
                            data.rightedge = _rightedge;
                        } else {
                            for (var i=0; i<_btns.length; i++) {
                                var btn = _btns[i];
                                if ( btn.hasClass('compactwidth') ) {
                                    btn.removeClass('compactwidth');
                                    _rightedge = $active.get(0).getBoundingClientRect().right;
                                    if ( _rightedge > _maxright) {
                                        btn.addClass('compactwidth');
                                        _rightedge = $active.get(0).getBoundingClientRect().right;
                                        break;
                                    }
                                }
                            }
                            data.rightedge = _rightedge;
                            if (_flex.length>0 && $active.find('.btn-slot.compactwidth').length<1) {
                                for (var i=0; i<_flex.length; i++) {
                                    var item = _flex[i];
                                    item.el.css('width', item.width);
                                }
                            }
                        }
                    }
                    me.resizeToolbar();
                };

                if ( now === true ) _fc(); else
                me._timer_id =  setTimeout(function() {
                    delete me._timer_id;
                    _fc();
                }, 100);
            },
            /**/

            setExtra: function (place, el) {
                if ( !!el ) {
                    if (this.$tabs) {
                    } else {
                        if (place == 'right') {
                            this.$layout.find('.extra.right').html(el);
                        } else if (place == 'left') {
                            this.$layout.find('.extra.left').html(el);
                        }
                    }
                }
            },

            setVisible: function (tab, visible) {
                if ( tab && this.$tabs ) {
                    this.$tabs.find('> a[data-tab=' + tab + ']').parent().css('display', visible ? '' : 'none');
                    this.onResize();
                }
            },

            setMoreButton: function(tab, panel) {
                if (!btnsMore[tab]) {
                    var box = $('<div class="more-box" style="position: absolute;right: 0; padding-left: 12px;display: none;">' +
                        '<div class="separator long" style="position: relative;display: table-cell;"></div>' +
                        '<div class="group" style=""><span class="btn-slot text x-huge slot-btn-more"></span></div>' +
                        '</div>');
                    panel.append(box);
                    btnsMore[tab] = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top dropdown-manual',
                        caption: 'More',
                        iconCls: 'btn-insertchart',
                        enableToggle: true
                    });
                    btnsMore[tab].render(box.find('.slot-btn-more'));
                    btnsMore[tab].on('toggle', function(btn, state, e) {
                        Common.NotificationCenter.trigger('more:toggle', btn, state);
                    });
                    var moreContainer = $('<div class="dropdown-menu more-container" style="min-width:auto; padding: 5px 10px; background: #f1f1f1; border-radius: 0;z-index:999;"><div style="display: inline;"></div></div>');
                    optsFold.$bar.append(moreContainer);
                    btnsMore[tab].panel = moreContainer.find('div');
                }
                this.$moreBar = btnsMore[tab].panel;
                this.resizeToolbar(true);
            },

            resizeToolbar: function(reset) {
                var activePanel = this.$panels.filter('.active'),
                    more_section = activePanel.find('.more-box'),
                    more_section_width = parseInt(more_section.css('width')) || 0,
                    boxpanels_offset = this.$boxpanels.offset(),
                    boxpanels_width = this.$boxpanels.width(),
                    delta = (this._prevBoxWidth) ? (boxpanels_width - this._prevBoxWidth) : -1;
                this._prevBoxWidth = boxpanels_width;
                more_section.is(':visible') && (boxpanels_width -= more_section_width);

                var boxpanels_right = boxpanels_offset.left + boxpanels_width;

                if (this.$moreBar && this.$moreBar.parent().is(':visible')) {
                    this.$moreBar.parent().css('max-width', Common.Utils.innerWidth());
                }

                if ((reset || delta<0) && activePanel.width() > boxpanels_width) {
                    if (!more_section.is(':visible')) {
                        more_section.css('display', "");
                        boxpanels_width = this.$boxpanels.width() - parseInt(more_section.css('width'));
                        boxpanels_right = boxpanels_offset.left + boxpanels_width;
                    }

                    var last_separator = null,
                        last_group = null,
                        prevchild = this.$moreBar.children();
                    if (prevchild.length>0) {
                        prevchild = $(prevchild[0]);
                        if (prevchild.hasClass('separator'))
                            last_separator = prevchild;
                        if (prevchild.hasClass('group') && prevchild.attr('group-state') == 'open')
                            last_group = prevchild;
                    }

                    var items = activePanel.find('> div:not(.more-box)');
                    var need_break = false;
                    for (var i=items.length-1; i>=0; i--) {
                        var item = $(items[i]);
                        if (item.hasClass('group')) {
                            var offset = item.offset(),
                                item_width = item.width(),
                                children = item.children();
                            if (!item.attr('inner-width') && item.attr('group-state') !== 'open') {
                                item.attr('inner-width', item_width);
                                for (var j=children.length-1; j>=0; j--) {
                                    var child = $(children[j]);
                                    child.attr('inner-width', child.width());
                                }
                            }
                            if ((offset.left > boxpanels_right || children.length==1) && item.attr('group-state') != 'open') {
                                // move group
                                this.$moreBar.prepend(item);
                                if (last_separator) {
                                    last_separator.css('display', '');
                                }
                            } else if ( offset.left+item_width > boxpanels_right ) {
                                // move buttons from group
                                for (var j=children.length-1; j>=0; j--) {
                                    var child = $(children[j]);
                                    if (child.hasClass('.elset')) {
                                        this.$moreBar.prepend(item);
                                        if (last_separator) {
                                            last_separator.css('display', '');
                                        }
                                        break;
                                    } else {
                                        var child_offset = child.offset(),
                                            child_width = child.width();
                                        if (child_offset.left+child_width>boxpanels_right) {
                                            if (!last_group) {
                                                last_group = $('<div class="group"></div>');
                                                this.$moreBar.prepend(last_group);
                                                if (last_separator) {
                                                    last_separator.css('display', '');
                                                }
                                            }
                                            last_group.prepend(child);
                                        } else {
                                            need_break = true;
                                            break;
                                        }
                                    }
                                }
                                if (item.children().length<1) { // all buttons are moved
                                    item.remove();
                                    last_group && last_group.removeAttr('group-state').attr('inner-width', item.attr('inner-width'));
                                    last_group = null;
                                } else {
                                    last_group && last_group.attr('group-state', 'open') && item.attr('group-state', 'open');
                                }
                                if (need_break)
                                    break;
                            } else {
                                break;
                            }
                            last_separator = null;
                        } else if (item.hasClass('separator')) {
                            this.$moreBar.prepend(item);
                            item.css('display', 'none');
                            last_separator = item;
                        }
                    }
                } else if ((reset || delta>0) && more_section.is(':visible')) {
                    var last_separator = null,
                        last_group = null,
                        prevchild = activePanel.find('> div:not(.more-box)');
                    var last_width = 0;
                    if (prevchild.length>0) {
                        prevchild = $(prevchild[prevchild.length-1]);
                        if (prevchild.hasClass('separator')) {
                            last_separator = prevchild;
                            last_width = 13;
                        }
                        if (prevchild.hasClass('group') && prevchild.attr('group-state') == 'open')
                            last_group = prevchild;
                    }

                    var items = this.$moreBar.children();
                    var active_width = activePanel.width();

                    if (items.length>0) {
                        // from more panel to toolbar
                        for (var i=0; i<items.length; i++) {
                            var item = $(items[i]);
                            active_width = activePanel.width();
                            if (item.hasClass('group')) {
                                var islast = false;
                                if (this.$moreBar.children().filter('.group').length == 1) {
                                    boxpanels_width = this.$boxpanels.width();
                                    islast = true;
                                }

                                var item_width = parseInt(item.attr('inner-width') || 0);
                                if (active_width + last_width + item_width < boxpanels_width && item.attr('group-state') != 'open') {
                                    // move group
                                    more_section.before(item);
                                    if (last_separator) {
                                        last_separator.css('display', '');
                                    }
                                    if (this.$moreBar.children().filter('.group').length == 0) {
                                        this.hideMoreBtns();
                                        more_section.css('display', "none");
                                    }
                                } else if ( active_width + last_width < boxpanels_width ) {
                                    // move buttons from group
                                    var children = item.children();
                                    boxpanels_width = this.$boxpanels.width() - more_section_width;
                                    for (var j=0; j<children.length; j++) {
                                        if (islast && j==children.length-1)
                                            boxpanels_width = this.$boxpanels.width();
                                        active_width = activePanel.width();
                                        var child = $(children[j]);
                                        if (child.hasClass('.elset')) { // don't add group - no enough space
                                            break;
                                        } else {
                                            var child_width = parseInt(child.attr('inner-width') || 0) + (!last_group ? 12 : 0);
                                            if (active_width+last_width+child_width<boxpanels_width) {
                                                if (!last_group) {
                                                    last_group = $('<div class="group"></div>');
                                                    more_section.before(last_group);
                                                    if (last_separator) {
                                                        last_separator.css('display', '');
                                                    }
                                                }
                                                last_group.append(child);
                                            } else {
                                                need_break = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (item.children().length<1) { // all buttons are moved
                                        item.remove();
                                        last_group && last_group.removeAttr('group-state').attr('inner-width', item.attr('inner-width'));
                                        last_group = null;
                                        if (this.$moreBar.children().filter('.group').length == 0) {
                                            this.hideMoreBtns();
                                            more_section.css('display', "none");
                                        }
                                    } else {
                                        last_group && last_group.attr('group-state', 'open') && item.attr('group-state', 'open');
                                    }
                                    if (need_break)
                                        break;
                                } else {
                                    break;
                                }
                                last_separator = null; last_width = 0;
                            } else if (item.hasClass('separator')) {
                                more_section.before(item);
                                item.css('display', 'none');
                                last_separator = item;
                                last_width = 13;
                            }
                        }
                    } else {
                        this.hideMoreBtns();
                        more_section.css('display', "none");
                    }
                }
            },

            hideMoreBtns: function() {
                for (var btn in btnsMore) {
                    btnsMore[btn] && btnsMore[btn].toggle(false);
                }
            }
        };
    }()));
});
