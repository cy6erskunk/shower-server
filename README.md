README
======

`shower-server` is a simple server allowing multiple clients to view [Shower][1] slides in sync with presenter.

DEPENDENCIES
------------

* [node.js][2]
* [Express][3]
* [socket.io][4]

INSTALLATION
------------

Clone the Github repository. Update the vendor libraries:

    $> git clone git://github.com/cy6erskunk/shower-server.git
    $> npm install


USAGE
-----

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

## Versions
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
