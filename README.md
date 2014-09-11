[![Dependency Status](https://gemnasium.com/cy6erskunk/shower-server.png)](https://gemnasium.com/cy6erskunk/shower-server)

shower-server
======

`shower-server` is a [node.js][2]-based server allowing multiple clients to view [Shower][1] slides in sync with presenter.

Kickstart
---------
At the moment three steps are required to start showing presentation

It is assumed, that machine you're installing `shower-server` on is called `example.com` and
you have `node` and `npm` installed.

1. install `shower-server` by running

        $> git clone git://github.com/cy6erskunk/shower-server.git && cd shower-server && npm install

2. copy your Shower presentation to `presentation` folder (presentation file along with theme stuff)
3. start `shower-server` by running `./bin/shower-server` and remember masterKey it shows in the console:

    ```shell
    Presentation  "presentation/index.html" is served at / with masterKey=403926033d001b5279df37cbbe5287b7c7c267fa
    ```

You can now open your presentation in browser (default port is `8080`, remember to add `master` parameter to the url
with `masterKey` value from the step 3 to let `shower-server` know that you're presenter, not a viever, e.g.:

    http://example.com:8080/?master=403926033d001b5279df37cbbe5287b7c7c267fa

Viewers can simply open the presentation URL (in the example earlier it would be `http://example.com:8080/`)
and have slides changing after the presenter.

CONFIG
------
Filename: `config.json`

Sample config:

    ```json
    {
        "host" : "",
        "port" : 8080,
        "presentations" : [
            {
                "folder" : "presentation",
                "master" : "lol"
            },
            {
                "folder" : "presentations/presentation1",
                "url"    : "ololo",
                "master" : "lol"
            },
            {
                "folder" : "presentations/presentation2",
                "url"    : "lol"
            },
            {
                "folder" : "presentation",
                "url"    : "nyan",
                "master" : "lol",
                "file"   : "index.html"
            }
        ]
    }
    ```
### Properties:

#### host
Type: `String`

Default: `''`

Hostname. Default means to accept connections directed to any IPv4 address

#### port
Type: `Number`

Default: `8080`

#### presentations
Type: `Array`

Optional. When absent, it's assumed that presentation is server at `/` from `./presentation/index.html`
with auto-generated `master-key` (so-called `singleMode`).

###### `singleMode`
This mode is enabled when there's no `presentations` array or there's only one object in it.
`presentation.url` is ignored and server serves presentation at `/`. Other options perform in usual way.

#### presentation
Type: `Object`

Description of presentation: folder, file, url, masterKey

##### presentation.folder
Type: `String`

Default (in `singleMode`): `'presentation'`

Optional in `singleMode`.

Path to folder containing presentation, relative to shower-server folder.

##### presentation.master
Type: `String`

Optional. String to pass as `GET` parameter to indicate presenter connection.
In case of absence is auto-generated and its value is shown in console when server starts.

##### presentation.url
Type: `String`

Default: `'/'` in `singleMode`, `'/' + presentation.folder + '/'` otherwise

Optional.

##### presentation.file
Type: `String`

Default: `'index.html'`

Optional.

Some features
-------------
### Disconnect button
#### Master
 - stops master from emitting page changes when disconnected
 - send additional update when master connects back

#### Viewer
 - unsubscribe from updates when disconnected
 - try to get current page when connecting back

DEPENDENCIES
------------

* [node.js][2]
* [Express][3]
* [socket.io][4]
* [iconv-lite][5]

# Versions
### 0.2.1
 - 'disconnect' button added

### 0.2.0
 - single/multi presentation modes
 - no manual editing of presentaion html file to include scripts
 - config file required

### 0.1.1
Multiple-presentations dirty proof of concept

### 0.1.0
Proof of concept

LICENSE
-------

For the full copyright and license information, please view the `LICENSE` file
that was distributed with this source code.


[1]: https://github.com/shower/shower
[2]: http://nodejs.org/
[3]: http://expressjs.com/
[4]: https://github.com/learnboost/socket.io
[5]: https://github.com/ashtuchkin/iconv-lite
