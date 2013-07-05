[![Dependency Status](https://gemnasium.com/cy6erskunk/shower-server.png)](https://gemnasium.com/cy6erskunk/shower-server)

README
======

`shower-server` is a simple server allowing multiple clients to view [Shower][1] slides in sync with presenter.

DEPENDENCIES
------------

* [node.js][2]
* [Express][3]
* [socket.io][4]
* [iconv-lite][5]

INSTALLATION
------------

Clone the Github repository. Update the vendor libraries:

    $> git clone git://github.com/cy6erskunk/shower-server.git
    $> npm install


USAGE
-----

## Single presentation mode

1. Put your presentation into `presentation` folder
1. Append

    ```html
    <script src="/socket.io/socket.io.js"></script>
    <script type="text/javascript" src="/client.js"></script>
    ```

    to the `head` of your presentation `index.html`
1. Run `./bin/shower-server`
    You'll get a message in console

    ```
    ############################################
    #                                          #
    #              YOUR MASTER KEY:            #
    #                                          #
    # 403926033d001b5279df37cbbe5287b7c7c267fa #
    #                                          #
    ############################################
    ```
1. Open your presentation at

    `http://%%YOUR_HOST_GOES_HERE%%:3000/?master=%%KEY_FROM_PREVIOUS_STEP_GOES_HERE%%`
1. Viewers can connect at

    `http://%%YOUR_HOST_GOES_HERE%%:3000/`

## Multiple presentations mode

1. Put your presentations in some folders in shower-server folder
1. Put `config.json` file in the root of shower-server folder
    E.g.:
    
    ```json
    {
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
                "url"    : "lol",
                "master" : "lol"
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
    + `url` defaults to `folder`
    - `file` defaults to `index.html`
    - `master` may be absent, masterKey will be generated for you

    Messages are broadcated by `url`, so the same presentation may be shown by several masters

1. Run `./bin/shower-server`
    You'll get informational message in console, something like
    
    ```shell
    Presentation  "presentation/index.html" is served at /presentation with masterKey=lol
    Presentation  "presentations/presentation1/index.html" is served at /ololo with masterKey=lol
    Presentation  "presentations/presentation2/index.html" is served at /lol with masterKey=lol
    Presentation  "presentation/index.html" is served at /nyan with masterKey=lol
    ```
1. Open your presentation to

    `http://%%YOUR_HOST_GOES_HERE%%:3000/%%url%%/?master=%%MASTER_KEY_FROM_CONFIG_GOES_HERE%%`
1. Viewers can connect to

    `http://%%YOUR_HOST_GOES_HERE%%:3000/%%url%%/`

bla-bla-bla...

# Versions
## 0.1.0
Proof of concept

### 0.1.1
Multiple-presentations dirty proof of concept

LICENSE
-------

For the full copyright and license information, please view the `LICENSE` file
that was distributed with this source code.


[1]: https://github.com/shower/shower
[2]: http://nodejs.org/
[3]: http://expressjs.com/
[4]: https://github.com/learnboost/socket.io
[5]: https://github.com/ashtuchkin/iconv-lite
