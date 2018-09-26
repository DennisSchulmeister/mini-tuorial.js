/*
 * mini-tutorial.js (https://www.wpvs.de/mini-tutorial/)
 * © 2018  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */
"use strict";

import utils from "./utils.js";

/**
 * This tiny class controls our web application.
 */
export default class MiniTutorial {
    /**
     * Yeah! The construktor.
     */
    constructor() {
        this.body = document.querySelector("body");
        this.sections = document.querySelectorAll("section");
        this.nav = document.querySelector("nav");

        this.index = 0;
        this.amount = 0;
        this.titlePrefix = document.title;

        window.addEventListener("click", event => this._onLinkClicked(event));
        window.addEventListener("popstate", event => this._onHistoryChanged(event));
        window.addEventListener("keyup", event => this._handleKeyUpEvent(event));
    }

    /**
     * Call this method in a window load event handler, in order to start
     * the application. Like this:
     *
     *   window.addEventListener("load", () => {
     *       let mt = new MiniTutorial();
     *       mt.start();
     *   });
     */
    start() {
        this._gobbleWhitespace();
        this._countSections();
        this._hideAllSections();
        this._insertHeadings();
        this._buildTOC();

        let index = location.hash.slice(1);
        index = parseInt(index);

        if (isNaN(index)) index = 1;
        this._showSection(index);
    }

    /**
     * Eat leading whitespace for all elements with data-gobble attribute.
     * This helps to insert code examples into the page.
     */
    _gobbleWhitespace() {
        let _gobble = (element, leading) => {
            element.innerHTML = utils.removeLeadingLinebreaks(element.innerHTML);
            element.innerHTML = utils.removeTrailingLinebreaks(element.innerHTML);
            element.innerHTML = utils.shiftLinesLeft(element.innerHTML);
            element.innerHTML = utils.shiftLinesLeft(element.innerHTML);
            element.innerHTML = utils.removeTrailingLinebreaks(element.innerHTML);
        };

        document.querySelectorAll("pre[data-gobble]").forEach(_gobble);
        document.querySelectorAll("code[data-gobble]").forEach(_gobble);
        document.querySelectorAll("[data-gobble]").forEach(_gobble);
    }

    /**
     * Assigns each <section> its index with dataset.index, starting with
     * index 1. Also sets this.amount with the maximum allowed index.
     */
    _countSections() {
        this.amount = 0;

        this.sections.forEach(section => {
            if (section.id === "toc") return;
            if (section.dataset.chapter != null) return;
            section.dataset.index = ++this.amount;
        });
    }

    /**
     * Hide all <section> except the one with id="toc", which is the
     * Table of Contents. This simply adds the CSS class "hidden" to
     * each <section>.
     */
    _hideAllSections() {
        this.sections.forEach(section => {
            if (section.id === "toc") return;
            section.classList.add("hidden");
        });
    }

    /**
     * Hide all <section> and show the one with the given index, instead.
     * The index always starts at 1, since index 0 is the Table of Contents,
     * which should always be visible.
     *
     * @param {int} index <section> to be shown, starting at 1
     */
    _showSection(index) {
        // Check index
        index = Math.max(Math.min(index, this.amount), 1);

        // Push new entry to the browser's navigation history
        this._pushNavigationHistory(index, this.index);
        this.index = index;

        // Show requested <section>
        this._hideAllSections();

        let section = document.querySelector(`section[data-index="${index}"]`);
        if (!section) return;
        section.classList.remove("hidden");

        // Reset window scroll bars
        window.scrollTo(0, 0);

        // Update window title
        if (section.dataset.title) {
            document.title = `${this.titlePrefix} – ${section.dataset.title}`;
        } else {
            document.title = this.titlePrefix;
        }

        // Highlight current <section> in the Table of Contents
        document.querySelectorAll("#toc li a").forEach(link => link.classList.remove("active"));
        let link = document.querySelector(`#toc li[data-index="${index}"] a`);
        if (link) link.classList.add("active");

        // Update navigation links
        this.nav.innerHTML = "";
        let link_prev = document.createElement("a");
        let link_next = document.createElement("a");

        this.nav.appendChild(link_prev);
        this.nav.appendChild(link_next);

        if (index > 1) {
            let sectionPrev = document.querySelector(`section[data-index="${index - 1}"]`);

            if (sectionPrev && sectionPrev.dataset.title) {
                link_prev.textContent = sectionPrev.dataset.title;
                link_prev.href = "#" + (index - 1);
            }
        }

        if (index < this.amount) {
            let sectionNext = document.querySelector(`section[data-index="${index + 1}"]`);

            if (sectionNext && sectionNext.dataset.title) {
                link_next.textContent = sectionNext.dataset.title;
                link_next.href = "#" + (index + 1);
            }
        }

        // Show <body> in case it is still invisible. This prevents flickering
        // all <section> at the initial page load.
        this.body.classList.remove("hidden");
    }

