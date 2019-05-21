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
 *  Collaboration.js
 *  Document Editor
 *
 *  Created by Julia Svinareva on 14/5/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/mobile/app/template/Collaboration.template',
    'jquery',
    'underscore',
    'backbone'
], function (settingsTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.Collaboration = Backbone.View.extend(_.extend((function() {
        // private

        return {

            template: _.template(settingsTemplate),

            events: {
                //
            },

            initialize: function() {
                Common.NotificationCenter.on('collaborationcontainer:show', _.bind(this.initEvents, this));
                this.on('page:show', _.bind(this.updateItemHandlers, this));
            },

            initEvents: function () {
                var me = this;

                Common.Utils.addScrollIfNeed('.view[data-page=collaboration-root-view] .pages', '.view[data-page=collaboration-root-view] .page');
                me.updateItemHandlers();
            },

            initControls: function() {
                //
            },

            // Render layout
            render: function() {
                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    orthography: Common.SharedSettings.get('sailfish'),
                    scope   : this
                }));

                return this;
            },

            updateItemHandlers: function () {
                var selectorsDynamicPage = [
                    '.page[data-page=collaboration-root-view]',
                    '.page[data-page=reviewing-settings-view]'
                ].map(function (selector) {
                    return selector + ' a.item-link[data-page]';
                }).join(', ');

                $(selectorsDynamicPage).single('click', _.bind(this.onItemClick, this));
            },

            onItemClick: function (e) {
                var $target = $(e.currentTarget),
                    page = $target.data('page');

                if (page && page.length > 0 ) {
                    this.showPage(page);
                }
            },

            rootLayout: function () {
                if (this.layout) {
                    var $layour = this.layout.find('#collaboration-root-view'),
                        isPhone = Common.SharedSettings.get('phone');

                    return $layour.html();
                }

                return '';
            },

            showPage: function(templateId, suspendEvent) {
                var rootView = DE.getController('Collaboration').rootView();

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);

                    // Android fix for navigation
                    if (Framework7.prototype.device.android) {
                        $content.find('.page').append($content.find('.navbar'));
                    }

                    rootView.router.load({
                        content: $content.html()
                    });

                    if (suspendEvent !== true) {
                        this.fireEvent('page:show', [this, templateId]);
                    }
                }
            },




            textCollaboration: 'Collaboration',
            textReviewing: 'Review',
            textСomments: 'Сomments',
            textBack: 'Back',
            textReview: 'Track Changes',
            textAcceptAllChanges: 'Accept All Changes',
            textRejectAllChanges: 'Reject All Changes',
            textDisplayMode: 'Display Mode',
            textMarkup: 'Markup',
            textFinal: 'Final',
            textOriginal: 'Original',
            textChange: 'Change'

        }
    })(), DE.Views.Collaboration || {}))
});