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
     * Yeah! The construktor. The optional configuration options may contain
     * the following attributes:
     *
     *   » tocStyle: "hamburger" to hide the toc behind a hamburger button
     *   » sectionTitle: Query string for HTML element to display the
     *                   section title
     *
     * @param {Object} options Configuration options (optional)
     */
    constructor(options) {
        options = options || {};
        this.tocStyle = options.tocStyle || "permanent";
        this.sectionTitle = options.sectionTitle || "";

        this.body = document.querySelector("body");
        this.sections = document.querySelectorAll("section");
        this.nav = document.querySelector("nav");

        this.index = 0;
        this.amount = 0;
        this.titlePrefix = document.title;

        window.addEventListener("hashchange", () => this._onHashChange());
        window.addEventListener("keyup", event => this._onKeyUp(event));
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
        this._cloneSections();
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
     * Resolve <section data-clone="#sec-xxx"></section> so that the section
     * referenced in data-clone will be duplicated.
     */
    _cloneSections() {
        document.querySelectorAll("section[data-clone]").forEach(element => {
            let source = document.querySelector(element.dataset.clone);
            if (!source) return;

            element.innerHTML = source.innerHTML;
            if (!element.dataset.title) element.dataset.title = source.dataset.title;
        });
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
        this.index = index;

        // Show requested <section>
        this._hideAllSections();

        let section = document.querySelector(`section[data-index="${index}"]`);
        if (!section) return;
        section.classList.remove("hidden");

        // Apply background color
        this.body.style.backgroundColor = section.dataset.backgroundColor || "";
        let backgroundImage = section.dataset.backgroundImage || "";

        if (backgroundImage) {
            this.body.style.backgroundImage = `url(${backgroundImage})`;
        } else {
            this.body.style.backgroundImage = "";
        }

        // Reset window scroll bars
        window.scrollTo(0, 0);

        // Update window title
        if (section.dataset.title) {
            document.title = `${this.titlePrefix} – ${section.dataset.title}`;
        } else {
            document.title = this.titlePrefix;
        }

        // Update central page title
        if (this.sectionTitle) {
            let titleElement = document.querySelector(this.sectionTitle);
            if (titleElement) titleElement.textContent = section.dataset.title;
        }

        // Highlight current <section> in the Table of Contents
        document.querySelectorAll("#toc li a").forEach(link => link.classList.remove("active"));
        let link = document.querySelector(`#toc li[data-index="${index}"] a`);
        if (link) link.classList.add("active");

        // Update navigation links
        if (this.nav) {
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
            if (this.sectionTitle) return;

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

        if (this.tocStyle === "hamburger") {
            let buttonElement = document.createElement("div");
            buttonElement.classList.add("toc-hamburger-button");
            buttonElement.classList.add("icon-menu");

            let menuElement = document.createElement("div");
            menuElement.classList.add("toc-hamburger-menu");
            menuElement.classList.add("hidden");
            tocElements.forEach(element => menuElement.appendChild(element));

            sectionToc.appendChild(buttonElement);
            sectionToc.appendChild(menuElement);

            buttonElement.addEventListener("click", () => {
                if (menuElement.classList.contains("hidden")) {
                    menuElement.classList.remove("hidden");
                } else {
                    menuElement.classList.add("hidden");
                }
            })
        } else {
            tocElements.forEach(element => sectionToc.appendChild(element));
        }
    }

    /**
     * Minimal single page router. Switch the currently visible section
     * mentioned in the URL hash.
     */
    _onHashChange() {
        let index = parseInt(location.hash.slice(1));

        if (index == NaN) {
            index = 1;
        }

        this._showSection(index);
    }

    /**
     * Keyboard navigation. Switch visible <section> with Arrow Left, Arrow
     * Right, Space and Enter.

     * @param {DOMEvent} event Captured keyup event
     */
    _onKeyUp(event) {
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
                // Next <section>
                if (this.index < this.sections.length - 1) {
                    this._showSection(this.index + 1);
                }
                break;
        }
    }
}