    /**
     * Place an <h2> heading at the beginning of each <section>, except for
     * the Table of Contents, which gets an <h3> heading. The heading is taken
     * from the data-title attribute of each <section>.
     */
    _insertHeadings() {
        this.sections.forEach(section => {
            let title = section.dataset.title;
            if (title === undefined) return;
            if (section.id === "toc") return

            let headingType = "h2";
            if (section.id === "toc") headingType = "h3";

            let heading = document.createElement(headingType);
            heading.textContent = title;
            section.insertBefore(heading, section.childNodes[0]);
        });
    }

    /**
     * Build Table of Contents
     */
    _buildTOC() {
        let sectionToc = document.getElementById("toc");
        if (!sectionToc) return;

        let tocElements = [];
        let index = 0;
        let list = null;

        this.sections.forEach(section => {
            let title = section.dataset.title;
            if (title === undefined) return;

            if (section.dataset.chapter != null) {
                let heading = document.createElement("h3");
                heading.textContent = section.dataset.title;
                tocElements.push(heading);

                list = null;
                return;
            } else if (!section.dataset.index) {
                return;
            }

            if (!list) {
                list = document.createElement("ol");
                tocElements.push(list);
            }

            let link = document.createElement("a");
            link.textContent = title;
            link.href = "#" + section.dataset.index;

            let listItem = document.createElement("li");
            listItem.dataset.index = section.dataset.index;
            listItem.appendChild(link);
            list.appendChild(listItem);
        });

        tocElements.forEach(element => sectionToc.appendChild(element));
    }

    /**
     * Event handler for clicked <a> elements. This switches the currently
     * visible <section> if the link starts with a hash-tag. e.g. #1 or #42.
     * All other links will be ignored and work as normal.
     *
     * @param {DOMEvent} event Captured click event
     */
    _onLinkClicked(event) {
        let target = event.target;
        while (target && target.nodeName != "A") target = target.parentNode;
        if (!target || target.nodeName != "A") return;

        let href = target.getAttribute("href");
        if (href === null || !href.startsWith("#")) return;

        let index = target.hash.slice(1);
        if (!index.length) return;

        index = parseInt(index);
        if (index === NaN) return;

        event.preventDefault();
        this._showSection(index);
    }

    /**
     * Switch visible <section> when the user presses the browser's back
     * button. This is working, since the methode this._pushNavigationHistory()
     * is called, as soon as the visible <section> is switched.
     *
     * @param {DOMEvent} event Captured popstate event
     */
    _onHistoryChanged(event) {
        let index = 1;

        if (event.state) {
            let state = JSON.parse(event.state)
            index = state.index;
        } else {
            index = location.hash.slice(1);
        }

        index = parseInt(index);
        if (isNaN(index)) return;

        this._lockHistory = true;
        this.showSection(index);
        this._lockHistory = false;
    }

    /**
     * Push new entry to the browser's navigation history, once another
     * <section> is shown. This method is called by this._showSection().
     *
     * @param  {Integer} newIndex Index of the new <section>, starting at 1
     * @param  {Integer} oldIndex Previous index or 0 if none
     */
    _pushNavigationHistory(newIndex, oldIndex) {
        if (this._lockHistory) return;

        let state = {
            index: newIndex,
        };

        let url = `#${newIndex}`;

        if (oldIndex == 0) {
            history.replaceState(JSON.stringify(state), "", url);
        } else {
            history.pushState(JSON.stringify(state), "", url);
        }
    }

    /**
     * Keyboard navigation. Switch visible <section> with Arrow Left, Arrow
     * Right, Space and Enter.

     * @param {DOMEvent} event Captured keyup event
     */
    _handleKeyUpEvent(event) {
        if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;

        switch (event.code) {
            case "ArrowLeft":
                // Previous <section>
                if (this.index > 1) {
                    this._showSection(this.index - 1);
                }
                break;
            case "ArrowRight":
            case "Enter":
            case "Space":
            case "KeyN":
                // Next <section>
                if (this.index < this.sections.length - 1) {
                    this._showSection(this.index + 1);
                }
                break;
        }
    }
}
