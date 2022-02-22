mini-tutorial.js - Beautiful HTML tutorials with minimal effort
===============================================================

Documentation
-------------

 * See mini-tutorial.js in action: [Manual](https://www.wpvs.de/repo/mini-tutorial/manual/#1)
 * Real-world example of the book template: [Unfinished web development book](https://www.wpvs.de/repo/webprog/browser-app/#1)
 * Download the [manual source code](https://www.github.com/DennisSchulmeister/mt-manual)

Templates to get started:

 * [Simple template](https://www.github.com/DennisSchulmeister/mt-template-simple)
 * [Book template](https://www.github.com/DennisSchulmeister/mt-template-book)
 * [Roundbox template](https://www.github.com/DennisSchulmeister/mt-template-roundbox)
 * [Slideshow template](https://www.github.com/DennisSchulmeister/mt-template-slideshow)

What is it
----------

This is the little brother of [lecture-slides.js](https://www.github.com/DennisSchulmeister/lecture-slides.js)
to create simple HTML manuals and presentations without much effort, solving
a problem of mine:  For my lectures I wanted to be able to put tutorials
online without much effort. Tiny manuals or documentation pages with a clean
and beautiful look and a possibility to browse between chapters. This is,
instead of simply showing a long HTML page, it should be possible to only show
one chapter at a time and read through them like a book.

This package is intentionaly kept simple. Though some compatibility with
`lecture-slides.js` is maintained, it is lacking heavy features like a
full-blown UI or print/export optimized rendering. The main purpose is to read
the content on screen, which can be done with one simple VanilaJS class and
(almost) no dependencies. Only two dependencies are added for common utilities
shared with `lecture-slides.js` and `hammer.js` for optional touch navigation.

Using the built-in themes different types of documents like short manuals, books
or simple slideshows can be rendered.

White Theme
-----------

This is the `white.css` theme with probably the most simple layout:

![Screenshot](screenshots/simple.png)

See: https://www.github.com/DennisSchulmeister/mt-template-simple

Book Layout
-----------

Extension to `white.css` called `book.css` for large documents with a book-like
structure:

![Screenshot](screenshots/book.png)

See: https://www.github.com/DennisSchulmeister/mt-template-book

Roundbox Layout
---------------

Alternative to `white.css` called `roundbox.css` for a more playful design:

![Screenshot](screenshots/roundbox.png)

See: https://www.github.com/DennisSchulmeister/mt-template-roundbox

Slideshow Layout
----------------

Alternative to the other css files for a simple slideshow presentation:

![Screenshot](screenshots/slideshow.png)

See: https://www.github.com/DennisSchulmeister/mt-template-slideshow

Copyright
---------

mini-tutorial.js (https://www.github.com/DennisSchulmeister/mini-tutorial.js) <br/>
© 2018 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
