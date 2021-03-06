## RQ-essentials

[![Build Status](https://travis-ci.org/eirikt/RQ-essentials.svg)](https://travis-ci.org/eirikt/RQ-essentials)
&nbsp;
[![Dependency Status](https://www.versioneye.com/user/projects/5533939210e7149066000fe4/badge.svg?style=flat)](https://www.versioneye.com/user/projects/5533939210e7149066000fe4)
&nbsp;
[![Codacy Badge](https://www.codacy.com/project/badge/317c938385f6499ea0ac392d58d43001)](https://www.codacy.com/app/eiriktorske/RQ-essentials)
&nbsp;
[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/eirikt/RQ-essentials/blob/master/README.md#license)

Some basic ("essential") add-ons for Douglas Crockford's excellent [RQ][1] library.
Most of them quite influenced by RQ's [official documentation][2].

This library uses a CommonJS-compliant [fork][3] of RQ.
(RQ is [not][4] CommonJS-compliant.)

For this library to work client-side, send e.g. the `index.js` file through [Browserify][20].
(The resulting `rq-essentials.js` is 400 MB.)


### Usage

Documentation and usage examples will be added, bit by bit - and somewhat finalized in v0.1.0.
Then this library will be published to [npm][10], I guess.

<strong>[Preliminary documentation](http://eirikt.github.io/RQ-essentials/global.html#identity)</strong>
(The documented functions are situated below the "Methods" header, the rest above, under the "Members" header ...)


### [License](#license)
The MIT License (MIT)

Copyright (c) 2015-2016 Eirik Torske

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


[1]:  https://github.com/douglascrockford/RQ
[2]:  http://rq.crockford.com
[3]:  https://github.com/eirikt/RQ
[4]:  https://github.com/douglascrockford/RQ/pull/7#issuecomment-94266330
[10]: https://www.npmjs.com
[20]: http://browserify.org
